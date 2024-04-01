const { SlashCommandBuilder } = require("discord.js");
const { getFixtures } = require("../../api-functions/api"); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fixtures")
    .setDescription("Get fixtures for the San Jose Earthquakes")
    .addIntegerOption((option) =>
      option
        .setName("page")
        .setDescription("Page number to display (default: 1)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const pageNumber = interaction.options.getInteger("page") || 1;
      const fixtures = await getFixtures();
      const fixturesPerPage = 5; // outputs how many fixtures shown in 1 page
      const totalPages = Math.ceil(fixtures.length / fixturesPerPage);

      if (totalPages === 0) {
        await interaction.reply("No upcoming fixtures found.");
        return;
      }

      if (pageNumber < 1 || pageNumber > totalPages) {
        await interaction.reply(`Invalid page number. Please enter a value between 1 and ${totalPages}.`);
        return;
      }

      const startIndex = (pageNumber - 1) * fixturesPerPage;
      const endIndex = startIndex + fixturesPerPage;
      const formattedFixtures = fixtures
        .slice(startIndex, endIndex)
        .map(
          (fixture, index) =>
            `**Fixture ${startIndex + index + 1}:**\n${Object.entries(fixture)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n")}`
        )
        .join("\n\n");

      await interaction.reply({
        content: `Upcoming fixtures for the San Jose Earthquakes (Page ${pageNumber}/${totalPages}):\n\n${formattedFixtures}`,
      });
    } catch (error) {
      console.error("Error fetching fixtures:", error);
      await interaction.reply("An error occurred while fetching fixtures.");
    }
  },
};