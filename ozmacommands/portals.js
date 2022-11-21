const portals = (msg) => {
  let post =
    "/macrolock\n" +
    "/p Portal 1: <1>\n" +
    "/p Portal 2: <2>\n" +
    "/p Portal 3: <3>\n" +
    "/p Portal 4: <4>\n" +
    "/p Portal 5: <5>\n" +
    "/p Portal 6: <6>\n" +
    "/p Portal 7: <7>\n" +
    "/p Portal 8: <8>\n";
  msg.channel.send({
    content: post,
    files: [
      "https://cdn.discordapp.com/attachments/759118863085469756/759119014499844166/UC9QI0G.jpg",
    ],
  });
}

module.exports = { portals }