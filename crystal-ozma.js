const { Client,
  Events,
  GatewayIntentBits,
  MessageReaction,
  Partials
} = require("discord.js");
const { getLocalTime } = require('./functions/GeneralTimeFunctions/index')
const { buildPartyLeaderEmbed } = require('./functions/EmbedFunctions/index')
const { getReactionPartyNumber } = require('./functions/ReactionFunctions/getReactionPartyNumber')
const client = new Client({
  intents: [GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const config = require('./config.json')
const mariadb = require("mariadb");

const pool = mariadb.createPool(config.sqlLogin); // REMOTE

const serverInfo = config.serverInfo

const blacklist = require("./blacklist"); //group lead signup blacklist
const ozmablack = require("./ozmablack"); //Countermeasures
const { commands } = require("./commands");
const { timedFunctions } = require("./functions/TimedFunctions/timedFunctions");

client.once(Events.ClientReady, async () => {
  console.log("[" + getLocalTime() + "] Connected to Discord");
  client.user.setActivity("powering up the bass cannon.");
  const guild = await client.guilds.fetch(serverInfo.id);
  guild.channels.cache.get(serverInfo.channels.partyLeader);
})


client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
  if (newMessage.content.includes("[Original Message Deleted]")) {
    newMessage.delete()
  }
});

//Timed Functions
function clockFunctions() {
  let currentDate = new Date();
  timedFunctions(client, serverInfo, pool, currentDate, config)
  var Interval = (60 - currentDate.getUTCSeconds()) * 1000 + 5;
  setTimeout(clockFunctions, Interval);
}
clockFunctions();

client.on(Events.MessageCreate, (msg) => {
  commands(msg, serverInfo, client, pool, config, ozmablack)
});


//Reaction Handling
client.on(Events.MessageReactionAdd, async (event, user) => {
  //if (event.me) return;
  if (event.partial) {
    try { await event.fetch() } catch (error) {
      console.error('Reaction error:', error)
      return
    }
  }
  if (user.id === client.user.id) return;
  if (event.message.channelId === serverInfo.channels.partyLeader) {
    const message = event.message
    let reaction = new MessageReaction(client, event, message);
    let reactionCount = "";
    let embedContent = message.embeds[0].description;
    let runID = embedContent.split('Run ID: ').pop();
    runID = runID.substring(0, runID.length - 1);

    let selectedReaction = event.message.reactions.cache.filter(
      (rx) => rx.emoji.name == event.emoji.name
    );
    reactionCount = selectedReaction.first().count;

    let partyNumber = getReactionPartyNumber(event.emoji.name)

    if (partyNumber !== 0) {
      if (reactionCount == 2 && blacklist.includes(user.id)) {
        reaction.users.remove(user.id);
      }
      if (reactionCount == 2) {
        pool
          .query(
            "UPDATE `Runs` SET `" +
            partyNumber +
            "` = '" +
            user.id +
            "' WHERE `ID` = ?",
            [runID]
          )
          .then(() => {
            pool
              .query("SELECT * FROM `Runs` WHERE `ID` = ?", [runID])
              .then((run) => {
                let embedPartyLeader = buildPartyLeaderEmbed(run, client, serverInfo);
                reaction.message.edit({ embeds: [embedPartyLeader] });
              })
              .catch((error) => console.log(error));
          })
          .catch((error) => console.log(error));
      } else if (reactionCount > 2) {
        reaction.users.remove(user.id);
      }
    }
  }
});

client.on(Events.MessageReactionRemove, async (event, user) => {
  if (event.partial) {
    try { await event.fetch() } catch (error) {
      console.error('Reaction error:', error)
      return
    }
  }
  if (user.id === client.user.id) return;
  if (event.message.channelId === serverInfo.channels.partyLeader) {
    const message = event.message
    let reaction = new MessageReaction(client, event, message);
    let embedContent = message.embeds[0].description;
    let runID = embedContent.split('Run ID: ').pop();
    runID = runID.substring(0, runID.length - 1);

    let partyNumber = getReactionPartyNumber(event.emoji.name)

    if (partyNumber !== 0) {
      pool
        .query(
          "SELECT `" +
          partyNumber +
          "` AS `partyLeaderID` FROM `Runs` WHERE `ID` = ?",
          [runID]
        )
        .then((row) => {
          if (user.id === row[0].partyLeaderID) {
            pool
              .query(
                "UPDATE `Runs` SET `" +
                partyNumber +
                "` = ? WHERE `ID` = ?",
                ["-", runID]
              )
              .then(() => {
                pool
                  .query("SELECT * FROM `Runs` WHERE `ID` = ?", [runID])
                  .then((run) => {
                    let embedPartyLeader = buildPartyLeaderEmbed(run, client, serverInfo);
                    reaction.message.edit({ embeds: [embedPartyLeader] });
                  })
                  .catch((error) => console.log(error));
              })
              .catch((error) => console.log(error));
          }
        })
        .catch((error) => console.log(error));
    }
  }
});

//Proto-Ozma
client.login(config.token);
