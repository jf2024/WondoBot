const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../dbObjects");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("predict-top")
    .setDescription("Users with top 10 highest prediction scores."),
  async execute(interaction) {
    try {
      const topPredictors = await db.User.findAll({
        order: [["points", "DESC"]],
        attributes: ["user_id", "username", "appearances", "points"],
        limit: 10,
      });

      if (!topPredictors || topPredictors.length === 0) {
        return interaction.reply("No top predictors found.");
      }

      const topPredictorsStrings = await Promise.all(
        topPredictors.map(async (user, index) => {
          const discordUser = await interaction.client.users.fetch(
            user.user_id
          );
          const username = discordUser ? discordUser.toString() : user.username;
          return `${index + 1}) ${username} (🔥) - ${
            user.appearances
          } appearances: ${user.points} points`;
        })
      );

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🏆🏆 Top 10 Predictors")
        .setDescription(topPredictorsStrings.join("\n"));

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error executing predict_top command:", error);
      return interaction.reply(
        "An error occurred while fetching top predictors."
      );
    }
  },
};
