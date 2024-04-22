/*need to perdioically call api instead of 
needing to run the seed file every time we want to update the database.c
*/
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const { getFixtures, getFirstScorer, getPlayers } = require("./api/api.js");
const teamID = "1596"; 

const sequelize = new Sequelize("wondo_database", "user", "password", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

const testDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

const User = require("./models/User.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/Prediction.js")(
    sequelize,
    Sequelize.DataTypes
);
const Match = require("./models/Match.js")(sequelize, Sequelize.DataTypes);
const Player = require("./models/Player.js")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

const fixturesObject = async () => {
    const fixtures = await getFixtures();
    return fixtures;
};

// Find the previous match to get first scorer
const findPreviousMatch = async () => {
    try {
        const currentDate = new Date(); // Current date and time

        const previousMatch = await Match.findOne({
            where: {
                date: {
                    [Op.lt]: currentDate,
                },
            },
            order: [
                ["date", "DESC"],
                ["time", "DESC"],
            ],
            limit: 1,
        });

        console.log("Previous match:", previousMatch);
        return previousMatch;
    } catch (error) {
        console.error("Error finding previous match:", error);
        return null;
    }
};

const seedPlayerData = async () => {
    try {
        const players = await getPlayers();

        // Check if the players table is empty
        const existingPlayers = await Player.findAll();
        if (existingPlayers.length === 0) {
            // Store the players in the database
            await Player.bulkCreate(
                players.map((player) => ({
                    name: player.name,
                    photoUrl: player.photoUrl,
                    teamId: teamID, 
                }))
            );
            console.log("Player data seeded successfully.");
        } else {
            console.log("Player data already exists in the database.");
        }
    } catch (error) {
        console.error("Error seeding player data:", error);
    }
};

sequelize
    .sync({ force })
    .then(async () => {
        try {
            // Seed matches
            const matchObject = await fixturesObject();

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

            await Promise.all(
                matchObject.data.map(async (match) => {
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
                })
            );

            console.log("Matches seeded successfully.");

            // Update first scorer for previous match
            const previousMatch = await findPreviousMatch();

            if (!previousMatch) {
                console.log("No previous match found.");
                return;
            }

            const firstScorer = await getFirstScorer(previousMatch.fixture_id);

            await Match.update(
                { first_scorer: firstScorer || "No goal scorer" },
                { where: { fixture_id: previousMatch.fixture_id } }
            );

            console.log(
                "First scorer updated for the previous match:",
                firstScorer
            );
            await seedPlayerData();
        } catch (error) {
            console.error("Error seeding database:", error);
        } finally {
            sequelize.close();
        }
    })
    .catch(console.error);