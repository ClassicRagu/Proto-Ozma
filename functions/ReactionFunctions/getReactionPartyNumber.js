const config = require('../../config.json')

const emoteNames = config.serverInfo.emojiName

const getReactionPartyNumber = (emojiName) => {
  switch (emojiName) {
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
    case emoteNames.perception:
      return "Percept"
    case emoteNames.spiritDart:
      return "SpiritDart"
    default:
      return 0
  }
}

module.exports = { getReactionPartyNumber }