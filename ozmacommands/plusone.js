const {
  buildPlusOneEmbed
} = require('../functions/EmbedFunctions/index')

const plusone = (msg, serverInfo, currentDate, client, pool, ozmablack) => {
  if (msg.channel.type != 'dm') {
    setTimeout(
      () =>
        msg
          .delete()
          .catch(() =>
            console.error(
              'Failed to delete +1 message, most likely deleted beforehand'
            )
          ),
      120100
    )
    
    let embedPlusOne = buildPlusOneEmbed( serverInfo )
    let cafe = client.guilds.cache.get(serverInfo.id)
    pool
      .query(
        "SELECT * FROM `Runs` WHERE `Start` > ? AND `Type` = 'Normal' AND `Cancelled` = 0 AND `Plusone` = 0 and `DRS` = 0 ORDER BY `Start` ASC LIMIT 2",
        [currentDate.getTime()]
      )
      .then((row) => {
        if (row.length === 0) {
          msg.author.send(
            'Sorry, there are no runs scheduled at this time, please check back later.'
          ).catch((error) => {
            console.log(error) 
            msg.reply({ embeds: [embedPlusOne] })
              .then(msg =>{
              setTimeout(() => msg.delete(), 120100)
              })
          })
        } else {
          let passcodeChannel = client.channels.cache.get(
            serverInfo.channels.passcodePG
          )
          let raidLeader = cafe.members.cache.get(row[0].RL).id
          let raidLeaderT = cafe.members.cache.get(row[0].RL).displayName
          let nextraidLeader = row[1]
            ? cafe.members.cache.get(row[1].RL).id
            : ''
          let nextraidLeaderT = row[1]
            ? cafe.members.cache.get(row[1].RL).displayName
            : ''
          if (ozmablack.includes(msg.author.id)) return
          else if (
            msg.member.roles.cache.has(serverInfo.roles.flex.baCaller) &&
            !msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
          ) {
            msg.reply(
              'Why would a caller need to use !plusone? You know how to look at a schedule.'
            )
          } else if (
            msg.member.roles.cache.has(serverInfo.roles.special.ozmaChampion) &&
            !msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
          ) {
            msg.reply(
              "You're an Ozma Champ. You must be an Ozma Chump if you need a !plusone."
            )
          } else if (
            msg.member.roles.cache.has(serverInfo.roles.flex.ozmaKiller) &&
            !msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)
          ) {
            msg.reply(
              `Looks like you have the Ozma Cleared role, !plusone is for first time clears only. Go unclick the cleared ozma question in <id:customize> if you haven't cleared BA!`
            )
          } else if (
            Math.round(row[0].Start) > Date.now() + 7200000 &&
            Math.round(row[0].Start) < Date.now() + 172800000
          ) {
            msg.author
              .send(
                `Hello! The next available run for +1's is ${
                  row[0].ID
                }, which is a ${
                  row[0].Type
                } run.\nStart time(Your device time): <t:${Math.round(
                  row[0].Start / 1000
                )}:F>, <t:${Math.round(
                  row[0].Start / 1000
                )}:R>.\nPasswords will ping in ${passcodeChannel} at 30 minutes left.
            \nContact <@${raidLeader}> aka ${raidLeaderT}, if you haven't cleared BA and you're interested in getting a spot reserved.`
              )
              .catch((error) => {
                console.log(error) 
                msg.reply({ embeds: [embedPlusOne] })
                  .then(msg =>{
                  setTimeout(() => msg.delete(), 120100)
                  })
              })
          } else if (row[1] === undefined) {
            msg.author.send(
              "Sorry, there are no runs scheduled at this time that are accepting +1's, please check back later."
            ).catch((error) => {
              console.log(error) 
              msg.reply({ embeds: [embedPlusOne] })
                .then(msg =>{
                setTimeout(() => msg.delete(), 120100)
                })
            })
          } else if (
            Math.round(row[0].Start) < Date.now() + 7200000 &&
            Math.round(row[1].Start) < Date.now() + 172800000
          ) {
            msg.author
              .send(
                `Hello! The next available run for +1's is ${
                  row[1].ID
                }, which is a ${
                  row[1].Type
                } run.\nStart time(Your device time): <t:${Math.round(
                  row[1].Start / 1000
                )}:F>, <t:${Math.round(
                  row[1].Start / 1000
                )}:R>.\nPasswords will ping in ${passcodeChannel} at 30 minutes left.
            \nContact <@${nextraidLeader}> aka ${nextraidLeaderT}, if you haven't cleared BA and you're interested in getting a spot reserved.`
              )
              .catch((error) => {
                console.log(error) 
                msg.reply({ embeds: [embedPlusOne] })
                  .then(msg =>{
                  setTimeout(() => msg.delete(), 120100)
                  })
              })
          } else {
            msg.author
              .send(`The next avaiable run for requesting +1's for is more than 48 hours away. Run this command again closer to your desired runtime. Click here to see the schedule: <#${serverInfo.channels.schedule}>.
              \nPlease note that only Open runs will return using this command.`)
              .catch((error) => {
                console.log(error) 
                msg.reply({ embeds: [embedPlusOne] })
                  .then(msg =>{
                  setTimeout(() => msg.delete(), 120100)
                  })
              })
          }
        }
      })
  }
}

module.exports = { plusone }
