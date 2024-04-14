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
                first_scorer: "No goal scorer", //getFirstScorer(fixture.fixture.id)
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

// grabs first goal scorer in every game if applicable
async function getFirstScorer(fixtureID) {
    const options = {
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
    };

    try {
        const response = await axios.request(options);
        const firstScorer = response.data.response[0];
        return firstScorer ? firstScorer.player.name : "No goal scorer";
    } catch (error) {
        console.error('Error getting first scorer:', error);
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

module.exports = { getFixtures, getFirstScorer };




