const getRunType = (args) => {
    switch (args[1].toLowerCase()) {
        case "normal":
            return "Normal";
        case "nml":
            return "Normal";
        case "nl":
            return "Normal";
        case "nrml":
            return "Normal";
        case "open":
            return "Normal";
        case "non-standard":
            return "Non-Standard";
        case "ns":
            return "Non-Standard";
        case "nstd-standard":
            return "Non-Standard";
        case "nnstd-standard":
            return "Non-Standard";
        case "meme":
            return "Non-Standard";
        case "reclear":
            return "Reclear";
        case "rc":
            return "Reclear";
        case "rclr":
            return "Reclear";
        case "reclr":
            return "Reclear";
        default: return "Normal"
    }
}

module.exports = {getRunType}