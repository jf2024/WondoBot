const axios = require("axios");
const { apiKey } = require("../config.json");
const teamID = "1596"; 
const host = "api-football-v1.p.rapidapi.com";

//function to separate date and time and dropping the seconds
function formatDateAndTime(dateString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return `${formattedDate}, ${formattedTime}`;
}
// grabs all the fixtures/schedule for the SJ team
async function getFixtures() {
    const options = {
        method: "GET",
        url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
        params: {
            season: "2024",
            team: teamID,
            from: "2024-02-23",
            to: "2024-11-20",
            timezone: "America/Los_Angeles",
        },
        headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": host,
        },
    };

    const fixturesObject = { data: []}

    try {
        const response = await axios.request(options);
        const sortedFixtures = response.data.response.sort((a, b) => {
            return new Date(a.fixture.date) - new Date(b.fixture.date);
        });

        sortedFixtures.forEach((fixture) => {
            const formattedDate = new Date(fixture.fixture.date);
            const date = formattedDate.toISOString().split("T")[0];
            const time = formattedDate.toTimeString().split(" ")[0];

            fixturesObject.data.push({
                fixture_id: fixture.fixture.id,
                home_team: fixture.teams.home.name,
                away_team: fixture.teams.away.name,
                stadium: `${fixture.fixture.venue.name}, ${fixture.fixture.venue.city}`, //maybe in future, separate city and stadium
                league: fixture.league.name,
                home_goals: fixture.goals.home,
                away_goals: fixture.goals.away,
                first_scorer: null,
                date: date,
                time: time,
                finished: fixture.fixture.status.short === "FT",
            });
        });
        
    } catch (error) {
        console.error(error);
    }
    //console.log(fixturesObject)
    return fixturesObject;
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// grabs first goal scorer in every game if applicable
async function getFirstScorer() {
    try {
        const fixturesResponse = await axios.request({
            method: "GET",
            url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
            params: {
                season: "2024",
                team: teamID,
                from: "2024-02-23",
                to: "2024-10-20",
                timezone: "America/Los_Angeles",
            },
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": host,
            },
        });

        for (const fixture of fixturesResponse.data.response) {
            const fixtureID = fixture.fixture.id;
            const homeTeam = fixture.teams.home.name;
            const awayTeam = fixture.teams.away.name;

            // get the opponent team
            const opponentTeam =
                homeTeam === "San Jose Earthquakes" ? awayTeam : homeTeam;

            const eventsResponse = await axios.request({
                method: "GET",
                url: "https://api-football-v1.p.rapidapi.com/v3/fixtures/events",
                params: {
                    fixture: fixtureID,	
                    team: teamID,	
                    type: "Goal",
                },
                headers: {
                    "X-RapidAPI-Key": apiKey,
                    "X-RapidAPI-Host": host,
                },
            });

            const goalscorer = eventsResponse.data.response[0]; // get the first goalscorer

            console.log(
                `First goalscorer for Fixture ${fixtureID} against ${opponentTeam}:`
            );
            if (goalscorer) {
                console.log(`Name: ${goalscorer.player.name}`);
                console.log(`ID: ${goalscorer.player.id}`);
            } else {
                console.log("No goalscorer found for this fixture.");
            }
            console.log("\n");
        }
    } catch (error) {
        console.error(error);
    }
}

