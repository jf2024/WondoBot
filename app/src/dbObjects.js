const Sequelize = require("sequelize");

const sequelize = new Sequelize("wondo_database", "user", "password", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

const User = require("./models/User.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/Prediction.js")(sequelize, Sequelize.DataTypes);
const Match = require("./models/Match.js")(sequelize, Sequelize.DataTypes);
const Player = require("./models/Player.js")(sequelize, Sequelize.DataTypes);

User.hasMany(Prediction, { foreignKey: "user_id" });
Prediction.belongsTo(User, { foreignKey: "user_id" });
Match.belongsTo(Prediction, { foreignKey: "id" });
Prediction.hasOne(Match, { foreignKey: "id" });

// Define the points system
const POINTS_SYSTEM = {
  correctResult: 1,
  correctScore: 3,
  correctScorer: 5,
};

// Update the createPrediction method in the User model
Reflect.defineProperty(User.prototype, "createPrediction", {
  value: async (params) => {
      const prediction = {
          user_id: params.user_id,
          match_id: 0, // TODO: add match id
          user_home_pred: params.scoreOne,
          user_away_pred: params.scoreTwo,
          user_scorer: params.firstScorer,
      };

      // Calculate points based on prediction and match details
      const match = await Match.findByPk(prediction.match_id); // Fetch the match details
      const points = calculatePoints(prediction.user_home_pred, prediction.user_away_pred, prediction.user_scorer, match);

      // Save the prediction with awarded points
      prediction.points_awarded = points;
      return Prediction.create(prediction);
  },
});

// Define a function to calculate points based on predictions and match details
function calculatePoints(homeScore, awayScore, firstScorer, match) {
  let points = 0;

  // Check if result is predicted correctly
  if ((homeScore === match.home_goals && awayScore === match.away_goals) || (homeScore === match.away_goals && awayScore === match.home_goals)) {
      points += POINTS_SYSTEM.correctResult;
  }

  // Check if score is predicted correctly
  if (homeScore === match.home_goals && awayScore === match.away_goals) {
      points += POINTS_SYSTEM.correctScore;
  }

  // Check if first scorer is predicted correctly
  if (firstScorer === match.first_scorer) {
      points += POINTS_SYSTEM.correctScorer;
  }

  return points;
}

Reflect.defineProperty(User.prototype, "getPredictions", {
    value: (params) => {
        return Prediction.findAll({
            where: { user_id: params.user_id, match_id: 0 },
            include: [""],
        });
    },
});

module.exports = { User, Match, Prediction, Player };