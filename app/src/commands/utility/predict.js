const { SlashCommandBuilder, Collection } = require("discord.js");
const db = require("../../dbObjects.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("predict")
    .setDescription("User makes a prediction.")
    .addIntegerOption((option) =>
      option
        .setName("score_one")
        .setDescription("Score of home team")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("score_two")
        .setDescription("Score of away team")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("first_scorer")
        .setDescription("First goal scorer from home team")
        .setRequired(true)
    ),
  async execute(interaction) {
    const scoreOne = interaction.options.getInteger("score_one");
    const scoreTwo = interaction.options.getInteger("score_two");
    const firstScorer = interaction.options.getString("first_scorer");
    let user = await db.User.findOne({
      where: { user_id: interaction.user.id },
    });

    if (user === null) {
      user = await db.User.create({
        user_id: interaction.user.id,
        username: interaction.user.username,
      });
      console.log(user);
    }

    const prediction = await db.Prediction.findOne({
      where: { user_id: interaction.user.id, match_id: 0 },
    });
    // const prediction = await user.getPredictions({
    //   user_id: interaction.user.id,
    // });

    // add conditional to check if game start time has passed
    // update method
    if (prediction !== null) {
      return interaction.reply(
        `You have already made a prediction for this match.`
      );
    }
    const newPrediction = await user.createPrediction({
      user_id: interaction.user.id,
      scoreOne,
      scoreTwo,
      firstScorer,
    });
    return interaction.reply(
      `prediction is :${newPrediction.user_id}, match_id: ${newPrediction.match_id}, scoreOne is :${newPrediction.user_home_pred}, scoreTwo is :${newPrediction.user_away_pred}, firstScorer is :${newPrediction.user_scorer}, and pointsAwarded is :${newPrediction.points_awarded}`
    );
  },
};
