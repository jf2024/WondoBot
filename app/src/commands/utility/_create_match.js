const { SlashCommandBuilder, Collection } = require("discord.js");
const db = require("../../dbObjects.js");

// const intervalID = setInterval(
// const interaction = new Collection();

async function createMatch(id) {
  const match = await db.Match.findOne({
    where: { id: id },
  });
  if (!match) {
    const newMatch = await db.Match.create({
      id: id,
      home_team: "Barcelona",
      away_team: "Real Madrid",
      stadium: "Camp Nou",
      refe: "Mike Dean",
      home_goals: 2,
      away_goals: 3,
      first_scorer: "Messi",
    });
    return newMatch;
  }

  return match;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_create_match")
    .setDescription("Provides information about a match.")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("The amount of the match.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const matchId = interaction.options.getInteger("id");
    console.log(matchId);
    const match = await createMatch(matchId);
    return interaction.reply(
      `match id is: ${match.id},\n home_team is :${
        match.home_team ?? "Not available yet."
      },\n away_team is: ${
        match.away_team ?? "Not available yet."
      },\n stadium is: ${
        match.stadium ?? "Not available yet."
      },\n referee is: ${
        match.refe ?? "Not available yet."
      },\n home_goals is: ${
        match.home_goals ?? "Not available yet."
      },\n away_goals is: ${
        match.away_goals ?? "Not available yet."
      },\n first_scorer is: ${match.first_scorer ?? "Not available yet."}`
    );
  },
};
