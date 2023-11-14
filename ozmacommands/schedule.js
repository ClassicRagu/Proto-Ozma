const {
  commandError,
  pad,
  getRunType
} = require('../functions/GeneralFunctions/index')
const { getMonth } = require('../functions/GeneralTimeFunctions/getMonth')
const { buildPartyLeaderEmbed } = require('../functions/EmbedFunctions/index')
const luxon = require('luxon')

// Luxon's ISO code list is incomplete and doesn't seem to always use US based ISO codes even with set options
// This will allow users to setup runs during daylight savings time
const presetOffsets = {
  est: 'UTC-05',
  edt: 'UTC-04',
  cst: 'UTC-06',
  cdt: 'UTC-05',
  mst: 'UTC-07',
  mdt: 'UTC-06',
  pst: 'UTC-08',
  pdt: 'UTC-07'
}

const schedule = (msg, serverInfo, args, currentDate, client, pool) => {
  let cafe = client.guilds.cache.get(serverInfo.id)
  if (
    msg.member.roles.cache.has(serverInfo.roles.special.raidLeader) ||
    msg.member.roles.cache.has(
      serverInfo.roles.special.drsRaidLeader ||
        msg.member.roles.cache.has(serverInfo.roles.special.admin)
    )
  ) {
    let channelRecruitingDRS = client.channels.cache.get(
      serverInfo.channels.drsRecruiting
    )
    let channelSchedule = client.channels.cache.get(
      serverInfo.channels.scheduleChat
    )
    /*let drsRaidgoer = cafe.roles.cache.get(
      serverInfo.roles.flex.drsRaider).id;*/
    if (
      msg.channel.id != channelRecruitingDRS &&
      msg.channel.id != channelSchedule
    ) {
      commandError(
        msg,
        `Please schedule runs in the appropriate channel:\nBA:<#${serverInfo.channels.scheduleChat}>\nDRS:<#${serverInfo.channels.recruitingDRS}>`
      )
      return
    }
    /*if (msg.member.roles.cache != drsRaidLeader && msg.channel.id == channelRecruitingDRS) {
      commandError(msg, `You do not have the appropriate role to schedule that.`);
      return;
    }
    if (msg.member.roles.cache != raidLeader && msg.channel.id == channelSchedule) {
      commandError(msg, `You do not have the appropriate role to schedule that.`);
      return;
    }
    if (!msg.member.roles.cache.has(serverInfo.roles.special.raidDRSLeader) && msg.channel.id == channelRecruitingDRS) {
      commandError(msg, `You do not have the appropriate role to schedule that.`);
      return;
    }*/
    if (args[0] === 'add' || args[0] === 'nopw') {
      let postFormat =
        'Format: _!schedule add <type> <dd-mmm-yy> <TMZ> <hh:mm> (optional: arguments) (optional: description)_\n' +
        'or _!schedule add <type> <unix timestamp> (optional: description)_\n' +
        'i.e. _!schedule add clear 16-jun-20 19:00_\n' +
        'i.e. _!schedule add prog 1592334000_\n' +
        'i.e. _!schedule add open 16-jun-20 19:00 Description goes here_\n' +
        'i.e. _!schedule add open 1592334000 Description goes here_'
      let valueDescription = 'N/A'
      if (args.length < 4) {
        commandError(msg, 'Insufficient information provided.\n' + postFormat)
        return
      }
      const isUnixTime = !isNaN(args[2])
      const isTimezone =
        !isUnixTime &&
        args[4] !== undefined &&
        presetOffsets[args[4].toLowerCase()] !== undefined
      const hasAdditionalArgs =
        (isUnixTime &&
          args[3] !== undefined &&
          (args[3].startsWith('--') || args[3].startsWith('—'))) ||
        (args[4] !== undefined &&
          (args[4].startsWith('--') || args[4].startsWith('—'))) ||
        (isTimezone &&
          args[5] !== undefined &&
          (args[5].startsWith('--') || args[5].startsWith('—')))
      let argumentArg = ''
      if (hasAdditionalArgs) {
        if (isUnixTime) {
          argumentArg = args[3]
        } else if (isTimezone) {
          argumentArg = args[5]
        } else {
          argumentArg = args[4]
        }
      }
      if ((isUnixTime && args.length > 3) || args.length > 4) {
        let postArray = []
        let regex = /\S.+/m
        if (isUnixTime && !hasAdditionalArgs) {
          postArray = args.slice(3)
        } else if (
          (!hasAdditionalArgs && !isTimezone) ||
          (isUnixTime && hasAdditionalArgs)
        ) {
          postArray = args.slice(4)
        } else if (isTimezone && hasAdditionalArgs) {
          postArray = args.slice(6)
        } else {
          postArray = args.slice(5)
        }
        if (msg.channel.id === serverInfo.channels.drsRecruiting) {
          fullDescription = postArray.join(' ')
          valueDescription = regex.exec(fullDescription)
        } else valueDescription = postArray.join(' ')
      }
      let runType = getRunType(args)
      let runDate = new Date()
      let runTime = ''
      let regExp = /([0-9]*)-([A-Za-z]{3})-([0-9]*)\w+/
      if (isUnixTime || regExp.test(args[2])) {
        if (isUnixTime) {
          runDate = new Date(args[2] * 1000)
        } else if (isTimezone) {
          let arrayDate = args[2].split('-')
          let month = (getMonth(arrayDate[1]) + 1).toString()
          month = month.length < 2 ? `0${month}` : month
          let day =
            arrayDate[0].toString().length < 2
              ? `0${arrayDate[0]}`
              : arrayDate[0]
          runDate = luxon.DateTime.fromISO(
            `20${arrayDate[2]}-${month}-${day}T${args[3]}:00.000`,
            { zone: presetOffsets[args[4].toLowerCase()] }
          )
        } else {
          let arrayDate = args[2].split('-')
          runDate.setUTCDate(arrayDate[0])
          runDate.setUTCMonth(getMonth(arrayDate[1]))
          runDate.setUTCFullYear('20' + arrayDate[2])
        }
        regExp = /([0-9]{2}):([0-9]{2})/g
        let passcodeMain = 0
        let passcodeSupport = 0
        if (args[0] === 'add') {
          passcodeMain = pad('0000', Math.floor(Math.random() * 10000), true)
          passcodeSupport = pad('0000', Math.floor(Math.random() * 10000), true)
          while (passcodeSupport === passcodeMain) {
            passcodeSupport = pad(
              '0000',
              Math.floor(Math.random() * 10000),
              true
            )
          }
        }
        if (isUnixTime || regExp.test(args[3])) {
          if (!isTimezone) {
            if (!isUnixTime) {
              let arrayTime = args[3].split(':')
              runDate.setUTCHours(arrayTime[0], arrayTime[1], 0, 0)
            }
            runTime = runDate.getTime()
          } else {
            runTime = runDate.ts
          }
          if (runTime < currentDate.getTime()) {
            commandError(
              msg,
              'The date and time specified has already occured, the run must be in the future.'
            )
            return
          } else if (runTime > Date.now() + 15768000000) {
            commandError(
              msg,
              'The date specified is too far into the future, please select a date within exactly 182.5 days from now.'
            )
            return
          } else {
            pool
              .query(
                'INSERT INTO `Runs` (`Type`, `Start`, `PasscodeMain`, `PasscodeSupport`, `Plusone`, `PerceptArg`, `SpiritDartArg`, `rlName`, `RL`, `PL1`, `PL2`, `PL3`, `PL4`, `PL5`, `PL6`, `PLS`, `Percept`, `SpiritDart`, `Description`, `EmbedID`, `Newbie`, `SupportArg`, `noAnnounce`, `DRS`)' +
                  " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '-', '-', '-', '-', '-', '-', '-', '-', '-', ?, ?, ?, ?, ?, ?)",
                [
                  runType,
                  runTime,
                  passcodeMain,
                  passcodeSupport,
                  hasAdditionalArgs && argumentArg.includes('n'),
                  hasAdditionalArgs && argumentArg.includes('p'),
                  hasAdditionalArgs && argumentArg.includes('d'),
                  msg.author.tag,
                  msg.member.id,
                  valueDescription,
                  msg.id,
                  hasAdditionalArgs && argumentArg.includes('u'),
                  hasAdditionalArgs && argumentArg.includes('s'),
                  hasAdditionalArgs && argumentArg.includes('b'),
                  msg.channel.id === serverInfo.channels.recruitingDRS
                ]
              )
              .then((row) => {
                let runID = row.insertId
                pool
                  .query('SELECT * FROM `Runs` WHERE `ID` = ?', [runID])
                  .then((row) => {
                    if (msg.channel.id === serverInfo.channels.scheduleChat)
                      msg.channel.send(
                        `${runType} Run added: <t:${Math.round(
                          row[0].Start / 1000
                        )}:F>.\nRun ID: ${runID}`
                      )
                    if (msg.channel.id === serverInfo.channels.recruitingDRS) {
                      msg
                        .startThread({
                          name: `${valueDescription}`,
                          autoArchiveDuration: '10080'
                        })
                        .then(async (createdThread) => {
                          await createdThread.send(
                            `${runType} Run added: <t:${Math.round(
                              row[0].Start / 1000
                            )}:F>.\nRun ID: ${runID}`
                          )
                        })
                    }
                  })
                pool
                  .query('SELECT * FROM `Runs` WHERE `ID` = ?', [runID])
                  .then((run) => {
                    if (run[0].PasscodeMain > 0 && !run[0].DRS) {
                      let embedPartyLeader = buildPartyLeaderEmbed(
                        run,
                        client,
                        serverInfo
                      )
                      client.channels.cache
                        .get(serverInfo.channels.partyLeader)
                        .send({
                          embeds: [embedPartyLeader]
                        })
                        .then(async (sentEmbed) => {
                          await sentEmbed.react(serverInfo.emoji.elementEarth)
                          await sentEmbed.react(serverInfo.emoji.elementWind)
                          await sentEmbed.react(serverInfo.emoji.elementWater)
                          await sentEmbed.react(serverInfo.emoji.elementFire)
                          await sentEmbed.react(
                            serverInfo.emoji.elementLightning
                          )
                          await sentEmbed.react(serverInfo.emoji.elementIce)
                          if (!run[0].SupportArg) {
                            await sentEmbed.react(serverInfo.emoji.bunny)
                          }
                          if (run[0].PerceptArg) {
                            await sentEmbed.react(serverInfo.emoji.perception)
                          }
                          if (run[0].SpiritDartArg) {
                            await sentEmbed.react(serverInfo.emoji.spiritDart)
                          }
                          pool.query(
                            'UPDATE `Runs` SET `EmbedID` = ? WHERE `ID` = ?',
                            [sentEmbed.id, runID]
                          )
                        })
                    }
                  })
                  .catch((error) => console.log(error))
              })
              .catch((error) => console.log(error))
          }
        } else {
          commandError(
            msg,
            'Invalid time specified.\nFormat: <hh:mm> in ST, i.e. 22:32.'
          )
          return
        }
      } else {
        commandError(
          msg,
          'Invalid date specified.\nFormat: <dd-mmm-yy>, i.e. 23-Sep-19.'
        )
        return
      }
    } else {
      commandError(
        msg,
        'Invalid run type specified.\nOptions: Normal, Non-Standard, and Reclear'
      )
      return
    }
  }
}

module.exports = { schedule }
