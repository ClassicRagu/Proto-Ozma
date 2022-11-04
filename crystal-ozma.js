const { Client,
  Events,
  GatewayIntentBits,
  MessageReaction,
  Partials
} = require("discord.js");
const { getCountdownString } = require('./functions/CountdownFunctions/getCountdownString')
const { getFineCountdownString } = require('./functions/CountdownFunctions/getFineCountdownString')
const { getDate, getDayOfWeek, getServerTime, getLocalTime, getMonth } = require('./functions/GeneralTimeFunctions/index')
const { buildPartyLeaderEmbed,
  buildServerTimeEmbed,
  buildCountdownEmbed,
  buildPasswordEmbed,
  buildNoPasswordEmbed,
  buildScheduleEmbed,
  buildExternalAnnounceCancelled,
  buildExternalAnnounceOngoing,
  buildExternalAnnounceNewRun,
  buildCountdownNoScheduleEmbed } = require('./functions/EmbedFunctions/index')
const { getReactionPartyNumber } = require('./functions/ReactionFunctions/getReactionPartyNumber')
const client = new Client({
  intents: [GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const config = require('./config.json')
const mariadb = require("mariadb");

const pool = mariadb.createPool(config.sqlLogin); // REMOTE

const serverInfo = config.serverInfo

const blacklist = require("./blacklist"); //group lead signup blacklist
const ozmablack = require("./ozmablack"); //Countermeasures

client.once(Events.ClientReady, async () => {
  console.log("[" + getLocalTime() + "] Connected to Discord");
  client.user.setActivity("powering up the bass cannon.");
  const guild = await client.guilds.fetch(serverInfo.id);
  guild.channels.cache.get(serverInfo.channels.partyLeader);
})


client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
  if (newMessage.content.includes("[Original Message Deleted]")) {
    newMessage.delete()
  }
});

//Functions
function commandError(message, reply) {
  message.reply(reply).then((msg) => {
    setTimeout(() => msg.delete(), 120000)
  }).catch((error) => console.log(error));
  setTimeout(() => message.delete(), 120000)
}

function pad(pad, str, padLeft) {
  if (typeof str === "undefined") return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}


Object.defineProperty(String.prototype, "hashCode", {
  value: function () {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
});


//Timed Functions
function clockFunctions() {
  let currentDate = new Date();
  if (client.ws.status === 0) {
    let cafe = client.guilds.cache.get(serverInfo.id);
    let channelServerTime = client.channels.cache.get(
      serverInfo.channels.serverTime
    );
    let channelNextRunType = client.channels.cache.get(
      serverInfo.channels.nextRunType
    );
    let channelNextRunTime = client.channels.cache.get(
      serverInfo.channels.nextRunTime
    );
    let channelNextRunPasscode = client.channels.cache.get(
      serverInfo.channels.nextRunPasscode
    );
    let channelSchedule = client.channels.cache.get(
      serverInfo.channels.schedule
    );
    let channelArsenal = client.channels.cache.get(
      serverInfo.channels.runinprogress
    );
    let channelLeads = client.channels.cache.get(
      serverInfo.channels.partyLeader
    );
    let channelAnnounce = client.channels.cache.get(
      serverInfo.channels.baAnnounce
    );
    let embedServerTime = buildServerTimeEmbed(currentDate, serverInfo)
    channelServerTime.messages
      .fetch(serverInfo.posts.serverTime)
      .then((msg) => {
        msg.edit({ embeds: [embedServerTime] });
      });
    pool.query(
      "SELECT `Type`, `Start`, `RL`, `Description`, `ID`, `Plusone` FROM `Runs` WHERE `Start` > ? AND `Cancelled` = 0 ORDER BY `Start` ASC LIMIT 10",
      [currentDate.getTime()]
    )
      .then((row) => {
        let embedDescription = "";
        let previousDate = "";
        row.forEach((run) => {
          let runTime = new Date();
          runTime.setTime(run.Start);
          let runDate = getDate(runTime);
          let raidLeader = cafe.members.cache.get(run.RL).displayName;
          let runPlusone = "";
          if (run.Plusone ||
            Math.round(run.Start) < (Date.now() + 7200000)) {
            runPlusone = serverInfo.emoji.plusOneNo; //No
          }
          if (!run.Plusone &&
            !(Math.round(run.Start) < (Date.now() + 7200000))) {
            runPlusone = serverInfo.emoji.plusOneYes; //Yes
          }
          if (runDate !== previousDate) {
            embedDescription +=
              "**" + `__${getDayOfWeek(runTime)} ${runDate}__` + "**" + `\n`;
            previousDate = runDate;
          }
          if (run.Type === "OPEN") {
            embedDescription += `**${run.ID}: ${run.Type} Run**\n●*Your Local Start Time:* __<t:${Math.round(run.Start / 1000)}:F>__\n●__Raid Leader__: ${raidLeader}\n●__Run Notes:__ ${run.Description}\n●Can I request a !plusone if I'm new to BA? ${runPlusone}\n\n`;
          } else {
            embedDescription += `**${run.ID}: ${run.Type} Run**\n●*Your Local Start Time:* __<t:${Math.round(run.Start / 1000)}:F>__\n●__Raid Leader__: ${raidLeader}\n●__Run Notes:__ ${run.Description}\n\n`;
          }
        });
        if (embedDescription === "") {
          embedDescription =
            "There are currently no scheduled runs.\nPlease check back here shortly for further information.";
        }
        let embedHash = embedDescription.hashCode();
        channelSchedule.messages
          .fetch(serverInfo.posts.schedule)
          .then((msg) => {
            if (!msg.embeds[0].description.includes(embedHash)) {
              embedDescription +=
                `\n\n[Google Calendar Link](${config.calendar})` +
                "\n||" +
                "Post Hash: " +
                embedHash +
                "||";
              let embedSchedule = buildScheduleEmbed(serverInfo, embedDescription)
              msg.edit({ embeds: [embedSchedule] });
            }
          });
      })
      .catch((error) => console.log(error));
    pool.query(
      "SELECT * FROM `Runs` WHERE `Start` < ? AND `CANCELLED` = 0 ORDER BY `Start` DESC LIMIT 1",
      [currentDate.getTime() + 1200000]
    )
      .then((row) => {
        if (row[0] !== undefined) {
          if ((Date.now() - 4680000) > row[0].Start) {
            channelArsenal.setRateLimitPerUser(0, "Slowmode Off");
          }
          else if ((Date.now() + 900000) > row[0].Start) {
            channelArsenal.setRateLimitPerUser(30, "Slowmode On");
          }
        }
      }).catch((error) => console.log(error));
    pool
      .query(
        "SELECT * FROM `Runs` WHERE `Start` > ? AND `Cancelled` = 0 ORDER BY `Start` ASC LIMIT 1",
        [currentDate.getTime()]
      )
      .then((row) => {
        if (typeof row[0] !== "undefined") {
          let targetDate = new Date();
          targetDate.setTime(row[0].Start);
          client.user.setActivity("in " + getFineCountdownString(targetDate));
          let timeString = getCountdownString(targetDate);
          let embedCountdown = buildCountdownEmbed(serverInfo, cafe, row, targetDate)
          channelServerTime.messages
            .fetch(serverInfo.posts.nextRun)
            .then((msg) => {
              if (
                msg.embeds[0].title != embedCountdown.title || msg.embeds.fields === undefined ||
                embedCountdown.fields[5].value !== msg.embeds[0].fields[5].value
              ) {
                msg.edit({ embeds: [embedCountdown] });
              }
            });
          let nextRunType =
            serverInfo.emoji.nextRun + ' Next Run: "' + row[0].Type + '"';
          let nextRunTime =
            serverInfo.emoji.hourglass +
            " " +
            getDayOfWeek(targetDate) +
            " " +
            getServerTime(targetDate.getTime());
          if (channelNextRunType.name !== nextRunType) {
            channelNextRunType.setName(nextRunType);
          }
          if (getDate(currentDate) === getDate(targetDate)) {
            nextRunTime =
              serverInfo.emoji.hourglass +
              " Today " +
              getServerTime(targetDate.getTime());
          }
          if (channelNextRunTime.name !== nextRunTime) {
            channelNextRunTime.setName(nextRunTime);
          }
          if (timeString === "1 hour") {
            let passcodeDate = targetDate.getTime();
            passcodeDate = passcodeDate - 1800000;
            channelNextRunPasscode.setName(
              serverInfo.emoji.passcode +
              " Password at " +
              getServerTime(passcodeDate)
            );
            channelNextRunPasscode.permissionOverwrites.edit(cafe.id, {ViewChannel: true})
          }
          if (timeString === "55 minutes." && row[0].PasscodeMain > 0) {
            client.users.cache
              .get(row[0].RL)
              .send(
                "Raid Leader Notification:\nPassword for Main Parties will be " +
                row[0].PasscodeMain +
                "\nThis message has been sent to Party Leaders 1-6." +
                "\nPassword for Support will be " +
                row[0].PasscodeSupport +
                "\nThis message has been sent to the Support Party Leader.\nThe passwords will be posted automatically 30 minutes before the run."
              ).catch((error) => console.log(error));
            for (let i = 1; i < 8; i++) {
              if (i < 7) {
                if (row[0]["PL" + i] !== "-") {
                  let elementsArray = [
                    "None",
                    "Earth (Art 1)",
                    "Wind (Art 2)",
                    "Water (Art 3)",
                    "Fire (Owain 1)",
                    "Lightning (Owain 2)",
                    "Ice (Owain 3)",
                  ];
                  client.users.cache
                    .get(row[0]["PL" + i])
                    .send(
                      `Party Finder Information:\n${config.serverName} BA - ` +
                      row[0].Type +
                      " Run, Party " +
                      elementsArray[i] +
                      "\nPassword will be " +
                      row[0].PasscodeMain
                    ).catch((error) => console.log(error));
                }
              } else {
                if (row[0].PLS !== "-") {
                  client.users.cache
                    .get(row[0].PLS)
                    .send(
                      `Party Finder Information:\n${config.serverName} BA - ` +
                      row[0].Type +
                      " Run, Support Party\nThe support password will be " +
                      row[0].PasscodeSupport +
                      ", _please note this password is uniquely generated for the Support Party only_."
                    ).catch((error) => console.log(error));
                }
              }
            }
          }
          if (timeString === "30 minutes.") {
            channelNextRunPasscode.setName(
              serverInfo.emoji.passcode + " PF Open"
            );
            if (row[0].PasscodeMain > 0) {
              let runPings = "<@&" + serverInfo.roles.flex.eurekaRaider + ">";
              let passcodeChannel = serverInfo.channels.passcodePG;
              if (
                row[0].Type === "RC" ||
                row[0].Type === "RECLEAR"
                //row[0].Type === "ReClear" ||
                //row[0].Type === "Reclear"
              ) {
                runPings = "<@&" + serverInfo.roles.flex.ozmaKiller + ">";
              }
              let embedPasscode = buildPasswordEmbed(serverInfo, row, cafe)
              client.channels.cache.get(passcodeChannel).send({ embeds: [embedPasscode] }).then((embedMessage) => {
                setTimeout(() => embedMessage.delete(), 3600000)
              }).catch((error) => console.log(error));
              client.channels.cache.get(passcodeChannel).send(runPings).then((msg) => {
                setTimeout(() => msg.delete(), 3600000)
              }).catch((error) => console.log(error));
            } else {
              let embedNoPasscode = buildNoPasswordEmbed
              client.channels.cache.get(serverInfo.channels.passcodePG).send({ embeds: [embedNoPasscode] });
            }
          }
          if (timeString === "15 minutes.") {
            channelArsenal.send(
              `There is currently an active BA run. Please keep this chat relevant *to the current run* and take any unrelated questions or comments to <#${serverInfo.channels.scheduleChat}>.\n\nRaid Leads, Gremlins, or staff not actively moderating: ${serverInfo.emojiFull.activeRun}`
            );
          }
          if (timeString === "1 minutes.") {
            let announceEdit = buildExternalAnnounceOngoing(row, cafe, `This ${config.serverAbbr} run has started.`)
            channelLeads.messages.fetch(row[0].EmbedID)
              .then((message) => {
                message.delete();
              }).catch((error) => console.log(error));
            channelAnnounce.messages.fetch(row[0].AnnounceEmbedID)
              .then((message) => {
                message.edit({ embeds: [announceEdit] });
              }).catch((error) => console.log(error));
              channelNextRunPasscode.permissionOverwrites.edit(cafe.id, {ViewChannel: false})
          }
          if ((Math.round(row[0].Start) < (Date.now() + 86400000)) && (row[0].AnnounceEmbedID === null) && (row[0].Cancelled === 0)) {
            let runID = row[0].ID;
            let announceEmbed = buildExternalAnnounceNewRun(row, cafe)
            client.channels.cache
              .get(serverInfo.channels.baAnnounce)
              .send({ embeds: [announceEmbed] })
              .then(async (sentAnnounce) => {
                pool.query("UPDATE `Runs` SET `AnnounceEmbedID` = ? WHERE `ID` = ?", [sentAnnounce.id, runID]);
              })
              .catch((error) => console.log(error));
          }
        } else {
          let embedCountdown = buildCountdownNoScheduleEmbed(serverInfo)
          channelServerTime.messages
            .fetch(serverInfo.posts.nextRun)
            .then((msg) => {
              if (msg.embeds[0].title != embedCountdown.title) {
                client.user.setActivity("in the Proto-Ozma Containment Unit");
                msg.edit({ embeds: [embedCountdown] });
              }
            });
          let nextRunType = serverInfo.emoji.nextRun + ' Next Run: "TBC"';
          let nextRunTime = serverInfo.emoji.hourglass + " See Schedule";
          if (channelNextRunType.name !== nextRunType) {
            channelNextRunType.setName(nextRunType);
          }
          if (channelNextRunTime.name !== nextRunTime) {
            channelNextRunTime.setName(nextRunTime);
          }
        }
      })
      .catch((error) => console.log(error));
  }
  var Interval = (60 - currentDate.getUTCSeconds()) * 1000 + 5;
  setTimeout(clockFunctions, Interval);
}
clockFunctions();

client.on(Events.MessageCreate, (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let currentDate = new Date();
  let channelSchedule = client.channels.cache.get(
    serverInfo.channels.scheduleChat);
  if (
    command === "cancel" &&
    msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
  ) {
    let cafe = client.guilds.cache.get(serverInfo.id);
    let channelLeads = client.channels.cache.get(serverInfo.channels.partyLeader);
    let channelAnnounce = client.channels.cache.get(serverInfo.channels.baAnnounce);
    if (args.length === 1) {
      pool.query("UPDATE `Runs` SET `Cancelled` =  1 WHERE `ID` = ?", [
        args[0],
      ]) &&
        pool.query("SELECT * FROM `Runs` WHERE `ID` = ?", [args[0]])
          .then((row) => {
            let announceCancel = buildExternalAnnounceCancelled(row, cafe, `This ${config.serverAbbr} run has been canceled.`)
            let raidLeader = cafe.members.cache.get(row[0].RL).id;
            channelLeads.messages.fetch(row[0].EmbedID)
              .then((message) => {
                message.delete();
              }).catch(() => {
                console.error('Party Lead message failed to delete, run had likely already started.')
              });
            if (row[0].AnnounceEmbedID != null) {
              channelAnnounce.messages.fetch(row[0].AnnounceEmbedID)
                .then((message) => {
                  message.edit({ embeds: [announceCancel] });
                }).catch((error) => console.log(error))
            }
            if (raidLeader != msg.author.id) {
              msg.reply(
                `you cancelled run ${args[0]} scheduled by <@${raidLeader}>.`
              );
            } else {
              msg.reply(`you cancelled run ${args[0]}.`);
            }
          });
    }
  }
  if (
    command === "noplusone" &&
    msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
  ) {
    let cafe = client.guilds.cache.get(serverInfo.id)
    if (args.length === 1) {
      pool.query("UPDATE `Runs` SET `Plusone` = 1 WHERE `ID` = ?", [
        args[0],
      ]) &&
        pool.query("SELECT * FROM `Runs` WHERE `ID` =?", [args[0]])
          .then((row) => {
            let raidLeader = cafe.members.cache.get(row[0].RL).id;
            if (raidLeader != msg.author.id) {
              msg.reply(
                `you set run ${args[0]}, hosted by <@${raidLeader}>, to no longer accepting +1 requests.`
              );
            } else {
              msg.reply(`you set run ${args[0]} to no longer accepting +1 requests.`)
            }
          });
    }
  }
  if (
    command === "plusone" && msg.channel.type != 'dm'
  ) {
    setTimeout(() => msg.delete().catch(() =>
      console.error('Failed to delete +1 message, most likely deleted beforehand'))
      , 120100)
    let cafe = client.guilds.cache.get(serverInfo.id);
    pool.query("SELECT * FROM `Runs` WHERE `Start` > ? AND `Type` != 'RC' AND `Type` != 'MEME' AND `Type` != 'LOWMAN' AND `Type` != 'RECLEAR' AND  `Cancelled` = 0 AND `Plusone` = 0 ORDER BY `Start` ASC LIMIT 2", [currentDate.getTime()]
    )
      .then((row) => {
        if (row.length === 0) {
          msg.author.send("Sorry, there are no runs scheduled at this time, please check back later.");
        } else {
          let raidLeader = cafe.members.cache.get(row[0].RL).id;
          let raidLeaderT = cafe.members.cache.get(row[0].RL).displayName;
          let nextraidLeader = row[1] ? cafe.members.cache.get(row[1].RL).id : '';
          let nextraidLeaderT = row[1] ? cafe.members.cache.get(row[1].RL).displayName : '';
          if (ozmablack.includes(msg.author.id)) return;
          else if (msg.member.roles.cache.has(serverInfo.roles.flex.baCaller) && !msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)) {
            msg.reply(
              "Why would a caller need to use !plusone? You know how to look at a schedule.");
          }
          else if (msg.member.roles.cache.has(serverInfo.roles.special.ozmaChampion) && !msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)) {
            msg.reply(
              "You're an Ozma Champ. You must be an Ozma Chump if you need a !plusone.");
          }
          else if (msg.member.roles.cache.has(serverInfo.roles.flex.ozmaKiller) && !msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)) {
            msg.reply(
              "Looks like you have the Ozma Cleared role, !plusone is for first time clears only. Go unreact to that role in <#1035070783178952804> if you haven't cleared BA!");
          }
          else if (((Math.round(row[0].Start) > (Date.now() + 7200000)) && (Math.round(row[0].Start) < (Date.now() + 172800000)))) {
            msg.author.send(
              `Hello! The next available run for +1's is ${row[0].ID}, which is a ${row[0].Type} run.\nStart time(Your device time): <t:${Math.round(row[0].Start / 1000)}:F>, <t:${Math.round(row[0].Start / 1000)}:R>.
              \nContact <@${raidLeader}> aka ${raidLeaderT}, if you haven't cleared BA and you're interested in getting a spot reserved.`).catch((error) => console.log(error));
          }
          else if (row[1] === undefined) {
            msg.author.send("Sorry, there are no runs scheduled at this time that are accepting +1's, please check back later.")
          }
          else if (((Math.round(row[0].Start) < (Date.now() + 7200000)) && (Math.round(row[1].Start) < (Date.now() + 172800000)))) {
            msg.author.send(
              `Hello! The next available run for +1's is ${row[1].ID}, which is a ${row[1].Type} run.\nStart time(Your device time): <t:${Math.round(row[1].Start / 1000)}:F>, <t:${Math.round(row[1].Start / 1000)}:R>.
              \nContact <@${nextraidLeader}> aka ${nextraidLeaderT}, if you haven't cleared BA and you're interested in getting a spot reserved.`).catch((error) => console.log(error));
          }
          else {
            msg.author.send(`The next avaiable run for requesting +1's for is more than 48 hours away. Run this command again closer to your desired runtime. Click here to see the schedule: <#${serverInfo.channels.schedule}>.
        \nPlease note that only Open runs will return using this command.`)
          }
        }
      }).catch((error) => console.log(error));
  }
  if (
    command === "schedule" &&
    msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
  ) {
    if (msg.channel.id != channelSchedule) {
      commandError(msg, `Please schedule BA runs in <#${serverInfo.channels.scheduleChat}>`);
      return;
    }
    if (args[0] === "add" || args[0] === "nopw") {
      let postFormat =
        "Format: _!schedule add <type> <dd-mmm-yy> <hh:mm> (optional: description)_\n" +
        "i.e. _!schedule add open 16-jun-20 19:00_\n" +
        "i.e. _!schedule add open 16-jun-20 19:00 Description goes here_";
      let valueDescription = "N/A";
      let queryFieldDescription = "";
      if (args.length < 4) {
        commandError(msg, "Insufficient information provided.\n" + postFormat);
        return;
      }
      if (args.length > 4) {
        let postArray = args.slice(4);
        valueDescription = ", '" + postArray.join(" ") + "'";
        queryFieldDescription = ", `Description`";
      }
      let runType = "";
      let runDate = new Date();
      let runTime = "";
      let regExp = /([0-9]*)-([A-Za-z]{3})-([0-9]*)\w+/;
      let type = args[1].toLowerCase();
      if (
        type === "open" ||
        type === "lowman" ||
        type === "lm" ||
        type === "meme" ||
        type === "rc" ||
        type === "reclear"
      ) {
        runType = args[1].toUpperCase();
        if (regExp.test(args[2])) {
          let arrayDate = args[2].split("-");
          runDate.setUTCDate(arrayDate[0]);
          runDate.setUTCMonth(getMonth(arrayDate[1]));
          runDate.setUTCFullYear("20" + arrayDate[2]);
          regExp = /([0-9]{2}):([0-9]{2})/g;
          let passcodeMain = 0;
          let passcodeSupport = 0;
          if (args[0] === "add") {
            passcodeMain = pad("0000", Math.floor(Math.random() * 10000), true);
            passcodeSupport = pad(
              "0000",
              Math.floor(Math.random() * 10000),
              true
            );
            while (passcodeSupport === passcodeMain) {
              passcodeSupport = pad(
                "0000",
                Math.floor(Math.random() * 10000),
                true
              );
            }
          }
          if (regExp.test(args[3])) {
            let arrayTime = args[3].split(":");
            runDate.setUTCHours(arrayTime[0], arrayTime[1], 0, 0);
            runTime = runDate.getTime();
            if (runTime < currentDate.getTime()) {
              commandError(
                msg,
                "The date and time specified has already occured, the run must be in the future."
              );
              return;
            } else if (runTime > (Date.now() + 15768000000)) {
              commandError(
                msg,
                "The date specified is too far into the future, please select a date within exactly 182.5 days from now."
              );
              return;
            } else {
              pool
                .query(
                  "INSERT INTO `Runs` (`Type`, `Start`, `PasscodeMain`, `PasscodeSupport`, `RL`, `PL1`, `PL2`, `PL3`, `PL4`, `PL5`, `PL6`, `PLS`" +
                  queryFieldDescription +
                  ")" +
                  " VALUES (?, ?, ?, ?, ?, '-', '-', '-', '-', '-', '-', '-'" +
                  valueDescription +
                  ")",
                  [
                    runType,
                    runTime,
                    passcodeMain,
                    passcodeSupport,
                    msg.member.id,
                  ]
                )
                .then((row) => {
                  let runID = row.insertId;
                  pool.query("SELECT * FROM `Runs` WHERE `ID` = ?", [runID])
                    .then((row) => {
                      msg.channel.send(
                        `${runType} Run added: <t:${Math.round(row[0].Start / 1000)}:F>.\nRun ID: ${runID}`
                      );
                    })
                  pool
                    .query("SELECT * FROM `Runs` WHERE `ID` = ?", [runID])
                    .then((run) => {
                      if (run[0].PasscodeMain > 0) {
                        let embedPartyLeader = buildPartyLeaderEmbed(run, client, serverInfo);
                        client.channels.cache
                          .get(serverInfo.channels.partyLeader)
                          .send({ embeds: [embedPartyLeader] })
                          .then(async (sentEmbed) => {
                            await sentEmbed.react(serverInfo.emoji.elementEarth);
                            await sentEmbed.react(serverInfo.emoji.elementWind);
                            await sentEmbed.react(serverInfo.emoji.elementWater);
                            await sentEmbed.react(serverInfo.emoji.elementFire);
                            await sentEmbed.react(serverInfo.emoji.elementLightning);
                            await sentEmbed.react(serverInfo.emoji.elementIce);
                            await sentEmbed.react(serverInfo.emoji.bunny);
                            pool.query("UPDATE `Runs` SET `EmbedID` = ? WHERE `ID` = ?", [sentEmbed.id, runID]);
                          });
                      }
                    })
                    .catch((error) => console.log(error));
                })
                .catch((error) => console.log(error));
            }
          } else {
            commandError(
              msg,
              "Invalid time specified.\nFormat: <hh:mm> in ST, i.e. 22:32."
            );
            return;
          }
        } else {
          commandError(
            msg,
            "Invalid date specified.\nFormat: <dd-mmm-yy>, i.e. 23-Sep-19."
          );
          return;
        }
      } else {
        commandError(
          msg,
          "Invalid run type specified.\nOptions: Open, RC or Reclear, Lowman, Meme"
        );
        return;
      }
    }
  }
  if (command === "waymark" || command === "waymarks" || command === "ohimarks" || command === "ohimark") {
    if (args.length > 0) {
      let boss = args[0].toLowerCase();
      let bossName = "";
      if (boss.includes("av")) {
        bossName = "Absolute Virtue";
      } else if (boss.includes("ozma")) {
        bossName = "Proto-Ozma";
      } else if (boss.includes("elements")) {
        bossName = "Elemental Rooms";
      } else if (boss.includes("raiden")) {
        bossName = "Raiden";
      }
      if (bossName) {
        let post = "Waymark Placement for " + bossName;
        if (boss.includes("ozma")) {
          post +=
            " (Substitute B with A, B, or C as appropriate to your platform).";
        }
        msg.channel.send({
          content: post,
          files: ["https://cdn.rosaworks.uk/proto-ozma/boss-" + boss + ".png"],
        });
        if (boss.includes("ozma")) {
          msg.channel.send({
            content: "**Acceleration Bomb!**",
            files: [
              "https://cdn.discordapp.com/attachments/562248073166848027/568801915014610954/Clipboard_20190325_040024.png",
            ],
          });
        }
      }
    }
  }
  if (command === "element" || command === "elements" || command === "rooms") {
    let post = "Elemental Room Assignments";
    msg.channel.send({
      content: post,
      files: ["https://cdn.rosaworks.uk/proto-ozma/boss-elements.png"],
    });
  }
  if (command === "portals") {
    let post =
      "/macrolock\n" +
      "/p Portal 1: <1>\n" +
      "/p Portal 2: <2>\n" +
      "/p Portal 3: <3>\n" +
      "/p Portal 4: <4>\n" +
      "/p Portal 5: <5>\n" +
      "/p Portal 6: <6>\n" +
      "/p Portal 7: <7>\n" +
      "/p Portal 8: <8>\n";
    msg.channel.send({
      content: post,
      files: [
      "https://cdn.discordapp.com/attachments/759118863085469756/759119014499844166/UC9QI0G.jpg",
      ],
    });
  }
  if (
    command === "ozmaplz" &&
    msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
  ) {
    pool
      .query(
        "SELECT * FROM `Runs` WHERE `Start` > ? AND `Cancelled` = 0 ORDER BY `Start` ASC LIMIT 1",
        [currentDate.getTime()]
      )
      .then((row) => {
        if (typeof row[0] !== "undefined") {
          let targetDate = new Date();
          targetDate.setTime(row[0].Start);
          let timeString = getCountdownString(targetDate);
          if (timeString <= "50 minutes." && row[0].PasscodeMain > 0) {
            client.users.cache
              .get(row[0].RL)
              .send(
                "Raid Leader Notification:\nPassword for Main Parties will be " +
                row[0].PasscodeMain +
                "\nThis message has been sent to Party Leaders 1-6." +
                "\nPassword for Support will be " +
                row[0].PasscodeSupport +
                "\nThis message has been sent to the Support Party Leader.\nThe passwords will be posted automatically 30 minutes before the run."
              );
            for (let i = 1; i < 8; i++) {
              if (i < 7) {
                if (row[0]["PL" + i] !== "-") {
                  let elementsArray = [
                    "None",
                    "Earth (Art 1)",
                    "Wind (Art 2)",
                    "Water (Art 3)",
                    "Fire (Owain 1)",
                    "Lightning (Owain 2)",
                    "Ice (Owain 3)",
                  ];
                  client.users.cache
                    .get(row[0]["PL" + i])
                    .send(
                      `Party Finder Information:\n${config.serverName} BA - ` +
                      row[0].Type +
                      " Run, Party " +
                      elementsArray[i] +
                      "\nPassword will be " +
                      row[0].PasscodeMain
                    );
                }
              } else {
                if (row[0].PLS !== "-") {
                  client.users.cache
                    .get(row[0].PLS)
                    .send(
                      `Party Finder Information:\n${config.serverName} BA - ` +
                      row[0].Type +
                      " Run, Support Party\nThe support Password will be " +
                      row[0].PasscodeSupport +
                      ", _please note this password is uniquely generated for the Support Party only_."
                    );
                }
              }
            }
          }
        }
      });
  }
});


