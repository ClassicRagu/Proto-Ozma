const { commandError, pad } = require('../functions/GeneralFunctions/index')
const { getMonth } = require('../functions/GeneralTimeFunctions/getMonth')
const { buildPartyLeaderEmbed } = require('../functions/EmbedFunctions/index')

const schedule = (msg, serverInfo, args, currentDate, client, pool) => {
  if (
    msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
  ) {
    let channelSchedule = client.channels.cache.get(
      serverInfo.channels.scheduleChat);
    if (msg.channel.id != channelSchedule) {
      commandError(msg, `Please schedule BA runs in <#${serverInfo.channels.scheduleChat}>`);
      return;
    }
    if (args[0] === "add" || args[0] === "nopw") {
      let postFormat =
        "Format: _!schedule add <type> <dd-mmm-yy> <hh:mm> (optional: description)_\n" +
        "or _!schedule add <type> <unix timestamp> (optional: description)_\n" +
        "i.e. _!schedule add open 16-jun-20 19:00_\n" +
        "i.e. _!schedule add open 1592334000_\n" +
        "i.e. _!schedule add open 16-jun-20 19:00 Description goes here_\n" +
        "i.e. _!schedule add open 1592334000 Description goes here_";
      let valueDescription = ", 'N/A'";
      let queryFieldDescription = ", `Description`";
      if (args.length < 4) {
        commandError(msg, "Insufficient information provided.\n" + postFormat);
        return;
      }
      const isUnixTime = !isNaN(args[2])
      const hasAdditionalArgs = (isUnixTime && args[3] !== undefined && args[3].startsWith('--'))
        || (args[4] !== undefined && args[4].startsWith('--'))
      const argumentArg = isUnixTime && hasAdditionalArgs ? args[3] : hasAdditionalArgs ? args[4] : ''
      if ((isUnixTime && args.length > 3) || args.length > 4) {
        let postArray = []
        if (isUnixTime && !hasAdditionalArgs) {
          postArray = args.slice(3);
        } else if (!hasAdditionalArgs || (isUnixTime && hasAdditionalArgs)) {
          postArray = args.slice(4);
        } else {
          postArray = args.slice(5);
        }
        valueDescription = ", '" + postArray.join(" ") + "'";
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
        type === "reclear" ||
        type === "spicy" && msg.member.roles.cache.has(serverInfo.roles.special.admin)
      ) {
        runType = args[1].toUpperCase();
        if (isUnixTime || regExp.test(args[2])) {
          if (isUnixTime) {
            runDate = new Date(args[2] * 1000)
          } else {
            let arrayDate = args[2].split("-");
            runDate.setUTCDate(arrayDate[0]);
            runDate.setUTCMonth(getMonth(arrayDate[1]));
            runDate.setUTCFullYear("20" + arrayDate[2]);
          }
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
          if (isUnixTime || regExp.test(args[3])) {
            if (!isUnixTime) {
              let arrayTime = args[3].split(":");
              runDate.setUTCHours(arrayTime[0], arrayTime[1], 0, 0);
            }
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
                  "INSERT INTO `Runs` (`Type`, `Start`, `PasscodeMain`, `PasscodeSupport`, `Plusone`, `PerceptArg`, `SpiritDartArg`, `RL`, `PL1`, `PL2`, `PL3`, `PL4`, `PL5`, `PL6`, `PLS`, `Percept`, `SpiritDart`" +
                  queryFieldDescription +
                  ")" +
                  " VALUES (?, ?, ?, ?, ?, ?, ?, ?, '-', '-', '-', '-', '-', '-', '-', '-', '-'" +
                  valueDescription +
                  ")",
                  [
                    runType,
                    runTime,
                    passcodeMain,
                    passcodeSupport,
                    hasAdditionalArgs && argumentArg.includes('n'),
                    hasAdditionalArgs && argumentArg.includes('p'),
                    hasAdditionalArgs && argumentArg.includes('s'),
                    msg.member.id
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
                            if (run[0].PerceptArg) {
                              await sentEmbed.react(serverInfo.emoji.perception);
                            }
                            if (run[0].SpiritDartArg) {
                              await sentEmbed.react(serverInfo.emoji.spiritDart);
                            }
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
}

module.exports = { schedule }