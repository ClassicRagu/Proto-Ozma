const { EmbedBuilder } = require('discord.js')

const buildPlusOneEmbed = ( serverInfo ) => {
    return new EmbedBuilder()
      .setColor(serverInfo.embedColor)
      .setDescription(`To use this command, please enable "Allow Direct Messages" or similar in the "Privacy Settings" for this server.\n\nExamples:\n[Desktop](https://cdn.discordapp.com/attachments/750126158624063550/1187789060413071431/privacysettings.jpg) | [Mobile](https://cdn.discordapp.com/attachments/750126158624063550/1187789059851038810/privacyios.jpg)\n\nThis message will self-destruct <t:${Math.round((Date.now() + 120100) / 1000)}:R>.`)
  }

const buildLeadDMEmbed = ( serverInfo ) => {
    return new EmbedBuilder()
      .setColor(serverInfo.embedColor)
      .setDescription(`Your DM's are off. If you want the party lead password automatically DM'd to you, please enable "Allow Direct Messages" or similar in the "Privacy Settings" for this server.\n\nExamples:\n[Desktop](https://cdn.discordapp.com/attachments/750126158624063550/1187789060413071431/privacysettings.jpg) | [Mobile](https://cdn.discordapp.com/attachments/750126158624063550/1187789059851038810/privacyios.jpg)\n\nThis message will self-destruct <t:${Math.round((Date.now() + 120100) / 1000)}:R>.`)
}
module.exports = { buildPlusOneEmbed , buildLeadDMEmbed }