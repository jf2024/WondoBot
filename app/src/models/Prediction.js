module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Prediction", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_home_pred: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_away_pred: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_scorer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points_awarded: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};
