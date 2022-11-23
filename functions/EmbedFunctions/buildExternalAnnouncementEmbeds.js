const { EmbedBuilder } = require('discord.js')
const config = require('../../config.json')
const serverInfo = config.serverInfo

const generateStrikethroughFields = (row, cafe) => {
  return [{ name: "~~Where:~~", value: `~~[${config.serverAbbr} on ${config.datacenter} DC](${config.discordLink})~~`, inline: false },
  { name: "~~Raid Leader~~", value: `~~${cafe.members.cache.get(row[0].RL).displayName}~~`, inline: true },
  { name: "~~Type~~", value: `~~${row[0].Type}~~`, inline: true },
  { name: "~~Your Local Start Time~~", value: `~~<t:${Math.round(row[0].Start / 1000)}:F>~~` },
  { name: "~~Time Till Run~~", value: `~~<t:${Math.round(row[0].Start / 1000)}:R>. Password pings at 30 minutes left.~~` },
  { name: "~~Run Notes~~", value: `~~${row[0].Description}~~` },
  { name: "~~Run ID~~", value: `~~${row[0].ID.toString()}~~` }]
}

const buildExternalAnnounceCancelled = (row, cafe, title) => {
  return new EmbedBuilder()
    .setColor(serverInfo.announceEmbedColor)
    .setTitle(title)
    .setThumbnail(`${serverInfo.announceGifs.announceCanceled}`)
    .addFields(generateStrikethroughFields(row,cafe))
}

const buildExternalAnnounceOngoing = (row, cafe, title) => {
  return new EmbedBuilder()
    .setColor(serverInfo.announceEmbedColor)
    .setTitle(title)
    .setThumbnail(`${serverInfo.announceGifs.announceStarted}`)
    .addFields(generateStrikethroughFields(row,cafe))
}

const buildExternalAnnounceNewRun = (row, cafe) => {
  return new EmbedBuilder()
    .setColor(serverInfo.announceEmbedColor)
    .setTitle(`New BA Run On ${config.serverAbbr}`)
    .setThumbnail(`${serverInfo.announceGifs.announceNew}`)
    .addFields({ name: "Where:", value: `[${config.serverAbbr} on ${config.datacenter} DC](${config.discordLink})`, inline: false },
      { name: "Raid Leader", value: cafe.members.cache.get(row[0].RL).displayName, inline: true },
      { name: "Type", value: row[0].Type, inline: true },
      { name: "Your Local Start Time", value: `<t:${Math.round(row[0].Start / 1000)}:F>` },
      { name: "Time Till Run", value: `<t:${Math.round(row[0].Start / 1000)}:R>. Password pings at 30 minutes left.` },
      { name: "Run Notes", value: row[0].Description },
      { name: "Run ID", value: row[0].ID.toString() },)
}

module.exports = { buildExternalAnnounceOngoing, buildExternalAnnounceCancelled, buildExternalAnnounceNewRun }
