const { SlashCommandBuilder } = require("discord.js");
const db = require("../../dbObjects.js");

async function findNextMatch() {
  // Retrieve the next/current match from the database or API
  const match = await db.CurrentMatch.findOne({
    where: { finished: false }, // Assuming 'finished' field indicates if the match is completed or not
    order: [["date", "ASC"]], // Assuming 'date' field represents the match date
  });
  return match;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("predict_current")
    .setDescription("Provides information about the next/current match to be predicted on."),
    
    async execute(interaction) {
      // Find the next/current match
      const match = await findNextMatch();
    
      // Check if match is found
      if (!match) {
        return interaction.reply("No upcoming matches available for prediction.");
      }
    
      // Check if the match date has passed
      const currentDate = new Date();
      if (new Date(match.date) <= currentDate) {
        // If the match date has passed, find the next match
        const nextMatch = await findNextMatch();
        if (!nextMatch) {
          return interaction.reply("No upcoming matches available for prediction.");
        }
        // Format the team names for the next match
        const nextTeamNames = `${nextMatch.home_team} vs ${nextMatch.away_team}`;
        // Respond with information about the next match
        return interaction.reply(
          `Next Match: ${nextTeamNames}\nDate: ${nextMatch.date ?? "Not available yet."}\nKick-off: ${nextMatch.kickoff ?? "Not available yet."}\nCompetition: ${nextMatch.league ?? "Not available yet."}`
        );
      }
    
      // Format the team names for the current match
      const teamNames = `${match.home_team} vs ${match.away_team}`;
      // Assume 'kickoff' and 'league' are properties of the 'match' object
      const kickoff = match.kickoff ? match.kickoff.toLocaleTimeString() : "Not available yet.";
      const league = match.league ?? "Not available yet.";
    
      // Create a new prediction without user_id
      const newPrediction = await db.PredictCurrent.create({
        match: teamNames,
        date: match.date,
        kickoff: match.kickoff,
        competition: league,
      });
    
      return interaction.reply(
        `Match: ${newPrediction.match}\nDate: ${newPrediction.match.date ?? "Not available yet."}\nKick-off: ${newPrediction.match.kickoff}\nCompetition: ${newPrediction.competition}`
      );
    },    
};
