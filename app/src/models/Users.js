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
      ranking: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      score: {
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
