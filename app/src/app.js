const INTERVAL = true;

const fs = require("node:fs");
const path = require("node:path");
// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token } = require("../../config.json");
const seed = require("./seed.js");
const Sequelize = require("sequelize");
const { getFirstScorer } = require("./api/api.js");

const force = process.argv.includes("--force") || process.argv.includes("-f");

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const sequelize = new Sequelize("wondo_database", "user", "password", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

const User = require("./models/Users.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/Prediction.js")(
    sequelize,
    Sequelize.DataTypes
);
const Match = require("./models/Match.js")(sequelize, Sequelize.DataTypes);
const Player = require("./models/Player.js")(sequelize, Sequelize.DataTypes);

// Function to seed and update the database
async function seedAndUpdateDatabase() {
    try {
        await sequelize.sync({ force });

        // Seed matches
        const matchObject = await seed.getFixturesObject();

        if (
            !matchObject ||
            !matchObject.data ||
            matchObject.data.length === 0
        ) {
            console.log(
                "No data to seed was found. Check api call for data availability."
            );
            return;
        }

        for (const match of matchObject.data) {
            const matchExists = await Match.findOne({
                where: { fixture_id: match.fixture_id },
            });

            if (matchExists) {
                if (JSON.stringify(matchExists) === JSON.stringify(match)) {
                    console.log(
                        `Match with fixture_id ${match.fixture_id} already exists with same fields. Skipping...`
                    );
                    continue;
                } else {
                    await Match.update(
                        {
                            fixture_id: match.fixture_id,
                            home_team: match.home_team,
                            away_team: match.away_team,
                            stadium: match.stadium,
                            league: match.league,
                            home_goals: match.home_goals,
                            away_goals: match.away_goals,
                            first_scorer: "none", 
                            date: match.date,
                            time: match.time,
                            finished: match.finished,
                        },
                        { where: { fixture_id: match.fixture_id } }
                    );
                }
            } else {
                await Match.create({
                    fixture_id: match.fixture_id,
                    home_team: match.home_team,
                    away_team: match.away_team,
                    stadium: match.stadium,
                    league: match.league,
                    home_goals: match.home_goals,
                    away_goals: match.away_goals,
                    first_scorer: "none", 
                    date: match.date,
                    time: match.time,
                    finished: match.finished,
                });
            }
        }

        console.log("Matches reseeded successfully.");

        // Update first scorer for previous match
        const previousMatch = await seed.getFindPreviousMatch();

        if (!previousMatch) {
            console.log("No previous match found.");
            return;
        }

        const firstScorer = await getFirstScorer(previousMatch.fixture_id);

        await Match.update(
            { first_scorer: firstScorer },
            { where: { fixture_id: previousMatch.fixture_id } }
        );

        console.log(
            "First scorer reupdated for the previous match:",
            firstScorer
        );
        await seed.updatePlayerData();
        await seed.getUpdateMatchTable();
    } catch (error) {
        console.error("Error seeding and updating database:", error);
    }
}

// seed database initially
seedAndUpdateDatabase();

// set interval to update database
if (INTERVAL) {
    setInterval(seedAndUpdateDatabase, 21600000); // 21600000ms = 6 hours
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

// Log in to Discord with your client's token
client.login(token);
