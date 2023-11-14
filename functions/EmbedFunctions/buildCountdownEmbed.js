const {EmbedBuilder} = require('discord.js')
const { getDate, getServerTime } = require('../GeneralTimeFunctions/index')

const buildCountdownEmbed = (serverInfo, cafe, row, targetDate) => {
 return new EmbedBuilder()
            .setColor(serverInfo.embedColor)
            .setTitle("**Next Scheduled Run**")
            .addFields({ name: "__**Raid Leader**__", value: cafe.members.cache.get(row[0].RL).displayName, inline: true },
              { name: "__**Type**__", value: row[0].Type, inline: true },
              { name: "\u200B", value: "\u200B", inline: true },
              { name: "__**Your Local Start Time**__", value: `<t:${Math.round(row[0].Start / 1000)}:F>` },
              { name: "__**Time till run:**__", value: `<t:${Math.round(row[0].Start / 1000)}:R>. Password at 30 minutes left.` },
              { name: "__**Run Notes**__", value: row[0].Description },
              { name: "__**Party Leader Sign-up**__", value: `https://discord.com/channels/750103971187654736/958076900880830545/${row[0].EmbedID}`, inline: true},
              { name: "__**Run ID**__", value: row[0].ID.toString(), inline: true })
}

module.exports = { buildCountdownEmbed}