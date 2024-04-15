/*
- Necessary thing for this file
a) When a user types in a scorer, need to check if the player is indeed part 
of the SJ earthquakes. If it's not a valid name, tell user to try again.
b) check grace period as described in the function near the bottom of the file

Optional part for this file
a) currently, picture when user makes a prediction is just the user's profile picture,
maybe in the future, we can have a picture of the player that the user predicts to score first
some code for this or a template is in the api.js file 
*/


const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Prediction, User, Match } = require("../../dbOjects.js");
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("predict")
        .setDescription("Make or update a prediction for the current match")
        .addIntegerOption((option) =>
            option
                .setName("home-score")
                .setDescription("Predicted home team score")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("away-score")
                .setDescription("Predicted away team score")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("first-scorer")
                .setDescription("Predicted first goalscorer")
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const homeScore = interaction.options.getInteger("home-score");
            const awayScore = interaction.options.getInteger("away-score");
            const firstScorer = interaction.options.getString("first-scorer");

            const currentMatch = await findCurrentMatch();
            if (!currentMatch) {
                const noMatchesEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("🗓️ No Upcoming Matches")
                    .setDescription(
                        "There are no upcoming matches available to predict."
                    );
                return interaction.reply({ embeds: [noMatchesEmbed] });
            }

            const currentTime = new Date();
            const matchStartTime = new Date(
                `${currentMatch.date} ${currentMatch.time}`
            );

            if (currentTime >= matchStartTime) {
                const matchStartedEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("🗓️ Match Has Started")
                    .setDescription(
                        "The match has already started. You can no longer change your prediction."
                    );
                return interaction.reply({ embeds: [matchStartedEmbed] });
            }

            let user = await User.findOne({
                where: { user_id: interaction.user.id },
            });

            if (!user) {
                user = await User.create({
                    user_id: interaction.user.id,
                    username: interaction.user.username,
                });
            }

            const existingPrediction = await Prediction.findOne({
                where: {
                    user_id: interaction.user.id,
                    match_id: currentMatch.id,
                },
            });

            // determine outcome based on scores from sj perspective
            let result;
            if (homeScore === awayScore) {
                result = "Draw";
            } else if (homeScore > awayScore) {
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

            if (existingPrediction) {
                // update prediction
                await existingPrediction.update({
                    user_home_pred: homeScore,
                    user_away_pred: awayScore,
                    user_scorer: firstScorer,
                });

                const updatedPredictionEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("🏆⚽ Prediction Updated")
                    .setDescription(
                        `**User:** ${interaction.user}\n**Match:** ${currentMatch.home_team} ${homeScore}:${awayScore} ${currentMatch.away_team}\n**First Scorer:** ${firstScorer}\n**Outcome:** ${result} ${outcomeIndicator}`
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({
                        text: "You can change your prediction until the match starts.",
                    });


                return interaction.reply({ embeds: [updatedPredictionEmbed] });
                
            } else {
                // create new prediction 
                await Prediction.create({
                    user_id: interaction.user.id,
                    match_id: currentMatch.id,
                    user_home_pred: homeScore,
                    user_away_pred: awayScore,
                    user_scorer: firstScorer,
                    points_awarded: 0,
                });

                const newPredictionEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("🏆⚽ Prediction Updated")
                    .setDescription(
                        `**User:** ${interaction.user}\n**Match:** ${currentMatch.home_team} ${homeScore}:${awayScore} ${currentMatch.away_team}\n**First Scorer:** ${firstScorer}\n**Outcome:** ${result} ${outcomeIndicator}`
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({
                        text: "You can change your prediction until the match starts.",
                    });
                return interaction.reply({ embeds: [newPredictionEmbed] });
            }
        } catch (error) {
            console.error("Error executing predict command:", error);
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


// might change the grace period here but for now will do 

async function findCurrentMatch() {
    const currentDate = new Date();

    // Get the current date and time
    const currentTime = currentDate.getTime();

    // Fetch the upcoming match
    const currentMatch = await Match.findOne({
        where: {
            date: { [Op.gt]: currentDate },
        },
        order: [
            ["date", "ASC"],
            ["time", "ASC"],
        ],
        limit: 1,
    });

    if (!currentMatch) {
        return null; // No upcoming match found
    }

    // Calculate the start time of the match
    const matchStartTime = new Date(
        `${currentMatch.date} ${currentMatch.time}`
    ).getTime();

    // Define a grace period (e.g., 15 minutes) after which predictions are not allowed
    const gracePeriodMillis = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Check if the current time is within the grace period before the match starts
    if (matchStartTime - currentTime <= gracePeriodMillis) {
        return null; // Match has already started or within the grace period
    }

    return currentMatch; // Return the upcoming match
}
