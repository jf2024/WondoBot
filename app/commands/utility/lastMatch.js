const { SlashCommandBuilder } = require("discord.js");
const { getLastMatch } = require("../../api-functions/api");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lastmatch")
        .setDescription(
            "Get information about the last match before a given date or the current date"
        ),

    async execute(interaction) {
        try {
            const dateOption = interaction.options.getString("date");
            let date;

            if (dateOption) {
                date = new Date(dateOption);
            } else {
                date = new Date();
            }

            const lastMatchInfo = await getLastMatch(date);

            if (lastMatchInfo) {
                const formattedInfo = `Last Match Information:
Date: ${lastMatchInfo.date}
Referee: ${lastMatchInfo.referee}
Venue: ${lastMatchInfo.venueName} (${lastMatchInfo.venueCity})
Fixture ID: ${lastMatchInfo.fixtureId}
League: ${lastMatchInfo.leagueName}
Home Team: ${lastMatchInfo.homeTeam}
Away Team: ${lastMatchInfo.awayTeam}
Score: ${lastMatchInfo.homeTeamGoals} - ${lastMatchInfo.awayTeamGoals}`;

                await interaction.reply({ content: formattedInfo });
            } else {
                await interaction.reply("No previous fixtures found.");
            }
        } catch (error) {
            console.error("Error fetching match data:", error);
            await interaction.reply(
                "An error occurred while fetching match data."
            );
        }
    },
};
