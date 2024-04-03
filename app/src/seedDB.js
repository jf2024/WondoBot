const Sequelize = require("sequelize");
const { getFixtures } = require("./api/api.js");

const sequelize = new Sequelize("wondo_database", "user", "password", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const testDbConnection = async () => {
  try {
    sequelize.authenticate();
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

const force = process.argv.includes("--force") || process.argv.includes("-f");

const fixturesObject = async () => {
  const fixtures = getFixtures();
  //   const fixturesObj = JSON.parse(fixturesJSON);
  return fixtures;
  //   console.log(fixturesObj);
};

sequelize
  .sync({ force })
  .then(async () => {
    const matchObject = await fixturesObject();
    if (matchObject === undefined) {
      console.error("Object is undefined. Check api call and service.");
      return;
    }

    const data = matchObject["data"];
    if (data.length === 0) {
      console.log(
        "No data to seed was found. Check api call for data availability."
      );
      return;
    }

    // Add data validation here
    TODO: await Promise.all(
      data.map(async (match) => {
        await Match.create({
          fixture_id: match.fixture_id,
          home_team: match.home_team,
          away_team: match.away_team,
          stadium: match.stadium,
          referee: match.referee,
          home_goals: match.home_goals,
          away_goals: match.away_goals,
          first_scorer: match.first_scorer,
          date: match.date,
          //   time: match.time,
          finished: match.finished,
        });
      })
    );

    // console.log(result);
    console.log("Database synced");
    sequelize.close();
  })
  .catch(console.error);
