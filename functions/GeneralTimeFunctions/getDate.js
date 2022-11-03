const {addZero} = require('./addZero')

const getDate = (targetDate) => {
 let dateString = addZero(String(targetDate.getUTCDate())) + "-";
 if (targetDate.getUTCMonth() == 0) {
   dateString += "Jan";
 }
 if (targetDate.getUTCMonth() == 1) {
   dateString += "Feb";
 }
 if (targetDate.getUTCMonth() == 2) {
   dateString += "Mar";
 }
 if (targetDate.getUTCMonth() == 3) {
   dateString += "Apr";
 }
 if (targetDate.getUTCMonth() == 4) {
   dateString += "May";
 }
 if (targetDate.getUTCMonth() == 5) {
   dateString += "Jun";
 }
 if (targetDate.getUTCMonth() == 6) {
   dateString += "Jul";
 }
 if (targetDate.getUTCMonth() == 7) {
   dateString += "Aug";
 }
 if (targetDate.getUTCMonth() == 8) {
   dateString += "Sep";
 }
 if (targetDate.getUTCMonth() == 9) {
   dateString += "Oct";
 }
 if (targetDate.getUTCMonth() == 10) {
   dateString += "Nov";
 }
 if (targetDate.getUTCMonth() == 11) {
   dateString += "Dec";
 }
 dateString += "-" + String(targetDate.getUTCFullYear()).slice(-2);
 return dateString;
}

module.exports = {getDate}