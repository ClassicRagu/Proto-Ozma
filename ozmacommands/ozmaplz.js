const {
  getCountdownString
} = require('../functions/CountdownFunctions/getCountdownString')

const ozmaplz = (msg, serverInfo, currentDate, client, pool, config) => {
  if (msg.member.roles.cache.has(serverInfo.roles.special.raidLeader)) {
    pool
      .query(
        'SELECT * FROM `Runs` WHERE `Start` > ? AND `Cancelled` = 0 ORDER BY `Start` ASC LIMIT 1',
        [currentDate.getTime()]
      )
      .then((row) => {
        if (typeof row[0] !== 'undefined') {
          let targetDate = new Date()
          targetDate.setTime(row[0].Start)
          let timeString = getCountdownString(targetDate)
          if (timeString <= '50 minutes.' && row[0].PasscodeMain > 0) {
            client.users.cache
              .get(row[0].RL)
              .send(
                'Raid Leader Notification:\nPassword for Main Parties will be ' +
                  row[0].PasscodeMain +
                  '\nThis message has been sent to Party Leaders 1-6.' +
                  '\nPassword for Support will be ' +
                  row[0].PasscodeSupport +
                  '\nThis message has been sent to the Support Party Leader.\nThe passwords will be posted automatically 30 minutes before the run.' +
                  `\n\nYou should probably have your party up by <t:${Math.round(
                    row[0].Start / 1000 - 1800
                  )}:t> if you're leading a party. idk it's your run so w/e`
              )
              .catch((error) => console.log(error))
            for (let i = 1; i < 8; i++) {
              if (i < 7) {
                if (row[0]['PL' + i] !== '-') {
                  let elementsArray = [
                    'None',
                    'Earth (Art 1)',
                    'Wind (Art 2)',
                    'Water (Art 3)',
                    'Fire (Owain 1)',
                    'Lightning (Owain 2)',
                    'Ice (Owain 3)'
                  ]
                  client.users.cache
                    .get(row[0]['PL' + i])
                    .send(
                      `Party Finder Information:\n${config.serverName} - ` +
                        row[0].Type +
                        ' Run, Party ' +
                        elementsArray[i] +
                        '\nPassword will be ' +
                        row[0].PasscodeMain +
                        `\n\nPlease have your party up in the PF by <t:${Math.round(
                          row[0].Start / 1000 - 1800
                        )}:t>. If you can no longer lead a party, notify the raid lead ASAP.`
                    )
                    .catch((error) => console.log(error))
                }
              } else {
                if (row[0].PLS !== '-') {
                  client.users.cache
                    .get(row[0].PLS)
                    .send(
                      `Party Finder Information:\n${config.serverName} BA - ` +
                        row[0].Type +
                        ' Run, Support Party\nThe support Password will be ' +
                        row[0].PasscodeSupport +
                        ', _please note this password is uniquely generated for the Support Party only_.' +
                        `\n\nPlease have your party up in the PF by <t:${Math.round(
                          row[0].Start / 1000 - 1800
                        )}:t>. If you can no longer lead a party, notify the raid lead ASAP.`
                    )
                    .catch((error) => console.log(error))
                }
              }
            }
          }
        }
      })
  }
}

module.exports = { ozmaplz }
