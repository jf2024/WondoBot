const fs = require("node:fs");
const path = require("node:path");
const { Op } = require("sequelize");
// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("../../config.json");
const { User } = require("./models/Users.js");
const user = require("./commands/utility/user.js");

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// const member = new Collection();

// async function createUser(paramUser) {
//   const user = member.get(paramUser.id);

//   if (!user) {
//     const newUser = await User.create({ user_id: id, score: 0 });
//     return newUser;
//   }

//   return user;
// }

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  const mike = User.create({
    user_id: "1",
    username: "Mike",
    ranking: 1,
    score: 100,
  });
  const users = await User.findAll();
  users.forEach((u) => member.set(u.user_id, u));
});

// Log in to Discord with your client's token
client.login(token);

// module.exports = { createUser };
