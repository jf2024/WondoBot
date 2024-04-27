/* for the future
optional thing here: set thumbnail depending on outcome of game
draw is neutral, loss is depressed, win is happy
*/
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Prediction, User, Match } = require("../../dbObjects");
const { Op } = require("sequelize");
const processedUsers = new Set();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("predict-last")
        .setDescription(
            "View the results and statistics for the most recent match"
        ),
    async execute(interaction) {
        try {
            const lastMatch = await getLastCompletedMatch();
            if (!lastMatch) {
                return interaction.reply("No completed matches found.");
            }

            // Check if the match has already been processed
            if (!processedUsers.has(lastMatch.id)) {
                // Process the match and update user points
                await evaluatePrediction(lastMatch.id);

                // Add the match ID to the set of processed matches
                processedUsers.add(lastMatch.id);
            }
            const matchResult = `${lastMatch.home_team} ${lastMatch.home_goals}:${lastMatch.away_goals} ${lastMatch.away_team}`;

            const homeScore = lastMatch.home_goals;
            const awayScore = lastMatch.away_goals;
            let result;
            let outcomeIndicator;

            if (homeScore === awayScore) {
                result = "Draw";
                outcomeIndicator = "🟠";
            } else if (homeScore > awayScore) {
                result =
                    lastMatch.homeTeam === "San Jose Earthquakes"
                        ? "Win"
                        : "Loss";
                outcomeIndicator = result === "Win" ? "🟢" : "🔴";
            } else {
                result =
                    lastMatch.homeTeam === "San Jose Earthquakes"
                        ? "Loss"
                        : "Win";
                outcomeIndicator = result === "Win" ? "🟢" : "🔴";
            }

            const outcomeText = `${result} ${outcomeIndicator}`;

            const predictions = await Prediction.findAll({
                where: { match_id: lastMatch.id },
                include: [
                    {
                        model: User,
                        attributes: [
                            "username",
                            "points",
                            "appearances",
                            "current_pos",
                            "highest_pos",
                            "lowest_pos",
                            "ppg",
                            "result",
                            "first_scorer",
                            "outcome",
                        ],
                    },
                ],
            });

            const participatedUsers = predictions.map(
                (prediction) => prediction.user.username
            );
            const totalPoints = predictions.reduce(
                (sum, prediction) => sum + prediction.points_awarded,
                0
            );
            const correctResultUsers = predictions.filter(
                (prediction) =>
                    prediction.user_home_pred === lastMatch.home_goals &&
                    prediction.user_away_pred === lastMatch.away_goals
            ).length;
            const correctFirstScorerUsers = predictions.filter(
                (prediction) =>
                    prediction.user_scorer === lastMatch.first_scorer
            ).length;
            const correctOutcomeUsers = predictions.filter(
                (prediction) =>
                    (prediction.user_home_pred > prediction.user_away_pred &&
                        lastMatch.home_goals > lastMatch.away_goals) ||
                    (prediction.user_home_pred < prediction.user_away_pred &&
                        lastMatch.home_goals < lastMatch.away_goals) ||
                    (prediction.user_home_pred === prediction.user_away_pred &&
                        lastMatch.home_goals === lastMatch.away_goals)
            ).length;

            const averageScore =
                predictions.length > 0 ? totalPoints / predictions.length : 0;

            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("🗓️ Last Match Prediction Results")
                .setDescription(
                    `**Result:** ${matchResult}\n` +
                        `**Outcome:** ${outcomeText}\n\n` +
                        `**First Scorer:** ${
                            lastMatch.first_scorer || "No goal scorer"
                        }\n` +
                        `**Participated:** ${participatedUsers.length} users\n` +
                        `**Total Points:** ${totalPoints}\n` +
                        `**Guessed Result:** ${correctResultUsers} (${(
                            (correctResultUsers / predictions.length) * 100 || 0
                        ).toFixed(2)}%)\n` +
                        `**Guessed First Scorer:** ${correctFirstScorerUsers} (${(
                            (correctFirstScorerUsers / predictions.length) *
                                100 || 0
                        ).toFixed(2)}%)\n` +
                        `**Guessed Outcome:** ${correctOutcomeUsers} (${(
                            (correctOutcomeUsers / predictions.length) * 100 ||
                            0
                        ).toFixed(2)}%)\n` +
                        `**Average Score:** ${averageScore.toFixed(2)}/9 pts`
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error executing predict-last command:", error);
            await interaction.reply(
                "An error occurred while processing the last match prediction results."
            );
        }
    },
};

async function getLastCompletedMatch() {
    try {
        const currentDate = new Date();
        const lastMatch = await Match.findOne({
            where: {
                date: { [Op.lt]: currentDate },
                finished: true,
            },
            order: [
                ["date", "DESC"],
                ["time", "DESC"],
            ],
            limit: 1,
        });

        return lastMatch;
    } catch (error) {
        console.error("Error fetching last completed match:", error);
        return null;
    }
}

async function evaluatePrediction(matchId) {
    try {
        // Get the match
        const match = await Match.findByPk(matchId);

        if (!match) {
            console.error(`Match with ID ${matchId} not found.`);
            return;
        }

        // Grab all predictions for the match
        const predictions = await Prediction.findAll({
            where: { match_id: matchId },
            include: [User],
        });

        // Update points and other fields for each prediction
        for (const prediction of predictions) {
            const user = prediction.user;
            let points = 0;

            // Check if the score prediction is correct
            const isScoreCorrect =
                prediction.user_home_pred === match.home_goals &&
                prediction.user_away_pred === match.away_goals;

            // Check if the first scorer prediction is correct
            const isFirstScorerCorrect =
                prediction.user_scorer.toLowerCase() ===
                match.first_scorer.toLowerCase();

            // Check if the outcome prediction is correct
            const isOutcomeCorrect =
                (prediction.user_home_pred === prediction.user_away_pred &&
                    match.home_goals === match.away_goals) ||
                (prediction.user_home_pred > prediction.user_away_pred &&
                    match.home_goals > match.away_goals) ||
                (prediction.user_home_pred < prediction.user_away_pred &&
                    match.home_goals < match.away_goals);

            // Point system
            if (isScoreCorrect) {
                points += 5;
            }

            if (isFirstScorerCorrect) {
                points += 3;
            }

            if (isOutcomeCorrect) {
                points += 1;
            }

            // Update user points and other relevant fields
            await user.update({
                points: user.points + points,
                appearances: user.appearances + 1,
                result: isScoreCorrect ? user.result + 1 : user.result, // Increment result if correct
                first_scorer: isFirstScorerCorrect
                    ? user.first_scorer + 1
                    : user.first_scorer, // Increment first_scorer if correct
                outcome: isOutcomeCorrect ? user.outcome + 1 : user.outcome, // Increment outcome if correct
            });

            // Update the prediction's points_awarded field
            await prediction.update({ points_awarded: points });
        }

        // After updating user points, sort users by points in descending order
        const sortedUsers = await User.findAll({
            order: [["points", "DESC"]],
        });

        // Update position-related fields for each user
        for (let i = 0; i < sortedUsers.length; i++) {
            const user = sortedUsers[i];
            const currentPos = i + 1;

            await user.update({
                highest_pos: Math.min(user.highest_pos, currentPos),
                lowest_pos: Math.max(user.lowest_pos, currentPos),
                current_pos: currentPos,
                previous_pos: user.current_pos,
                ppg: user.points / user.appearances,
            });
        }
    } catch (error) {
        console.error("Error evaluating predictions:", error);
    }
}