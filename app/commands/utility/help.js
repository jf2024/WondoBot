const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("predict-help")
        .setDescription("Get help with using prediction commands."),
    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("🔮 Prediction Help")
                .setDescription(
                    "Here are some prediction commands and how to use them:"
                )
                .addFields(
                    {
                        name: "`/predict-current`",
                        value: "Displays the current match that users can predict on.",
                        inline: false,
                    },
                    {
                        name: "`/predict`",
                        value: "Users can predict the outcome of the current match. Make a guess for the final score and the first goal scorer of the match. For first scorer, use the names listed in `/players` or just the last name of the player ('Gruezo'). If you don't think there will be a goal, just type 'none'",
                        inline: false,
                    },
                    {
                        name: "`/predict-me`",
                        value: "View your prediction statistics. It will show rank, points, appearances, and other stats.",
                        inline: false,
                    },
                    {
                        name: "`/predict-last`",
                        value: "View the results and statistics for the most recent match. Will also distribute the points based on your prediction",
                        inline: false,
                    },
                    {
                        name: "`/predict-top`",
                        value: "View the top 10 predictors with the highest points.",
                        inline: false,
                    },
					{
						name: "`/players`",
						value: "Will list the players available for the first goal scorer prediction. Can use the full name on whatever is shown here or just the last name or saying 'none'.",
						inline: false,
					},
					{
						name: "`/predict-help`",
						value: "Displays this help message",
						inline: false,
					},
					{
						name: "`How are points calculated?`",
						value: "Currently, it's 5 points if you guess the exact score, 3 points if you guess the goalscorer, and 1 point for outcome. For example, if you predict a 2-1 win and with Gruezo scoring but the match ends 3-1 win with Gruezo scoring first. You will receive 3 points for the goalscorer and 1 point for the outcome. So 4 total points.",
						inline: false,
					}
                )
                .setFooter({
                    text: "Use these commands to predict match outcomes and track your progress.",
                });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error executing predict-help command:", error);
            await interaction.reply(
                "An error occurred while fetching help information."
            );
        }
    },
};
