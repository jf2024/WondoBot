module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "prediction",
        {
            user_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.STRING,
                // primaryKey: true,
                allowNull: false,
            },
            match_id: {
                type: DataTypes.INTEGER,
                // primaryKey: true,
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
        },
        {
            timestamps: false,
        }
    );
};
