const { SlashCommandBuilder, Collection } = require("discord.js");
const db = require("../../dbObjects");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("predict_top")
    .setDescription("Users with top 10 highest prediction scores."),
  async execute(interaction) {
    const topPredictors = await db.User.findAll({
      order: [["total_points", "DESC"]],
      attributes: ["username"],
      limit: 10,
    });
    if (!topPredictors) return interaction.reply("No top predictors found.");
    return interaction.reply(
      `Top 10 predictors: ${topPredictors
        .map((user) => user.username)
        .join(", ")}`
    );
  },
};
