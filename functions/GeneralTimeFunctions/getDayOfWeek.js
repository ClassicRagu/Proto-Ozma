const getDayOfWeek = (targetDate) => {
  let targetDay = 'Sunday'
  if (targetDate.getUTCDay() == 1) {
    targetDay = 'Monday'
  } else if (targetDate.getUTCDay() == 2) {
    targetDay = 'Tuesday'
  } else if (targetDate.getUTCDay() == 3) {
    targetDay = 'Wednesday'
  } else if (targetDate.getUTCDay() == 4) {
    targetDay = 'Thursday'
  } else if (targetDate.getUTCDay() == 5) {
    targetDay = 'Friday'
  } else if (targetDate.getUTCDay() == 6) {
    targetDay = 'Saturday'
  }
  return targetDay
}

module.exports = { getDayOfWeek }
