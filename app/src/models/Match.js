module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Match",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      home_team: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      away_team: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stadium: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refe: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      home_goals: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      away_goals: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      first_scorer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
