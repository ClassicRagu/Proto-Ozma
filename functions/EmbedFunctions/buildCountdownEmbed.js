const {EmbedBuilder} = require('discord.js')
const { getDate, getServerTime } = require('../GeneralTimeFunctions/index')

const buildCountdownEmbed = (serverInfo, cafe, row, targetDate) => {
 return new EmbedBuilder()
            .setColor(serverInfo.embedColor)
            .setTitle("Next Scheduled Run")
            .setDescription("The next run is as follows:")
            .addFields({ name: "Raid Leader", value: cafe.members.cache.get(row[0].RL).displayName, inline: true },
              { name: "Type", value: row[0].Type, inline: true },
              { name: "\u200B", value: "\u200B", inline: true },
              { name: "Start Time", value: `${getDate(targetDate)}, ${getServerTime(targetDate.getTime())}` },
              { name: "Your Local Start Time", value: `<t:${Math.round(row[0].Start / 1000)}:F>` },
              { name: "Time till run:", value: `<t:${Math.round(row[0].Start / 1000)}:R>. Password at 30 minutes left.` },
              { name: "Run Notes", value: row[0].Description },
              { name: "Run ID", value: row[0].ID.toString() })
}

module.exports = {buildCountdownEmbed}