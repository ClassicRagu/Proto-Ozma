const getFineCountdownString = (targetDate) => {
 let timeString = "";
 let currentDate = new Date();
 let deltaTime = targetDate.getTime() - currentDate.getTime() + 60000;
 if (deltaTime > 172800000) {
   timeString = "go touch grass.";
 }
 else if (deltaTime > 86400000 && deltaTime < 172800000) {
   timeString = "more than 24 hours.";
 } else {
   let hours = Math.floor(deltaTime / (1000 * 60 * 60));
   let minutes = Math.floor((deltaTime % (1000 * 60 * 60)) / (1000 * 60));
   if (hours > 0) {
     timeString += hours + "h ";
     if (minutes > 0) {
       timeString += minutes + "m";
     }
   } else {
     timeString = minutes + " m";
   }
 }
 return timeString;
}

module.exports = {getFineCountdownString}