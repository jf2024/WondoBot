const { SlashCommandBuilder } = require("discord.js");
const { getCurrentMatch } = require("../../api-functions/api"); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName("currentmatch")
        .setDescription("Get information about the next match coming up"),
    async execute(interaction) {
        try {
            const matchInfo = await getCurrentMatch(); // Await the promise resolution
            if (matchInfo) {
                // Format the matchInfo as needed
                // weird formatting is due to Discord's code block formatting, need to use template literals and fix the formatting
                const formattedInfo = `
                    Next Fixture:
Date: ${matchInfo.date}
Venue: ${matchInfo.venueName} (${matchInfo.venueCity})
Fixture ID: ${matchInfo.fixtureId}
League: ${matchInfo.leagueName}
Home Team: ${matchInfo.homeTeam}
Away Team: ${matchInfo.awayTeam}
Home Team Goals: ${matchInfo.homeTeamGoals}
Away Team Goals: ${matchInfo.awayTeamGoals}
                `;

                await interaction.reply({
                    content: formattedInfo,
                });
            } else {
                await interaction.reply("No match information available.");
            }
        } catch (error) {
            console.error("Error fetching match data:", error);
            await interaction.reply(
                "An error occurred while fetching match data."
            );
        }
    },
};

