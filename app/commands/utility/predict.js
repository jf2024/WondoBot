const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getCurrentMatch } = require("../../api-functions/api");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("predict")
        .setDescription(
            "Predict the outcome of the current match and the first scorer"
        )
        .addIntegerOption((option) =>
            option
                .setName("home_team_score")
                .setDescription("Home team score")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("away_team_score")
                .setDescription("Away team score")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("first_scorer")
                .setDescription("First goal scorer")
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            // user inputs
            const homeTeamScore =
                interaction.options.getInteger("home_team_score");
            const awayTeamScore =
                interaction.options.getInteger("away_team_score");
            const firstScorer = interaction.options.getString("first_scorer");

            // get current match to predict on
            const currentMatch = await getCurrentMatch();

            // determine outcome based on scores
            let result;
            if (homeTeamScore === awayTeamScore) {
                result = "Draw";
            } else if (homeTeamScore > awayTeamScore) {
                result =
                    currentMatch.homeTeam === "San Jose Earthquakes"
                        ? "Win"
                        : "Loss";
            } else {
                result =
                    currentMatch.homeTeam === "San Jose Earthquakes"
                        ? "Loss"
                        : "Win";
            }

			// adding some indicators for fun
            let outcomeIndicator;
            switch (result) {
                case "Draw":
                    outcomeIndicator = "🟠";
                    break;
                case "Win":
                    outcomeIndicator = "🟢";
                    break;
                case "Loss":
                    outcomeIndicator = "🔴";
                    break;
            }

            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("Match Prediction")
                .addFields(
                    {
                        name: "User",
                        value: `${interaction.user}`,
                        inline: true,
                    },
                    {
                        name: "Match",
                        value: `${currentMatch.homeTeam} ${homeTeamScore}:${awayTeamScore} ${currentMatch.awayTeam}`,
                        inline: true,
                    },
                    { name: "\u200b", value: "\u200b", inline: true }, /// play around with this to get spacing and formatting right
                    {
                        name: "First Scorer",
                        value: firstScorer,
                        inline: true,
                    },
                    {
                        name: "Outcome",
                        value: `${result} ${outcomeIndicator}`,
                        inline: true,
                    }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error processing prediction:", error);
            await interaction.reply(
                "An error occurred while processing the prediction."
            );
        }
    },
};