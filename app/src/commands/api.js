const axios = require("axios");
const { apiKey } = require("../config.json");

const teamID = "1596"; 
const host = "api-football-v1.p.rapidapi.com";


/*
Something to note about the fixtures below:
- The timezone should be in pacific time, some are in the correct time but others are not? 
- need to investigate why some are not in the right time? Maybe its too far out in the future?
*/

async function getFixtures() {
    	const options = {
            method: "GET",
            url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
            params: {
                season: "2024",
                team: teamID,
                from: "2024-02-23",
                to: "2024-11-20",
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
            //console.log(response.data);   //overview of the data
            const response = await axios.request(options);

            // first need to order fixutres by date, got a couple of them out of order
            response.data.response.sort((a, b) => {
                return new Date(a.fixture.date) - new Date(b.fixture.date);
            });

            // now we list all the fixtures/schedule for the team
            response.data.response.forEach((fixture, index) => {
                console.log(`Fixture ${index + 1}:`); // the number or index represents the fixture 

                // date and time are together so wanna break those two apart
                const fixtureDate = new Date(fixture.fixture.date);
                console.log(
                    `Date: ${fixtureDate.toLocaleDateString()}, Time: ${fixtureDate.toLocaleTimeString()}`
                );

                // print out the match information
                console.log(`Referee: ${fixture.fixture.referee}`);
                console.log(`Venue: ${fixture.fixture.venue.name}`);
                console.log(`City: ${fixture.fixture.venue.city}`);
                console.log(`Fixture ID: ${fixture.fixture.id}`);
                console.log(`League: ${fixture.league.name}`);
                console.log(`Home Team: ${fixture.teams.home.name}`);
                console.log(`Away Team: ${fixture.teams.away.name}`);
                console.log(`Home Team Goals: ${fixture.goals.home}`);
                console.log(`Away Team Goals: ${fixture.goals.away}`);
                console.log("\n");
            });

        } catch (error) {
    		console.error(error);
      	}
    }


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

getFirstScorer();
getFixtures();



