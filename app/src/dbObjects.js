const Sequelize = require("sequelize");

const sequelize = new Sequelize("wondo_database", "user", "password", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const User = require("./models/User.js")(sequelize, Sequelize.DataTypes);
const Match = require("./models/Match.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/Prediction.js")(
  sequelize,
  Sequelize.DataTypes
);

// users have many predicts ; predictions hold a match

// a user table holds multipe predictions ; a match table holds multiple users predictions for one match

// create prediction tabel when user makes prediction ; their user_id as a foreign key

User.hasMany(Prediction, { foreignKey: "user_id" });
Prediction.belongsTo(User, { foreignKey: "user_id" });

Match.belongsTo(Prediction, { foreignKey: "id" });
Prediction.hasOne(Match, { foreignKey: "id" });
// all predictions for one match point to one match identity in match table

Reflect.defineProperty(User.prototype, "createPrediction", {
  value: async (params) => {
    return Prediction.create({
      user_id: params.user_id,
      match_id: 0, //TODO: add match id
      user_home_pred: params.scoreOne,
      user_away_pred: params.scoreTwo,
      user_scorer: params.firstScorer,
      points_awarded: 0, //TODO: add point awarded
    });
  },
});

Reflect.defineProperty(User.prototype, "getPredictions", {
  value: () => {
    return Prediction.findAll({
      where: { user_id: this.user_id },
      include: [""],
    });
  },
});

// Reflect.defineProperty(Users.prototype, "getUser", {
//   value: () => {
//     const user = Users.findOne({
//       where: { user_id: this.user_id },
//     });
//     if (!user) {
//       return Users.createUser({
//         user_id: this.user_id,
//         username: this.username,
//         total_points: 0,
//         highest_pos: 0,
//         lowest_pos: 0,
//         ppg: 0,
//         result: 0,
//         scorer: 0,
//         outcome: 0,
//       });
//     }

//     return user;
//   },
// });

// Reflect.defineProperty(Users.prototype, "createUser", {
//   value: async () => {
//     return Users.create({
//       user_id: this.user_id,
//       username: this.username,
//       total_points: 0,
//       highest_pos: 0,
//       lowest_pos: 0,
//       ppg: 0,
//       result: 0,
//       scorer: 0,
//       outcome: 0,
//     });
//   },
// });

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

module.exports = { User, Match, Prediction };
