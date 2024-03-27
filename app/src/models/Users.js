module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Users",
    {
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      total_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      highest_pos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      lowest_pos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      ppg: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      result: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      scorer: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      outcome: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
