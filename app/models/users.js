/*need to add to the following table
a) aooearances (so how many times the user has predicted)
b) rankings: current position, previous postion (already have highest and lowest position)
c) last match prediction (what was the user last match prediction)
*/

module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
        "users",
        {
            user_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING,
                //allowNull: false,
            },
            points: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
            highest_pos: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
            lowest_pos: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
            ppg: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
                //allowNull: false,
            },
            result: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
            first_scorer: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
            outcome: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                //allowNull: false,
            },
        },
        {
            tableName: "users",
            timestamps: false,
        }
    );
};