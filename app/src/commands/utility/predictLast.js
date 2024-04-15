const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Match, Prediction } = require("../../dbObjects.js");
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("predict_last")
        .setDescription("Get summary of the last predicted match"),

    async execute(interaction) {
        try {
            // Find the most recent completed match
            const lastMatch = await Match.findOne({
                where: {
                    finished: true
                },
                order: [["date", "DESC"]] // Order by date in descending order
            });

            if (!lastMatch) {
                await interaction.reply("No completed matches found.");
                return;
            }

            // Get match details
            const result = `${lastMatch.home_team} ${lastMatch.home_goals}:${lastMatch.away_goals} ${lastMatch.away_team}`;
            const homeGoals = lastMatch.home_goals;
            const awayGoals = lastMatch.away_goals;
            let outcome = "Draw";
            if (homeGoals > awayGoals) {
                outcome = "Win";
            } else if (homeGoals < awayGoals) {
                outcome = "Loss";
            }
            const firstScorer = lastMatch.first_scorer;

            // Determine the outcome indicator
            let outcomeIndicator;
            switch (outcome) {
                case "Draw":
                    outcomeIndicator = "🟠";
                    break;
                case "Win":
                    outcomeIndicator = "🟢";
                    break;
                case "Loss":
                    outcomeIndicator = "🔴";
                    break;
                default:
                    outcomeIndicator = "";
            }

            // Get the count of users who participated in predicting the last match
            const participantsCount = await Prediction.count({
                where: {
                    match_id: lastMatch.id
                }
            });

            // Get predictions for the last match
            const predictions = await Prediction.findAll({
                where: {
                    match_id: lastMatch.id
                }
            });

            // Calculate statistics
            let correctResultCount = 0;
            let correctFirstScorerCount = 0;
            let correctOutcomeCount = 0;

            predictions.forEach((prediction) => {
                if (prediction.user_home_pred === lastMatch.home_goals && prediction.user_away_pred === lastMatch.away_goals) {
                    correctResultCount++;
                }
                if (prediction.user_scorer === lastMatch.first_scorer) {
                    correctFirstScorerCount++;
                }
                if (
                    (prediction.user_home_pred > prediction.user_away_pred && lastMatch.home_goals > lastMatch.away_goals) ||
                    (prediction.user_home_pred === prediction.user_away_pred && lastMatch.home_goals === lastMatch.away_goals) ||
                    (prediction.user_home_pred < prediction.user_away_pred && lastMatch.home_goals < lastMatch.away_goals)
                ) {
                    correctOutcomeCount++;
                }
            });

            // Create an EmbedBuilder with the result and additional statistics
            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("🏆⚽ Last Match ")
                .setDescription(
                    `**Match:** ${result}\n**First Scorer:** ${firstScorer}\n**Outcome:** ${outcome} ${outcomeIndicator}` +
                    `\n\nParticipated: ${participantsCount}` +
                    `\nCorrect Result: ${correctResultCount}` +
                    `\nCorrect First Scorer: ${correctFirstScorerCount}` +
                    `\nCorrect Outcome: ${correctOutcomeCount}` +
                    `\nPoints: 0` // Keep points at 0
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error fetching last match:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("🗓️ Error")
                .setDescription(
                    "An error occurred while processing your prediction."
                );

            await interaction.reply({ embeds: [errorEmbed] });
        }
    },
};
