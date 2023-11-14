const { EmbedBuilder } = require('discord.js')

const buildCountdownNoScheduleEmbed = (serverInfo) => {
  return new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle('No Scheduled Runs')
    .setDescription(
      'Please check this post again later or see #schedule for future run details.'
    )
}

module.exports = { buildCountdownNoScheduleEmbed }
