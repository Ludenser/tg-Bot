function GenerateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function GenerateRandomChar() {
  var chars = "abcdefghijklmnopqrztuvwxyz";
  var randomNumber = GenerateRandomNumber(0, chars.length - 1);
  return chars[randomNumber];
}

module.exports = () => {
  let serialNumber = "";
  const serialArray = ["000", "000", "0000"]
  const mask = serialArray[Math.floor(Math.random() * serialArray.length)]
  if (mask != null) {
    for (let i = 0; i < mask.length; i++) {
      let maskChar = mask[i];
      serialNumber += maskChar == "0" ? GenerateRandomChar() : maskChar;
    }
  }
  return serialNumber;
}