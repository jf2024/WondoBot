module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "matches",
        {
            match_id: {
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
            home_goals: {
                type: DataTypes.INTEGER,
				defaultValue: 0,
                allowNull: false,
            },
            away_goals: {
                type: DataTypes.INTEGER,
				defaultValue: 0,
                allowNull: false,
            },
            first_scorer: {
                type: DataTypes.STRING,
				defaultValue: "No One",
                allowNull: false,
            },
            match_finished: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
			time: {
				type: DataTypes.DATE,
				allowNull: false,
			},
            date: {
              type: DataTypes.DATE,
              allowNull: false,
            }
        },
        {
            timestamps: false,
        }
    );
};
