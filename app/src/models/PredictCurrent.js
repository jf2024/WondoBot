module.exports = (sequelize, DataTypes) => {
  return sequelize.define("PredictCurrent", {
    match: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATE,
    },
    kickoff: {
      type: DataTypes.TIME,
      allowNull: true, 
      defaultValue: null,
    },
    competition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false
  });
};
