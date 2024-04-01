const axios = require("axios");
const { apiKey } = require("../config.json");


const teamID = "1596"; 
const host = "api-football-v1.p.rapidapi.com";

async function getFixtures() {
    	const options = {
            method: "GET",
            url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
            params: {
                season: "2024",
                team: teamID,
                from: "2024-02-23",
                to: "2024-10-20",
                //timezone should be in pacific time
                timezone: "America/Los_Angeles",
            },
            headers: {
                "X-RapidAPI-Key":
                    apiKey,
                "X-RapidAPI-Host": host,
            },
        };
      	try {
    		const response = await axios.request(options);
    		//console.log(response.data);   //overview of the data

			// the number or index represents the fixture (only has MLS games)
			console.log(response.data.response[0].league.name);
			console.log(response.data.response[0].teams.home.name);
			console.log(response.data.response[0].teams.away.name);
			console.log(response.data.response[0].goals.home);
			console.log(response.data.response[0].goals.away);
			//also include date and time of the game
			console.log(response.data.response[0].fixture.date);

			console.log("--------------------")

			// grab the second fixture
			const fixture = response.data.response[4];
			console.log(fixture.league.name);
			console.log(fixture.teams.home.name);
			console.log(fixture.teams.away.name);
			console.log(fixture.goals.home);
			console.log(fixture.goals.away);
			console.log(fixture.fixture.date);

			//need to expand the above to grab all fixtures at once
      	} catch (error) {
    		console.error(error);
      	}
    }

getFixtures();



