const waymarks = (msg, args) => {
  if (args.length > 0) {
    let boss = args[0].toLowerCase()
    let bossName = ''
    if (boss.includes('av')) {
      bossName = 'Absolute Virtue'
    } else if (boss.includes('ozma')) {
      bossName = 'Proto-Ozma'
    } else if (boss.includes('elements')) {
      bossName = 'Elemental Rooms'
    } else if (boss.includes('raiden')) {
      bossName = 'Raiden'
    }
    if (bossName) {
      let post = 'Waymark Placement for ' + bossName
      if (boss.includes('ozma')) {
        post +=
          ' (Substitute B with A, B, or C as appropriate to your platform).'
      }
      msg.channel.send({
        content: post,
        files: ['https://cdn.rosaworks.uk/proto-ozma/boss-' + boss + '.png']
      })
      if (boss.includes('ozma')) {
        msg.channel.send({
          content: '**Acceleration Bomb!**',
          files: [
            'https://cdn.discordapp.com/attachments/562248073166848027/568801915014610954/Clipboard_20190325_040024.png'
          ]
        })
      }
    }
  }
}

module.exports = { waymarks }
