const Sequelize = require("sequelize");

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
const ProcessedMatch = require("./models/Processed_Matches.js")(
  sequelize,
  Sequelize.DataTypes
);

User.hasMany(Prediction, { foreignKey: "user_id" });
Prediction.belongsTo(User, { foreignKey: "user_id" });
Match.belongsTo(Prediction, { foreignKey: "id" });
Prediction.hasOne(Match, { foreignKey: "id" });

ProcessedMatch.belongsTo(Match, { foreignKey: "match_id" });
Match.hasOne(ProcessedMatch, { foreignKey: "match_id" });

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
  value: (params) => {
    return Prediction.findAll({
      where: { user_id: params.user_id, match_id: 0 },
      include: [""],
    });
  },
});

module.exports = { User, Match, Prediction, Player, ProcessedMatch };
