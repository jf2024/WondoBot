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

const User = require("./models/Users.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/Prediction.js")(
  sequelize,
  Sequelize.DataTypes
);
const Match = require("./models/Match.js")(sequelize, Sequelize.DataTypes);
const Player = require("./models/Player.js")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

async function getFixturesObject() {
  const fixtures = await getFixtures();
  return fixtures;
}

// Find the previous match to get first scorer
async function getFindPreviousMatch() {
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
}

async function createSeedPlayerData() {
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
}

async function updatePlayerData() {
  try {
    const players = await getPlayers();

    // Update the players in the database
    await Player.bulkCreate(players, {
      updateOnDuplicate: ["id", "name", "photoUrl"],
    }).then(
      console.log(
        "Player Table updated successfully. Updates made where necessary."
      )
    );
  } catch (error) {
    console.error("Error reseeding(update) player data:", error);
  }
}

async function getUpdateMatchTable() {
  try {
    // Fetch new match data from the API
    const matchObject = await getFixturesObject();

    if (!matchObject || !matchObject.data || matchObject.data.length === 0) {
      console.log("No new match data found.");
      return;
    }

    // Iterate over the fetched matches
    for (const match of matchObject.data) {
      // Check if the match exists in the database
      const existingMatch = await Match.findOne({
        where: { fixture_id: match.fixture_id.toString() },
      });

      if (existingMatch) {
        // update match with new info like goals and finished status
        await existingMatch.update({
          home_goals: match.home_goals,
          away_goals: match.away_goals,
          finished: match.finished,
        });
        console.log(`Match updated: ${match.fixture_id}`);
      } else {
        // Insert a new record for the new match
        await Match.create({
          fixture_id: match.fixture_id,
          home_team: match.home_team,
          away_team: match.away_team,
          stadium: match.stadium,
          league: match.league,
          home_goals: match.home_goals,
          away_goals: match.away_goals,
          first_scorer: "No goal scorer",
          date: match.date,
          time: match.time,
          finished: match.finished,
        });
        console.log(`New match added: ${match.fixture_id}`);
      }
    }

    console.log("Match table updated successfully.");
  } catch (error) {
    console.error("Error updating match table:", error);
  }
}

exports.getFixturesObject = getFixturesObject;
exports.getFindPreviousMatch = getFindPreviousMatch;
exports.updatePlayerData = updatePlayerData;
exports.getUpdateMatchTable = getUpdateMatchTable;