//Reaction Handling
client.on(Events.MessageReactionAdd, async (event, user) => {
  //if (event.me) return;
  if (event.partial) {
    try { await event.fetch() } catch (error) {
      console.error('Reaction error:', error)
      return
    }
  }
  if (user.id === client.user.id) return;
  if (event.message.channelId === serverInfo.channels.partyLeader) {
    const message = event.message
    let reaction = new MessageReaction(client, event, message);
    let reactionCount = "";
    let embedContent = message.embeds[0].description;
    let runID = embedContent.split('Run ID: ').pop();
    runID = runID.substring(0, runID.length - 1);

    let selectedReaction = event.message.reactions.cache.filter(
      (rx) => rx.emoji.name == event.emoji.name
    );
    reactionCount = selectedReaction.first().count;

    let partyNumber = getReactionPartyNumber(event.emoji.name)

    if (partyNumber !== 0) {
      if (reactionCount == 2 && blacklist.includes(user.id)) {
        reaction.users.remove(user.id);
      }
      if (reactionCount == 2) {
        pool
          .query(
            "UPDATE `Runs` SET `" +
            partyNumber +
            "` = '" +
            user.id +
            "' WHERE `ID` = ?",
            [runID]
          )
          .then(() => {
            pool
              .query("SELECT * FROM `Runs` WHERE `ID` = ?", [runID])
              .then((run) => {
                let embedPartyLeader = buildPartyLeaderEmbed(run, client, serverInfo);
                reaction.message.edit({ embeds: [embedPartyLeader] });
              })
              .catch((error) => console.log(error));
          })
          .catch((error) => console.log(error));
      } else if (reactionCount > 2) {
        reaction.users.remove(user.id);
      }
    }
  }
});

