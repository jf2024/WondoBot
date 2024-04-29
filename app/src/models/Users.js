/*in the future
c) last match prediction (what was the user last match prediction)
*/

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Users", {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
    },
    appearances: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    highest_pos: {
      type: DataTypes.INTEGER,
      defaultValue: 99,
    },
    lowest_pos: {
      type: DataTypes.INTEGER,
      defaultValue: 99,
    },
    current_pos: {
      type: DataTypes.INTEGER,
      defaultValue: 99,
    },
    previous_pos: {
      type: DataTypes.INTEGER,
      defaultValue: 99,
    },
    ppg: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    result: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    first_scorer: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    outcome: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};
