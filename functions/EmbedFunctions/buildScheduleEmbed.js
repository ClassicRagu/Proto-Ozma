const { EmbedBuilder } = require('discord.js')

const buildScheduleEmbed = (serverInfo, embedDescription) => {
  return new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle("Next 10 Upcoming Runs - Sorted By Start Time")
    .setDescription(embedDescription);
}

module.exports = {buildScheduleEmbed}