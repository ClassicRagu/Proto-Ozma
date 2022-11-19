const { getCountdownString } = require('../CountdownFunctions/getCountdownString')
const { getFineCountdownString } = require('../CountdownFunctions/getFineCountdownString')
const { getDate, getDayOfWeek, getServerTime } = require('../GeneralTimeFunctions/index')
const { buildServerTimeEmbed,
  buildCountdownEmbed,
  buildPasswordEmbed,
  buildNoPasswordEmbed,
  buildScheduleEmbed,
  buildExternalAnnounceOngoing,
  buildExternalAnnounceNewRun,
  buildCountdownNoScheduleEmbed } = require('../EmbedFunctions/index')

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

const timedFunctions = (client, serverInfo, pool, currentDate, config) => {
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
            runPlusone = serverInfo.emojiFull.plusOneNo; //No
          }
          if (!run.Plusone &&
            !(Math.round(run.Start) < (Date.now() + 7200000))) {
            runPlusone = serverInfo.emojiFull.plusOneYes; //Yes
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
            channelNextRunPasscode.permissionOverwrites.edit(cafe.id, { ViewChannel: true })
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
            channelNextRunPasscode.permissionOverwrites.edit(cafe.id, { ViewChannel: false })
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
}

module.exports = { timedFunctions }