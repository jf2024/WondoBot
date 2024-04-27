// couple of ideas for this one to improve on, still work in progress but a baseline to start from

/*
1) separate the matches by getting only the past matches that have already happened/played
and the future matches that are yet to be played (can be one command or two separate commands)
2) for the matches already played, change the text color or signal something 
to indicate the result, green for win, orange for draw, or red for lost from 
the perspective of the San Jose Earthquakes
*/

const { SlashCommandBuilder } = require("discord.js");
const { Match } = require("../../dbObjects.js");

function formatTime(time) {
    const [hours, minutes] = time.split(":");
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("all-matches")
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
            const fixturesPerPage = 5; // Number of fixtures to show per page

            const fixtures = await Match.findAll();
            const totalPages = Math.ceil(fixtures.length / fixturesPerPage);

            if (totalPages === 0) {
                await interaction.reply("No upcoming fixtures found.");
                return;
            }

            const page = Math.max(1, Math.min(pageNumber, totalPages));
            const startIndex = (page - 1) * fixturesPerPage;
            const endIndex = Math.min(
                startIndex + fixturesPerPage,
                fixtures.length
            );

            const formattedFixtures = fixtures
                .slice(startIndex, endIndex)
                .map((fixture, index) => {
                    const fixtureNumber = startIndex + index + 1;
                    const formattedDate = new Date(
                        fixture.date
                    ).toLocaleDateString("en-US", {
                        timeZone: "America/Los_Angeles",
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
                    const formattedTime = formatTime(fixture.time);

                    return {
                        name: `Fixture ${fixtureNumber}`,
                        value:
                            `Home Team: ${fixture.home_team}\n` +
                            `Away Team: ${fixture.away_team}\n` +
							`Home Goals: ${fixture.home_goals}\n` +
							`Away Goals: ${fixture.away_goals}\n` +
							`First Scorer: ${fixture.first_scorer}\n` + //need to change this maybe?
                            `Date: ${formattedDate}\n` +
                            `Time: ${formattedTime}\n` +
                            `Venue: ${fixture.stadium}\n` +
                            `League: ${fixture.league}`,
                    };
                });

            const embed = {
                color: 0x0099ff,
                title: `Upcoming fixtures for the San Jose Earthquakes (Page ${page}/${totalPages})`,
                fields: formattedFixtures,
            };

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error fetching fixtures:", error);
            await interaction.reply(
                "An error occurred while fetching fixtures."
            );
        }
    },
};
