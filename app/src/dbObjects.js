const Sequelize = require("sequelize");

const sequelize = new Sequelize("wondo_database", "user", "password", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const Users = require("./models/Users.js")(sequelize, Sequelize.DataTypes);
const Matches = require("./models/Matches.js")(sequelize, Sequelize.DataTypes);
const Predictions = require("./models/Predictions.js")(
  sequelize,
  Sequelize.DataTypes
);

// users have many predicts ; predictions hold a match

// a user table holds multipe predictions ; a match table holds multiple users predictions for one match

// create prediction tabel when user makes prediction ; their user_id as a foreign key

Predictions.belongsTo(Users, { foreignKey: "prediction_id", as: "prediction" });

Matches.belongsTo(Predictions, { foreignKey: "id", as: "match" });

// all predictions for one match point to one match identity in match table

Reflect.defineProperty(Users.prototype, "addPrediction", {
  value: async (prediction) => {
    // scoreOne, scoreTwo, firstScorer
    const predictionItem = await Predictions.findOne({
      where: { user_id: this.user_id, match_id: prediction.id },
    });

    // add conditional to check if game start time has passed
    if (predictionItem) {
      return predictionItem ?? "no prediction in existence aka null";
    }

    return Predictions.create({
      user_id: this.user_id,
      match_id: prediction.id,
      user_home_pred: prediction.user_home_pred,
      user_away_pred: prediction.user_away_pred,
      user_scorer: prediction.user_scorer,
      point_awarded: 0,
    });
  },
});

Reflect.defineProperty(Users.prototype, "getPredictions", {
  value: () => {
    return Predictions.findAll({
      where: { user_id: this.user_id },
      include: [""],
    });
  },
});

// Reflect.defineProperty(Matches.prototype, "addMatch", {
//   value: async (match) => {
//     // scoreOne, scoreTwo, firstScorer
//     const matchItem = await Matches.findOne({
//       where: { id: match.id },
//     });

//     // add conditional to check if game start time has passed
//     if (matchItem) {
//       return matchItem ?? "no prediction in existence aka null";
//     }

//     return Matches.create({
//       id: match.id,
//       home_team: "Barcelona",
//       away_team: "Real Madrid",
//       stadium: "Camp Nou",
//       refe: "Mike Dean",
//       home_goals: 2,
//       away_goals: 3,
//       first_scorer: "Messi",
//     });
//   },
// });

module.exports = { Users, Matches, Predictions };
