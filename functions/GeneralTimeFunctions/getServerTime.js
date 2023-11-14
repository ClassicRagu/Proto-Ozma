const { addZero } = require('./addZero')

const getServerTime = (targetTime) => {
  let currentDate = new Date()
  if (typeof targetTime !== 'undefined') {
    currentDate.setTime(targetTime)
  }
  return (
    addZero(currentDate.getUTCHours()) +
    ':' +
    addZero(currentDate.getUTCMinutes()) +
    ' ST'
  )
}

module.exports = { getServerTime }
