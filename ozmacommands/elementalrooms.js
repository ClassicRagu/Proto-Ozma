const elementalrooms = (msg) => {
 let post = "Elemental Room Assignments";
    msg.channel.send({
      content: post, 
      files: ["https://cdn.rosaworks.uk/proto-ozma/boss-elements.png"],
    });
}

module.exports = {elementalrooms}