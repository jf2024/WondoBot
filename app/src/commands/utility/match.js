const { SlashCommandBuilder, Collection } = require("discord.js");
const db = require("../../dbObjects.js");

async function findMatch() {
  // const topPredictors = await db.Match.findAll({
  //   order: [["match_finished", "DESC"]], // use earliest date with match_finished( NS tag)
  //   attributes: ["username"],
  //   limit: 1,
  // });
  const match = await db.CurrentMatch.findAll();
  return match[0];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("match")
    .setDescription("Provides information about the upcoming match."),
  async execute(interaction) {
    // console.log(matchId);
    const match = await findMatch();
    // const match = await createMatch(matchId);
    if (!match) {
      return interaction.reply(
        "San Jose Earthquakes seem to not be playing anytime soon. No matches available."
      );
    }
    return interaction.reply(
      `date is: ${match.date ?? "Not available yet."},\n home_team is :${
        match.home_team ?? "Not available yet."
      },\n away_team is: ${
        match.away_team ?? "Not available yet."
      },\n stadium is: ${
        match.stadium ?? "Not available yet."
      },\n referee is: ${
        match.referee ?? "Not available yet."
      },\n home_goals is: ${
        match.home_goals ?? "Not available yet."
      },\n away_goals is: ${
        match.away_goals ?? "Not available yet."
      },\n first_scorer is: ${match.first_scorer ?? "Not available yet."}`
    );
  },
};
