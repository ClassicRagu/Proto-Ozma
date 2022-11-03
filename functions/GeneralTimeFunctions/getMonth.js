const getMonth = (month) => {
 let targetMonth = month.toLowerCase();
 let result = null;
 if (targetMonth === "jan") {
   result = 0;
 }
 if (targetMonth === "feb") {
   result = 1;
 }
 if (targetMonth === "mar") {
   result = 2;
 }
 if (targetMonth === "apr") {
   result = 3;
 }
 if (targetMonth === "may") {
   result = 4;
 }
 if (targetMonth === "jun") {
   result = 5;
 }
 if (targetMonth === "jul") {
   result = 6;
 }
 if (targetMonth === "aug") {
   result = 7;
 }
 if (targetMonth === "sep") {
   result = 8;
 }
 if (targetMonth === "oct") {
   result = 9;
 }
 if (targetMonth === "nov") {
   result = 10;
 }
 if (targetMonth === "dec") {
   result = 11;
 }
 return result;
}

module.exports = {getMonth}