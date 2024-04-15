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
          },
          home_team: {
              type: DataTypes.STRING,
          },
          away_team: {
              type: DataTypes.STRING,
          },
          league: {
              type: DataTypes.STRING,
          },
          stadium: {
              type: DataTypes.STRING,
          },
          home_goals: {
              type: DataTypes.INTEGER,
              defaultValue: 0,
          },
          away_goals: {
              type: DataTypes.INTEGER,
              defaultValue: 0,
          },
          first_scorer: {
              type: DataTypes.STRING,
          },
          date: {
              type: DataTypes.DATE,
          },
          time: {
              type: DataTypes.TIME, 
          },
          finished: {
              type: DataTypes.BOOLEAN,
              defaultValue: false,
          },
      },
      {
          tableName: "Match",
          timestamps: false,
      }
  );
};