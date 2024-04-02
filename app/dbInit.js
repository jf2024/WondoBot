const Sequelize = require("sequelize");

const sequelize = new Sequelize("wondo_database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
	storage: "database.sqlite",
});

const User = require("./models/users.js")(sequelize, Sequelize.DataTypes);
require("./models/prediction.js")(sequelize, Sequelize.DataTypes);
require("./models/match.js")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({ force }).then(async () => {
	console.log("Database synced");
	sequelize.close();
}).catch(console.error)
