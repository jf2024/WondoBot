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
                //allowNull: false,
            },
            home_team: {
                type: DataTypes.STRING,
                //allowNull: false,
            },
            away_team: {
                type: DataTypes.STRING,
                //allowNull: false,
            },
            league: {
                type: DataTypes.STRING,
                //allowNull: false,
            },
            stadium: {
                type: DataTypes.STRING,
                //allowNull: false,
            },
            home_goals: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
            away_goals: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
            first_scorer: {
                type: DataTypes.STRING,
                defaultValue: "No One",
                //allowNull: false,
            },
            date: {
                type: DataTypes.DATE,
                //allowNull: false,
            },
            time: {
                type: DataTypes.TIME, 
                //allowNull: false,
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
