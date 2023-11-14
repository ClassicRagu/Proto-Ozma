const { buildExternalAnnounceCancelled } = require('../functions/EmbedFunctions/buildExternalAnnouncementEmbeds')

const cancel = (msg, serverInfo, args, currentDate, client, pool, config) => {
  if (
    msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
  ) {
    let cafe = client.guilds.cache.get(serverInfo.id);
    let channelLeads = client.channels.cache.get(serverInfo.channels.partyLeader);
    let channelAnnounce = client.channels.cache.get(serverInfo.channels.baAnnounce);
    let passcodeChannel = client.channels.cache.get(serverInfo.channels.passcodePG);
    if (args.length === 1) {
      pool.query("UPDATE `Runs` SET `Cancelled` =  1 WHERE `ID` = ?", [
        args[0],
      ]) &&
        pool.query("SELECT * FROM `Runs` WHERE `ID` = ?", [args[0]])
          .then((row) => {
            let announceCancel = buildExternalAnnounceCancelled(row, cafe, `This ${config.serverAbbr} run has been canceled.`)
            let raidLeader = cafe.members.cache.get(row[0].RL).id;
            channelLeads.messages.fetch(row[0].EmbedID)
              .then((message) => {
                message.delete();
              }).catch(() => {
                console.error('Party Lead message failed to delete, run had likely already started.')
              });
            if (row[0].AnnounceEmbedID != null) {
              channelAnnounce.messages.fetch(row[0].AnnounceEmbedID)
                .then((message) => {
                  message.edit({ embeds: [announceCancel] });
                }).catch((error) => console.log(error))
            }
            if (Math.round(row[0].Start ) < (Date.now() + 3600000)) {
              passcodeChannel.setName("Arsenal Passwords");
            }
            if (raidLeader != msg.author.id) {
              msg.reply(
                `You cancelled run ${args[0]} scheduled by <@${raidLeader}>.`
              );
            } else {
              msg.reply(`you cancelled run ${args[0]}.`);
            }
          });
    }
  }
}

module.exports = {cancel}