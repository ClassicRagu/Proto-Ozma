const { EmbedBuilder } = require('discord.js')

const buildNoPasswordEmbed = (serverInfo, row, cafe) => {
  let post =
    "Raid Leader: " +
    cafe.members.cache.get(row[0].RL).displayName +
    "\n\nThis is a private run that has been scheduled on this server.";
  return new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle(
      `<t:${Math.round(row[0].Start / 1000)}:f> ${row[0].Type
      } Run\nPassword`
    )
    .setDescription(post);
}

module.exports = {buildNoPasswordEmbed}