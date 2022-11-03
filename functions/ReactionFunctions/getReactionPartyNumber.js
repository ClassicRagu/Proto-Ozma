const config = require('../../config.json')

const emoteNames = config.serverInfo.emojiName

const getReactionPartyNumber = (emojiName) => {
    switch(emojiName) {
     case emoteNames.elementEarth:
      return "PL1"
     case emoteNames.elementWind:
      return "PL2"
     case emoteNames.elementWater:
      return "PL3"
     case emoteNames.elementFire:
      return "PL4"
     case emoteNames.elementLightning:
      return "PL5"
     case emoteNames.elementIce:
      return "PL6"
     case emoteNames.bunny:
      return "PLS"
     default:
      return 0
    }
}

module.exports = {getReactionPartyNumber}