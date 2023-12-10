const { EmbedBuilder } = require('discord.js')

const buildPlusOneEmbed = ( serverInfo ) => {
    return new EmbedBuilder()
      .setColor(serverInfo.embedColor)
      .setDescription(`To use this command, please enable "Allow Direct Messages" or similar in the "Privacy Settings" for this server.\n\nExamples:\n[Desktop](https://cdn.discordapp.com/attachments/750126158624063550/1183505363513917650/privacysettings.jpg) | [Mobile](https://cdn.discordapp.com/attachments/750126158624063550/1183507685971333200/privacyios.jpg)\n\nThis message will self-destruct <t:${Math.round((Date.now() + 120100) / 1000)}:R>.`)
  }

module.exports = { buildPlusOneEmbed }