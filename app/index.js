const INTERVAL = true;

const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("../config.json");
const seed = require("./seed.js");
const { getFirstScorer } = require("./api-functions/api.js");

const Sequelize = require("sequelize");
const force = process.argv.includes("--force") || process.argv.includes("-f");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const sequelize = new Sequelize("wondo_database", "user", "password", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const User = require("./models/users.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/prediction.js")(
  sequelize,
  Sequelize.DataTypes
);
const Match = require("./models/Match.js")(sequelize, Sequelize.DataTypes);
const Player = require("./models/Player.js")(sequelize, Sequelize.DataTypes);

// Add a method to retrieve all fixture IDs from the database
async function getAllFixtureIds() {
  const matches = await Match.findAll({ attributes: ['fixture_id'] });
  return matches.map(match => match.fixture_id);
}

// Calls API every 6 hours to reseed tables in db with data from api
if (INTERVAL) {
  setInterval(async function () {
    try {
      const existingFixtureIds = await getAllFixtureIds();
  
      // Seed matches
      const matchObject = await seed.getFixturesObject();
  
      if (!matchObject || !matchObject.data || matchObject.data.length === 0) {
        console.log("No data to seed was found. Check api call for data availability.");
        return;
      }
  
      await Promise.all(matchObject.data.map(async (match) => {
        if (!existingFixtureIds.includes(match.fixture_id)) {
          // Insert only if the match is not already in the database
          await Match.create({
            fixture_id: match.fixture_id,
            home_team: match.home_team,
            away_team: match.away_team,
            stadium: match.stadium,
            league: match.league,
            home_goals: match.home_goals,
            away_goals: match.away_goals,
            first_scorer: "No goal scorer", // Placeholder for now
            date: match.date,
            time: match.time,
            finished: match.finished,
          });
        }
      }));

      console.log("Matches reseeded successfully.");

      // Update first scorer for previous match
      const previousMatch = await seed.getFindPreviousMatch();

      if (!previousMatch) {
        console.log("No previous match found.");
        return;
      }

      const firstScorer = await getFirstScorer(previousMatch.fixture_id);

      await Match.update(
        { first_scorer: firstScorer || "No goal scorer" },
        { where: { fixture_id: previousMatch.fixture_id } }
      );

      console.log("First scorer reupdated for the previous match:", firstScorer);
      await seed.updatePlayerData();
      await seed.getUpdateMatchTable();
    } catch (error) {
      console.error("Error reseeding database:", error);
    }
  }, 21600000); // 6 hours interval
}


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

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(token);