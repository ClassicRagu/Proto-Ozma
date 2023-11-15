const noplusone = (msg, serverInfo, args, client, pool) => {
  if (msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)) {
    let cafe = client.guilds.cache.get(serverInfo.id)
    if (args.length === 1) {
      pool.query('UPDATE `Runs` SET `Plusone` = 1 WHERE `ID` = ?', [args[0]]) &&
        pool
          .query('SELECT * FROM `Runs` WHERE `ID` =?', [args[0]])
          .then((row) => {
            let raidLeader = cafe.members.cache.get(row[0].RL).id
            if (raidLeader != msg.author.id) {
              msg.reply(
                `you set run ${args[0]}, hosted by <@${raidLeader}>, to no longer accepting +1 requests.`
              )
            } else {
              msg.reply(
                `you set run ${args[0]} to no longer accepting +1 requests.`
              )
            }
          })
    }
  }
}

module.exports = { noplusone }
