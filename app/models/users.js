module.exports = (sequelize, DataTypes) => {
	return sequelize.define("users", {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        highest_pos: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        lowest_pos: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        ppg: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
        },
        result: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        first_scorer: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        outcome: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    },
	{
		timestamps: false,
	});
};