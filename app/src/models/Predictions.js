module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Predictions",
    {
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      match_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
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
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      points_awarded: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
