module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Match",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fixture_id: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      home_team: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      away_team: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      stadium: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      referee: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      home_goals: {
        type: DataTypes.INTEGER,
        // allowNull: false,
      },
      away_goals: {
        type: DataTypes.INTEGER,
        // allowNull: false,
      },
      first_scorer: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        // allowNull: false,
      },
      // time: {
      //   type: DataTypes.TIME,
      //   // allowNull: false,
      // },
      finished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
