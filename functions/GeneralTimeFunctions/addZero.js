const addZero = (i) => {
 if (i < 10) {
   i = "0" + i;
 }
 return i;
}

module.exports = {addZero}