// will grab current match 
// need to adjust so it separates date and time like the fixtures function, maybe make a helper function for that
// also with getting current match, do we really need home and away goals since that hasn't happened yet?
async function getCurrentMatch() {
    try {

        // get the current date, use new Date() to go back to normal
        // currently, messing around with the date
        const currentDate = new Date("2024-04-01");

        const fixturesResponse = await axios.request({
            method: "GET",
            url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
            params: {
                season: "2024",
                team: teamID,
                from: "2024-02-23",
                to: "2024-11-20",
                timezone: "America/Los_Angeles",
            },
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": host,
            },
        });

        let nextFixture = null;
        for (const fixture of fixturesResponse.data.response) {
            const fixtureDate = new Date(fixture.fixture.date);
            if (fixtureDate > currentDate) {
                nextFixture = fixture;
                break;
            }
        }

        if (nextFixture) {
            return {
                date: formatDateAndTime(nextFixture.fixture.date),
                venueName: nextFixture.fixture.venue.name,
                venueCity: nextFixture.fixture.venue.city,
                fixtureId: nextFixture.fixture.id,
                leagueName: nextFixture.league.name,
                homeTeam: nextFixture.teams.home.name,
                awayTeam: nextFixture.teams.away.name,
                homeTeamGoals: nextFixture.goals.home,
                awayTeamGoals: nextFixture.goals.away,
            };
        } else {
            console.log("No upcoming fixtures.");
        }
    } catch (error) {
        console.error(error);
    }
}

async function getLastMatch() {
    try {

        // get the current date, use new Date() to go back to normal
        // currently, messing around with the date
        const currentDate = new Date("2024-04-01");

        const fixturesResponse = await axios.request({
            method: "GET",
            url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
            params: {
                season: "2024",
                team: teamID,
                from: "2024-02-23",
                to: "2024-11-20",
                timezone: "America/Los_Angeles",
            },
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": host,
            },
        });

        let lastFixture = null;
        for (const fixture of fixturesResponse.data.response) {
            const fixtureDate = new Date(fixture.fixture.date);
            if (fixtureDate < currentDate) {
                lastFixture = fixture;
            } else {
                break;
            }
        }

        if (lastFixture) {
            return {
                date: formatDateAndTime(lastFixture.fixture.date),
                venueName: lastFixture.fixture.venue.name,
                venueCity: lastFixture.fixture.venue.city,
                fixtureId: lastFixture.fixture.id,
                leagueName: lastFixture.league.name,
                homeTeam: lastFixture.teams.home.name,
                awayTeam: lastFixture.teams.away.name,
                homeTeamGoals: lastFixture.goals.home,
                awayTeamGoals: lastFixture.goals.away,
            };
        } else {
            console.log("No previous fixtures found.");
        }
    } catch (error) {
        console.error(error);
    }
}

//some template for later getting player's photos 

// const { Client, GatewayIntentBits, MessageEmbed, SlashCommandBuilder } = require('discord.js');
// const axios = require('axios');

// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// const getPlayerPhoto = async () => {
//   const options = {
//     method: 'GET',
//     url: 'https://api-football-v1.p.rapidapi.com/v3/players/squads',
//     params: { team: '1596' },
//     headers: {
//       'X-RapidAPI-Key': '5ec343875cmsh21a84d547184a43p1b6d5ajsn65156d649b0d',
//       'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
//     }
//   };

//   try {
//     const response = await axios.request(options);
//     const playerPhotos = response.data.response.map((player) => {
//       const embed = new MessageEmbed()
//         .setTitle(`${player.player.name}`)
//         .setImage(player.player.photo);
//       return embed;
//     });
//     return playerPhotos;
//   } catch (error) {
//     console.error(error);
//     return ['An error occurred while fetching player photos.'];
//   }
// };

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}!`);

//   const getPlayerPhotoCommand = new SlashCommandBuilder()
//     .setName('getplayerphoto')
//     .setDescription('Get photos of players from a team');

//   client.application.commands.set([getPlayerPhotoCommand]);
// });

// client.on('interactionCreate', async (interaction) => {
//   if (!interaction.isCommand()) return;

//   if (interaction.commandName === 'getplayerphoto') {
//     const playerPhotos = await getPlayerPhoto();
//     await interaction.reply({ embeds: playerPhotos });
//   }
// });

// client.login('YOUR_BOT_TOKEN');


//getCurrentMatch();
//getFirstScorer();
//getFixtures();

module.exports = { getCurrentMatch, getLastMatch, getFixtures };




