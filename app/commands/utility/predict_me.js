const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { User } = require("../../dbObjects");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("predict-me")
        .setDescription("View your prediction statistics"),
    async execute(interaction) {
        try {
            // Fetch user details
            let user = await User.findOne({
                where: { user_id: interaction.user.id },
            });

            // If user not found, create a placeholder user object
            if (!user) {
                user = {
                    appearances: 0,
                    points: 0,
                    ppg: 0,
                    result: 0,
                    first_scorer: 0,
                    outcome: 0,
                    current_pos: 99, 
                    highest_pos: 99,
                    lowest_pos: 99,
                };

                const previousPos =
                    user.current_pos > 1 ? user.current_pos - 1 : 1;

                // Create the embed with note for users who haven't predicted yet
                const embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("📊 Prediction Statistics")
                    .setDescription(
                        `User: ${interaction.user.toString()}\n\n` + 
                            `🟠 Current: ${user.current_pos}\n` +
                            `🟠 Previous: ${previousPos}\n` + 
                            `🟠 Highest: ${user.highest_pos}\n` +
                            `🟠 Lowest: ${user.lowest_pos}\n\n` +
                            "**Stats**\n" +
                            `🔵 Appearances: ${user.appearances}\n` +
                            `🔵 Points: ${user.points}\n` +
                            `🔵 PPG: ${user.ppg}\n` +
                            `🔵 Result: ${user.result}\n` +
                            `🔵 Scorer: ${user.first_scorer}\n` +
                            `🔵 Outcome: ${user.outcome}\n\n` +
                            "*You haven't predicted a match yet!*"
                    )
                    .setThumbnail(
                        interaction.user.displayAvatarURL({ dynamic: true })
                    );

                await interaction.reply({ embeds: [embed] });
            } else {
                //change the way i do this here but it works for now
                const previousPos =
                    user.current_pos > 1 ? user.current_pos - 1 : 1;

                // Create the embed for users who have made predictions
                const embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("📊 Prediction Statistics")
                    .setDescription(
                        `User: ${interaction.user.toString()}\n\n` + 
                            "**Rankings**\n" +
                            `🟠 Current: ${user.current_pos}\n` +
                            `🟠 Previous: ${previousPos}\n` + 
                            `🟠 Highest: ${user.highest_pos}\n` +
                            `🟠 Lowest: ${user.lowest_pos}\n\n` +
                            "**Stats**\n" +
                            `🔵 Appearances: ${user.appearances}\n` +
                            `🔵 Points: ${user.points}\n` +
                            `🔵 PPG: ${user.ppg}\n` +
                            `🔵 Result: ${user.result}\n` +
                            `🔵 Scorer: ${user.first_scorer}\n` +
                            `🔵 Outcome: ${user.outcome}\n`
                    )
                    .setThumbnail(
                        interaction.user.displayAvatarURL({ dynamic: true })
                    );

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("Error executing predict-me command:", error);
            await interaction.reply(
                "An error occurred while processing the prediction statistics."
            );
        }
    },
};
