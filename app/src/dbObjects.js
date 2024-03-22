// const Sequelize = require("sequelize");

// const sequelize = new Sequelize("database", "username", "password", {
//   host: "localhost",
//   dialect: "sqlite",
//   logging: false,
//   storage: "database.sqlite",
// });

// const Users = require("./models/Users.js")(sequelize, Sequelize.DataTypes);

// // Reflect.defineProperty(Users.prototype, "addItem", {
// //   value: async (item) => {
// //     const userItem = await UserItems.findOne({
// //       where: { user_id: this.user_id, item_id: item.id },
// //     });

// //     if (userItem) {
// //       userItem.amount += 1;
// //       return userItem.save();
// //     }

// //     return UserItems.create({
// //       user_id: this.user_id,
// //       item_id: item.id,
// //       amount: 1,
// //     });
// //   },
// // });

// // Reflect.defineProperty(Users.prototype, "getUserInfo", {
// //   value: () => {
// //     return Users.findAll({
// //       where: { user_id: this.user_id },
// //       include: [""],
// //     });
// //   },
// // });

// module.exports = { Users };
