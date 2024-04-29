/*
currently works with full initial or just last name
my concern is that if its just last name, would that
hinder the check for the first scorer later on? 
i dont think so since we can match it with the player name anyway but
still something to consider
*/

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Prediction, User, Match, Player } = require("../../dbObjects.js");
const { Op } = require("sequelize");

async function findCurrentMatch() {
  try {
    const currentDate = new Date();
    console.log("Current date:", currentDate.toLocaleDateString());
    console.log("Current time:", currentDate.toLocaleTimeString());

    const gracePeriodMinutes = 135; // 2 hours and 15 minutes
    const gracePeriodEnd = new Date(
      currentDate.getTime() + gracePeriodMinutes * 60000
    );

    const nextMatch = await Match.findOne({
      where: {
        [Op.or]: [
          {
            date: {
              [Op.gt]: currentDate,
            },
          },
          {
            date: currentDate.toLocaleDateString(),
            time: {
              [Op.gte]: currentDate.toLocaleTimeString(),
              [Op.lte]: gracePeriodEnd.toLocaleTimeString(),
            },
          },
        ],
      },
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
      limit: 1,
    });

    console.log("Next match:", nextMatch);
    return nextMatch;
  } catch (error) {
    console.error("Error finding upcoming match:", error);
    return null;
  }
}

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
      let firstScorerName = interaction.options.getString("first-scorer");

      let player;

      // if firstScorerName is "none"
      if (firstScorerName.toLowerCase() === "none") {
        firstScorerName = "none";
      } else {
        // find actual player here
        player = await Player.findOne({
          where: {
            [Op.or]: [
              { name: firstScorerName },
              {
                name: {
                  [Op.like]: `%${firstScorerName.split(" ").pop()}%`,
                },
              },
            ],
          },
        });

        //checks if player is valid or not
        if (!player) {
          const invalidScorerEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("⚽ Invalid First Scorer")
            .setDescription(
              `${firstScorerName} is not a player on the San Jose Earthquakes team. Please try again with a valid player name, or specify "none" if you believe no one will score first.`
            );
          return interaction.reply({ embeds: [invalidScorerEmbed] });
        }
      }

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

      //embed for match started already
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

      // determine outcome based on scores from SJ perspective
      let result;
      if (homeScore === awayScore) {
        result = "Draw";
      } else if (currentMatch.home_team === "San Jose Earthquakes") {
        if (homeScore > awayScore) {
          result = "Win";
        } else {
          result = "Loss";
        }
      } else if (currentMatch.away_team === "San Jose Earthquakes") {
        if (homeScore < awayScore) {
          result = "Win";
        } else {
          result = "Loss";
        }
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
          user_scorer: firstScorerName,
        });

        const updatedPredictionEmbed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("🏆⚽ Prediction Updated")
          .setDescription(
            `**User:** ${interaction.user}\n**Match:** ${currentMatch.home_team} ${homeScore}:${awayScore} ${currentMatch.away_team}\n**First Scorer:** ${firstScorerName}\n**Outcome:** ${result} ${outcomeIndicator}`
          )
          .setThumbnail(
            player ? player.photoUrl : interaction.user.displayAvatarURL()
          )
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
          user_scorer: firstScorerName,
          points_awarded: 0,
        });

        const newPredictionEmbed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("🏆⚽ Prediction Updated")
          .setDescription(
            `**User:** ${interaction.user}\n**Match:** ${currentMatch.home_team} ${homeScore}:${awayScore} ${currentMatch.away_team}\n**First Scorer:** ${firstScorerName}\n**Outcome:** ${result} ${outcomeIndicator}`
          )
          .setThumbnail(
            player ? player.photoUrl : interaction.user.displayAvatarURL()
          )
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
        .setDescription("An error occurred while processing your prediction.");
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
