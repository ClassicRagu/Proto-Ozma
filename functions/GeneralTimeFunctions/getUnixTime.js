const getUnixTime = (targetTime) => {
  let currentDate = Math.round(new Date().getTime() / 1000)
  if (typeof targetTime !== 'undefined') {
    currentDate.setTime(targetTime)
  }
  return '<t:' + currentDate + ':F>'
}

module.exports = { getUnixTime }
