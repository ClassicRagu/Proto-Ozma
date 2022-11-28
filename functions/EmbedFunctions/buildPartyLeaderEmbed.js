const { EmbedBuilder } = require('discord.js')
const config = require('../../config.json')

const emotes = config.serverInfo.emojiFull

const buildPartyLeaderEmbed = (run, client, serverInfo) => {
  let runDate = new Date();
  let runlDate = new Date();
  runDate.setTime(run[0].Start);
  runlDate.setTime(run[0].Start);
  let cafe = client.guilds.cache.get(serverInfo.id);
  let runLeader = cafe.members.cache.get(run[0].RL).displayName;
  let runPL1 = "TBD";
  let runPL2 = "TBD";
  let runPL3 = "TBD";
  let runPL4 = "TBD";
  let runPL5 = "TBD";
  let runPL6 = "TBD";
  let runPLS = "TBD";
  let spiritDart = "TBD";
  let perception = "TBD";
  if (run[0].PL1 !== "-") {
    runPL1 = cafe.members.cache.get(run[0].PL1).displayName;
  }
  if (run[0].PL2 !== "-") {
    runPL2 = cafe.members.cache.get(run[0].PL2).displayName;
  }
  if (run[0].PL3 !== "-") {
    runPL3 = cafe.members.cache.get(run[0].PL3).displayName;
  }
  if (run[0].PL4 !== "-") {
    runPL4 = cafe.members.cache.get(run[0].PL4).displayName;
  }
  if (run[0].PL5 !== "-") {
    runPL5 = cafe.members.cache.get(run[0].PL5).displayName;
  }
  if (run[0].PL6 !== "-") {
    runPL6 = cafe.members.cache.get(run[0].PL6).displayName;
  }
  if (run[0].PLS !== "-") {
    runPLS = cafe.members.cache.get(run[0].PLS).displayName;
  }
  if (run[0].Percept !== "-") {
    perception = cafe.members.cache.get(run[0].Percept).displayName;
  }
  if (run[0].SpiritDart !== "-") {
    spiritDart = cafe.members.cache.get(run[0].SpiritDart).displayName;
  }

  let embed = new EmbedBuilder()
    .setColor(serverInfo.embedColor)
    .setTitle(
      `Party Leader Recruitment\n${run[0].ID}: ${run[0].Type} Run\nOn <t:${Math.round(run[0].Start / 1000)}:D> @<t:${Math.round(run[0].Start / 1000)}:t> (Your Local Time)`
    )
    .setDescription(
      `**Raid Leader**: ${runLeader}` +
      `\n\n**West/Art:**` +
      `\n${emotes.elementEarth} Earth: ${runPL1}` +
      `\n${emotes.elementWind} Wind: ${runPL2}` +
      `\n${emotes.elementWater} Water: ${runPL3}` +
      `\n**East/Owain:**` +
      `\n${emotes.elementFire} Fire: ${runPL4}` +
      `\n${emotes.elementLightning} Lightning: ${runPL5}` +
      `\n${emotes.elementIce} Ice: ${runPL6}` +
      `\n\n${emotes.bunny} **Support**: ${runPLS}` +
      `\n\n**Specific Roles:**` +
      (run[0].PerceptArg ? `\n${emotes.perception} Perception: ${perception}` : ``) +
      (run[0].SpiritDartArg ? `\n${emotes.spiritDart} Spirit Dart: ${spiritDart}` : ``) +
      `\n\n**React to the relevant emoji to *host* a party.` +
      `\nPlease note, your reaction may be removed without warning at the Raid Leader's or Staff discretion.**` +
      `\n_Run ID: ${run[0].ID}_`
    );
  return embed;
}

module.exports = { buildPartyLeaderEmbed }