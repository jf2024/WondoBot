const Sequelize = require("sequelize");

const sequelize = new Sequelize("wondo_database", "user", "password", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

const User = require("./models/users.js")(sequelize, Sequelize.DataTypes);
require("./models/prediction.js")(sequelize, Sequelize.DataTypes);
require("./models/Match.js")(sequelize, Sequelize.DataTypes);
require("./models/Player.js")(sequelize, Sequelize.DataTypes);
require("./models/processed_matches.js")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize
    .sync({ force })
    .then(async () => {
        console.log("Database initialized successfully.");
        sequelize.close();
    })
    .catch(console.error);
