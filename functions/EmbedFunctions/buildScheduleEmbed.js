const { EmbedBuilder } = require('discord.js')

const buildScheduleEmbed = (serverInfo, embedDescription) => {
  return new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle('Upcoming BA Runs - Sorted By Start Time')
    .setDescription(embedDescription)
}

const buildDRSEmbed = (serverInfo, embedDescription) => {
  return new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle('Upcoming DRS Runs - Sorted by Start Time\n\n')
    .setDescription(embedDescription)
}

module.exports = { buildScheduleEmbed, buildDRSEmbed }
