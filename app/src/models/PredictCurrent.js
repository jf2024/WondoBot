module.exports = (sequelize, DataTypes) => {
    return sequelize.define("PredictCurrent", {
      match: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        // allowNull: false,
      },
      kickoff: {
        type: DataTypes.TIME,
        // allowNull: false,
      },
      competition: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      timestamps: false // This line will exclude the timestamps fields
    });
  };
  