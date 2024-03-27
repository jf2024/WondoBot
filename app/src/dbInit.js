const Sequelize = require("sequelize");

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

const Users = require("./models/Users.js")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize
  .sync({ force })
  .then(async () => {
    // const jane = await Users.create({
    //   user_id: "123456789",
    //   username: "jane",
    //   score: 0,
    // });

    // console.log("Database synced");
    // console.log(jane instanceof User);
    // console.log(jane.user_id, jane.username, jane.score);
    sequelize.close();
  })
  .catch(console.error);

module.exports = { Users };
