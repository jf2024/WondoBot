const Sequelize = require("sequelize");

const sequelize = new Sequelize("wondo_database", "user", "password", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

const User = require("./models/users.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/prediction.js")(sequelize, Sequelize.DataTypes);
const Match = require("./models/Match.js")(sequelize, Sequelize.DataTypes);
const Player = require("./models/Player.js")(sequelize, Sequelize.DataTypes);

User.hasMany(Prediction, { foreignKey: "user_id" });
Prediction.belongsTo(User, { foreignKey: "user_id" });
Match.belongsTo(Prediction, { foreignKey: "id" });
Prediction.hasOne(Match, { foreignKey: "id" });

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

module.exports = { User, Match, Prediction, Player };