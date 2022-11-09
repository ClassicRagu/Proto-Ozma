const { waymarks, elementalrooms, portals, plusone, noplusone, cancel, schedule, ozmaplz } = require("./ozmacommands");

const commands = (msg, serverInfo, client, pool, config, ozmablack) => {
 if (msg.author.bot) return;
  const args = msg.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let currentDate = new Date();
  if (
    command === "cancel"
  ) {
    cancel(msg, serverInfo, args, currentDate, client, pool, config)
  }
  if (
    command === "noplusone"
  ) {
    noplusone(msg, serverInfo, args, client, pool)
  }
  if (
    command === "plusone" 
  ) {
    plusone(msg, serverInfo, currentDate, client, pool, ozmablack)
  }
  if (
    command === "schedule"
  ) {
    schedule(msg, serverInfo, args, currentDate, client, pool)
  }
  if (command === "waymark" || command === "waymarks" || command === "ohimarks" || command === "ohimark") {
    waymarks(msg, args)
  }
  if (command === "element" || command === "elements" || command === "rooms") {
    elementalrooms(msg)
  }
  if (command === "portals") {
    portals(msg)
  }
  if (
    command === "ozmaplz"
  ) {
    ozmaplz(msg, serverInfo, currentDate, client, pool)
  }
}

module.exports = {commands}