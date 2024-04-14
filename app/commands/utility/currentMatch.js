const { SlashCommandBuilder } = require("discord.js");
const { Match } = require("../../dbOjects.js");
const { Op } = require("sequelize");

/*
surely theres a better way to do this in less code
*/
async function findMatch() {
    try {
        const currentDate = new Date(); 
        console.log("Current date:", currentDate.toLocaleDateString());
        console.log("Current time:", currentDate.toLocaleTimeString());

        const nextMatch = await Match.findOne({
            where: {
                [Op.and]: [
                    {
                        date: {
                            [Op.gte]: currentDate.toLocaleDateString(),
                        },
                    },
                    {
                        [Op.or]: [
                            {
                                date: currentDate.toLocaleDateString(),
                                time: {
                                    [Op.gte]: currentDate.toLocaleTimeString(),
                                },
                            },
                            {
                                date: {
                                    [Op.gt]: currentDate.toLocaleDateString(),
                                },
                            },
                        ],
                    },
                ],
            },
            order: [
                ["date", "ASC"],
                ["time", "ASC"],
            ],
            limit: 1,
        });

        console.log("Next match:", nextMatch);
        return nextMatch;
    } catch (error) {
        console.error("Error finding upcoming match:", error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("thismatch")
        .setDescription("Provides information about the upcoming match."),
    async execute(interaction) {
        const match = await findMatch();
        if (!match) {
            return interaction.reply(
                "San Jose Earthquakes seem to not be playing anytime soon. No matches available."
            );
        }
        //need to format the time and date better
        return interaction.reply(
            `Home Team: ${match.home_team} 
            Away Team: ${match.away_team} 
            Date: ${match.date} 
            Venue: ${match.stadium} 
            League: ${match.league}
            Time: ${match.time}`
        );
    },
};
