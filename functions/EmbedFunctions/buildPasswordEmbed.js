const { EmbedBuilder } = require('discord.js')

const buildPasswordEmbed = (serverInfo, row, cafe) => {
  let supportText = "";
  if (row[0].PLS !== "-") {
    supportText =
      "\n\n_To join support, send a DM to " +
      cafe.members.cache.get(row[0].PLS).displayName +
      " for the support password._";
  }
  let post =
    "Raid Leader: " +
    cafe.members.cache.get(row[0].RL).displayName +
    "," +
    `\n\n**The password for all elemental parties is: ${row[0].PasscodeMain}.**` +
    `\nThe parties are in the Private tab of the Party Finder in-game.` +
    supportText +
    `\n\nReminder:\n1: Normal raise doesn't work inside BA, so bring and use _Spirit Of The Remembered_!` +
    `\n2: Try and bring logos actions that are useful and bring utility to the raid!` +
    `\n3: Most importantly, have fun! The nice kind of fun not the sociopath kind of fun <:gunmorning:998488461034135562>`;
  return new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle(
      `<t:${Math.round(row[0].Start / 1000)}:f> ${row[0].Type
      } Run\nPassword`
    )
    .setDescription(post)
    .addFields({ name: "Run Notes", value: row[0].Description });
}

module.exports = { buildPasswordEmbed }