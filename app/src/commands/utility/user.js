const { SlashCommandBuilder } = require("discord.js");
const db = require("../../dbObjects.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about the user."),
  async execute(interaction) {
    try {
      // Fetch the user from the database or create a new user if not found
      const [user, created] = await db.User.findOrCreate({
        where: {
          user_id: interaction.user.id,
        },
        defaults: {
          username: interaction.user.username,
          score: 0,
          ranking: 0,
        },
      });

      // Calculate the user's score based on predictions and update the database
      const updatedUser = await calculateUserScore(user);

      // Reply with the user's information
      await interaction.reply(
        `User ID: ${updatedUser.user_id}\nUsername: ${updatedUser.username}\nScore: ${updatedUser.score}\nRanking: ${updatedUser.ranking}`
      );
    } catch (error) {
      console.error("Error fetching or updating user:", error);
      await interaction.reply("An error occurred while fetching user information.");
    }
  },
};

async function calculateUserScore(user) {
  // Fetch all predictions made by the user
  const predictions = await db.Prediction.findAll({
    where: {
      user_id: user.user_id,
    },
    include: db.Match, // Include associated match information
  });

  // Calculate the total score based on predictions
  let totalScore = 0;
  predictions.forEach((prediction) => {
    totalScore += calculatePoints(prediction.user_home_pred, prediction.user_away_pred, prediction.user_scorer, prediction.Match);
  });

  // Update the user's total_points in the database
  user.points_awarded = totalScore; // Update total_points with the calculated total score
  await user.save();

  return user;
}

// Function to calculate points based on predictions and match details
function calculatePoints(homeScore, awayScore, firstScorer, match) {
  let points = 0;

  // Check if result is predicted correctly
  if (
    (homeScore === match.home_goals && awayScore === match.away_goals) ||
    (homeScore === match.away_goals && awayScore === match.home_goals)
  ) {
    points += 1; // 1 point if result is predicted correctly
  }

  // Check if score is predicted correctly
  if (homeScore === match.home_goals && awayScore === match.away_goals) {
    points += 3; // 3 points if score is predicted correctly
  }

  // Check if first scorer is predicted correctly
  if (firstScorer === match.first_scorer) {
    points += 5; // 5 points if first scorer is predicted correctly
  }

  return points;
}
