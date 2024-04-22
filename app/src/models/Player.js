module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "Player",
        {
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			photoUrl: {
				type: DataTypes.STRING,
				allowNull: false,
			},
        },
        {
            tableName: "Player",
            timestamps: false,
        }
    );
};