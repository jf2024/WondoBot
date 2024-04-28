module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
        "ProcessedMatches",
        {
            match_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            }
        },
        {
            tableName: "ProcessedMatches",
            timestamps: false,
        }
    );
};