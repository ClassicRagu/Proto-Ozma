const { addZero } = require('./addZero')

const getLocalTime = (targetTime) => {
  let currentDate = new Date()
  if (typeof targetTime !== 'undefined') {
    currentDate.setTime(targetTime)
  }
  return (
    addZero(currentDate.getUTCHours()) +
    ':' +
    addZero(currentDate.getUTCMinutes()) +
    ' ST | ' +
    addZero(currentDate.getHours()) +
    ':' +
    addZero(currentDate.getMinutes()) +
    ' EDT'
  )
}

module.exports = { getLocalTime }
