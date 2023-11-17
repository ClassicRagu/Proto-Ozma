const { getDate, getDayOfWeek } = require('../GeneralTimeFunctions/index')
const {
  buildServerTimeEmbed,
  buildDRSEmbed,
  buildExternalAnnounceNewDRS
} = require('../EmbedFunctions/index')

Object.defineProperty(String.prototype, 'hashCodeDRS', {
  value: function () {
    var hash = 0,
      i,
      chr
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0 // Convert to 32bit integer
    }
    return hash
  }
})

const timedFunctionsDRS = (client, serverInfo, pool, currentDate, config) => {
  if (client.ws.status === 0) {
    let cafe = client.guilds.cache.get(serverInfo.id)
    let channelDRSSchedule = client.channels.cache.get(
      serverInfo.channels.drsSchedule
    )
    let channelSchedule = client.channels.cache.get(
      serverInfo.channels.drsSchedule
    )
    let embedServerTime = buildServerTimeEmbed(currentDate, serverInfo)
    channelSchedule.messages
      .fetch(serverInfo.posts.drsServerTime)
      .then((msg) => {
        msg.edit({ embeds: [embedServerTime] })
      })
    pool
      .query(
        'SELECT `Type`, `Start`, `RL`, `ID`, `EmbedID`, `Description`, `DRS` FROM `Runs` WHERE `Start` > ? AND `Cancelled` = 0 and `DRS` = 1 ORDER BY `Start` ASC LIMIT 8',
        [currentDate.getTime()]
      )
      .then((row) => {
        let embedDescription = ''
        let previousDate = ''
        row.forEach((run) => {
          let runTime = new Date()
          runTime.setTime(run.Start)
          let runDate = getDate(runTime)
          let raidLeader = cafe.members.cache.get(run.RL).displayName
          if (runDate !== previousDate) {
            embedDescription += '\n'
            previousDate = runDate
          }
          if (run.DRS) {
            embedDescription += `\n**${run.ID}: ${
              run.Type
            } Run**\n●Your *Local* Start Time: __<t:${Math.round(
              run.Start / 1000
            )}:F>__\n ● Organizer: ${raidLeader}\n● Recruitment/Sign-up: [${
              run.Description
            }](https://discord.com/channels/750103971187654736/1167469922830536704/${
              run.EmbedID
            })`
          }
        })
        if (embedDescription === '') {
          embedDescription =
            'There are currently no scheduled runs.\nPlease check back here shortly for further information.'
        }
        let embedHash = embedDescription.hashCodeDRS()
        channelDRSSchedule.messages
          .fetch(serverInfo.posts.drsSchedule)
          .then((msg) => {
            if (!msg.embeds[0].description.includes(embedHash)) {
              embedDescription += '\n\n\n||' + 'Post Hash: ' + embedHash + '||'
              let embedSchedule = buildDRSEmbed(serverInfo, embedDescription)
              msg.edit({ embeds: [embedSchedule] })
            }
          })
      })
      .catch((error) => console.log(error))
    pool
      .query(
        'SELECT * FROM `Runs` WHERE `Start` > ? AND `DRS` = 1 ORDER BY `ID` DESC LIMIT 2',
        [currentDate.getTime()]
      )
      .then((row) => {
        if (typeof row[0] !== 'undefined') {
          if (row[0].AnnounceEmbedID === null && row[0].Cancelled === 0) {
            let runID = row[0].ID
            let announceEmbed = buildExternalAnnounceNewDRS(row, cafe)
            client.channels.cache
              .get(serverInfo.channels.drsAnnounce)
              .send({ embeds: [announceEmbed] })
              .then(async (sentAnnounce) => {
                sentAnnounce.crosspost()
                pool.query(
                  'UPDATE `Runs` SET `AnnounceEmbedID` = ? WHERE `ID` = ?',
                  [sentAnnounce.id, runID]
                )
              })
              .catch((error) => console.log(error))
          }
        }
        if (row[0].Start - 120000 < Date.now() && !row[0].Cancelled) {
          let announceEdit = buildExternalAnnounceOngoingDRS(
            row,
            cafe,
            `This ${config.serverAbbr} run has started.`
          )
          channelAnnounce.messages
          .fetch(row[0].AnnounceEmbedID)
          .then((msg) => {
            msg.edit({ embeds: [announceEdit] })
          })
          .catch((error) => console.log(error))
        }        
      })
      .catch((error) => console.log(error))
  }
}

module.exports = { timedFunctionsDRS }
