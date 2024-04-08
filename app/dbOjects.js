const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite",
});

const User = require("./models/users.js")(sequelize, Sequelize.DataTypes);
const Prediction = require("./models/prediction.js")(sequelize, Sequelize.DataTypes);
const Match = require("./models/match.js")(sequelize, Sequelize.DataTypes);

User.hasMany(Prediction, { foreignKey: "user_id" });
Match.hasMany(Prediction, { foreignKey: "match_id" });
Prediction.belongsTo(User, { foreignKey: "user_id" });
Prediction.belongsTo(Match, { foreignKey: "match_id" });
