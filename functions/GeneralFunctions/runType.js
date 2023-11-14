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
        case "fresh":
            return "Fresh-prog";
        case "frsh":
            return "Fresh-prog";
        case "sofresh":
            return "So Fresh, So Clean";
        case "reclear":
            return "Reclear";
        case "rc":
            return "Reclear";
        case "rclr":
            return "Reclear";
        case "reclr":
            return "Reclear";
        case "fresh":
            return "Early-Prog";
        case "early":
            return "Early-Prog";
        case "earlyprog":
            return "Early-Prog";
        case "erly":
            return "Early-Prog";
        case "early-prog":
            return "Early-Prog";
        case "ta+":
            return "TA+";
        case "ta":
            return "TA+";
        case "clear":
            return "TA+";
        case "any":
            return "Any-Prog"
        case "anyprog":
            return "Any-Prog"
        case "ap":
            return "Any-Prog"
        default: return "Normal"
    }
}

module.exports = {getRunType}