client.on(Events.MessageReactionRemove, async (event, user) => {
  if (event.partial) {
    try { await event.fetch() } catch (error) {
      console.error('Reaction error:', error)
      return
    }
  }
  if (user.id === client.user.id) return;
  if (event.message.channelId === serverInfo.channels.partyLeader) {
    const message = event.message
    let reaction = new MessageReaction(client, event, message);
    let embedContent = message.embeds[0].description;
    let runID = embedContent.split('Run ID: ').pop();
    runID = runID.substring(0, runID.length - 1);

    let partyNumber = getReactionPartyNumber(event.emoji.name)

    if (partyNumber !== 0) {
      pool
        .query(
          "SELECT `" +
          partyNumber +
          "` AS `partyLeaderID` FROM `Runs` WHERE `ID` = ?",
          [runID]
        )
        .then((row) => {
          if (user.id === row[0].partyLeaderID) {
            pool
              .query(
                "UPDATE `Runs` SET `" +
                partyNumber +
                "` = ? WHERE `ID` = ?",
                ["-", runID]
              )
              .then(() => {
                pool
                  .query("SELECT * FROM `Runs` WHERE `ID` = ?", [runID])
                  .then((run) => {
                    let embedPartyLeader = buildPartyLeaderEmbed(run, client, serverInfo);
                    reaction.message.edit({ embeds: [embedPartyLeader] });
                  })
                  .catch((error) => console.log(error));
              })
              .catch((error) => console.log(error));
          }
        })
        .catch((error) => console.log(error));
    }
  }
});

//Proto-Ozma
client.login(config.token);
