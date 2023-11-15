const { EmbedBuilder } = require('discord.js')
const {
  getDate,
  getDayOfWeek,
  getServerTime,
  getUnixTime
} = require('../GeneralTimeFunctions/index')

const buildServerTimeEmbed = (currentDate, serverInfo) => {
  return new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle('Server Time (ST)')
    .setDescription(
      'The current Server Time is:\n **' +
        getDayOfWeek(currentDate) +
        ', ' +
        getDate(currentDate) +
        ' ' +
        getServerTime(currentDate) +
        ',**\nYour current Local Time is:\n **' +
        getUnixTime() +
        '.**'
    )
}

module.exports = { buildServerTimeEmbed }
