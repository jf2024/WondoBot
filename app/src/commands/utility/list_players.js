/*
might change how this looks later down the road? but 
it looks fine for now
*/

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Player } = require("../../dbObjects");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("players")
    .setDescription("List all available players"),
  async execute(interaction) {
    try {
      const players = await Player.findAll({ attributes: ["name"] });

      if (!players || players.length === 0) {
        return interaction.reply("No players found.");
      }

      const playerNames = players.map((player) => player.name);
      const chunks = chunkArray(playerNames, 10); // groups of 10

      let currentPage = 0;
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Available Players")
        .setDescription(chunks[currentPage].join("\n"));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(chunks.length === 1)
      );

      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
      });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "prev") {
          currentPage--;
        } else if (i.customId === "next") {
          currentPage++;
        }

        embed.setDescription(chunks[currentPage].join("\n"));

        row.components[0].setDisabled(currentPage === 0);
        row.components[1].setDisabled(currentPage === chunks.length - 1);

        await i.update({ embeds: [embed], components: [row] });
      });

      collector.on("end", () => {
        row.components.forEach((component) => component.setDisabled(true));
        interaction.editReply({ components: [row] });
      });
    } catch (error) {
      console.error("Error executing players command:", error);
      await interaction.reply(
        "An error occurred while fetching player information."
      );
    }
  },
};

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
