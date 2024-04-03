// const axios = require("axios");
// const { apiKey } = require("../../../config.json");

// const db = require("../dbObjects.js");

// const teamID = "1596";
// const host = "api-football-v1.p.rapidapi.com";

// async function getFixtures() {
//   const options = {
//     method: "GET",
//     url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
//     params: {
//       season: "2024",
//       team: teamID,
//       from: "2024-02-23",
//       to: "2024-10-20",
//       //timezone should be in pacific time
//       timezone: "America/Los_Angeles",
//     },
//     headers: {
//       "X-RapidAPI-Key": apiKey,
//       "X-RapidAPI-Host": host,
//     },
//   };
//   try {
//     const response = await axios.request(options);
//     console.log(response.data); //overview of the data

//     // the number or index represents the fixture (only has MLS games)
//     const responseArray = response.data.response;
//     for (let i = 0; i < responseArray.length; i++) {
//       console.log(response.data.response[i].league.name);
//       console.log(response.data.response[i].teams.home.name);
//       console.log(response.data.response[i].teams.away.name);
//       console.log(response.data.response[i].goals.home);
//       console.log(response.data.response[i].goals.away);
//       //also include date and time of the game
//       console.log(response.data.response[i].fixture.date);
//     }
//     // console.log(response.data.response[0].league.name);
//     // console.log(response.data.response[0].teams.home.name);
//     // console.log(response.data.response[0].teams.away.name);
//     // console.log(response.data.response[0].goals.home);
//     // console.log(response.data.response[0].goals.away);
//     // //also include date and time of the game
//     // console.log(response.data.response[0].fixture.date);

//     // console.log("--------------------");

//     // // grab the second fixture
//     // const fixture = response.data.response[4];
//     // console.log(fixture.league.name);
//     // console.log(fixture.teams.home.name);
//     // console.log(fixture.teams.away.name);
//     // console.log(fixture.goals.home);
//     // console.log(fixture.goals.away);
//     // console.log(fixture.fixture.date);

//     //need to expand the above to grab all fixtures at once
//   } catch (error) {
//     console.error(error);
//   }
// }

// getFixtures();

const axios = require("axios");
const { apiKey } = require("../../../config.json");

const teamID = "1596";
const host = "api-football-v1.p.rapidapi.com";

/*
Something to note about the fixtures below:
- The timezone should be in pacific time, some are in the correct time but others are not? 
- need to investigate why some are not in the right time? Maybe its too far out in the future?
*/

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
      //timezone should be in pacific time
      timezone: "America/Los_Angeles",
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": host,
    },
  };

  const fixturesObject = { data: [] };

  try {
    //console.log(response.data);   //overview of the data
    const response = await axios.request(options);

    // first need to order fixutres by date, got a couple of them out of order
    // response.data.response.sort((a, b) => {
    //   return new Date(a.fixture.date) - new Date(b.fixture.date);
    // });

    // now we list all the fixtures/schedule for the team
    response.data.response.forEach((fixture, index) => {
      let finished;
      // console.log(`Fixture ${index + 1}:`); // the number or index represents the fixture

      // date and time are together so wanna break those two apart
      const fixtureDate = new Date(fixture.fixture.date);
      // console.log(
      //   `Date: ${fixtureDate.toLocaleDateString()}, Time: ${fixtureDate.toLocaleTimeString()}`
      // );

      fixtureDate < new Date() ? (finished = true) : (finished = false);

      const dateToString = fixtureDate.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      // const timeToString = fixtureDate.toLocaleTimeString("en-US", {
      //   timeZone: "America/Los_Angeles",
      // });
      const fixtureIdToString = fixture.fixture.id.toString() ?? "N/A";

      // print out the match information
      // console.log(`Referee: ${fixture.fixture.referee}`);
      // console.log(`Venue: ${fixture.fixture.venue.name}`);
      // console.log(`City: ${fixture.fixture.venue.city}`);
      // console.log(`Fixture ID: ${fixture.fixture.id}`);
      // console.log(`League: ${fixture.league.name}`);
      // console.log(`Home Team: ${fixture.teams.home.name}`);
      // console.log(`Away Team: ${fixture.teams.away.name}`);
      // console.log(`Home Team Goals: ${fixture.goals.home}`);
      // console.log(`Away Team Goals: ${fixture.goals.away}`);
      // console.log("\n");

      fixturesObject.data.push({
        fixture_id: fixtureIdToString,
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        stadium: fixture.fixture.venue.name,
        referee: fixture.fixture.referee,
        home_goals: fixture.goals.home,
        away_goals: fixture.goals.away,
        first_scorer: null,
        date: dateToString,
        // time: timeToString,
        finished: finished,
      });
    });

    // console.log(response.data.response);
  } catch (error) {
    console.error(error);
  }

  console.log(fixturesObject);
  return fixturesObject;
}

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
// need to adjust so it separates date and time like the fixtures function, maybe make a helper function
async function getCurrentMatch() {
  try {
    // get the current date, use new Date() to go back to normal
    // currently, messing around with the date
    const currentDate = new Date("2024-02-05");

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

    // Find the next fixture after the current date
    let nextFixture = null;
    for (const fixture of fixturesResponse.data.response) {
      const fixtureDate = new Date(fixture.fixture.date);
      if (fixtureDate > currentDate) {
        nextFixture = fixture;
        break;
      }
    }

    // Display match information for the next fixture
    if (nextFixture) {
      return {
        date: nextFixture.fixture.date,
        referee: nextFixture.fixture.referee,
        venueName: nextFixture.fixture.venue.name,
        venueCity: nextFixture.fixture.venue.city,
        fixtureId: nextFixture.fixture.id,
        leagueName: nextFixture.league.name,
        homeTeam: nextFixture.teams.home.name,
        awayTeam: nextFixture.teams.away.name,
        homeTeamGoals: nextFixture.goals.home,
        awayTeamGoals: nextFixture.goals.away,
      };
      // console.log("Next Fixture:");
      // console.log(`Date: ${nextFixture.fixture.date}`);
      // console.log(`Referee: ${nextFixture.fixture.referee}`);
      // console.log(`Venue: ${nextFixture.fixture.venue.name}`);
      // console.log(`City: ${nextFixture.fixture.venue.city}`);
      // console.log(`Fixture ID: ${nextFixture.fixture.id}`);
      // console.log(`League: ${nextFixture.league.name}`);
      // console.log(`Home Team: ${nextFixture.teams.home.name}`);
      // console.log(`Away Team: ${nextFixture.teams.away.name}`);
      // console.log(`Home Team Goals: ${nextFixture.goals.home}`);
      // console.log(`Away Team Goals: ${nextFixture.goals.away}`);
    } else {
      console.log("No upcoming fixtures.");
    }
  } catch (error) {
    console.error(error);
  }
}

// getCurrentMatch();
// getFirstScorer();
getFixtures();

module.exports = { getFixtures, getFirstScorer, getCurrentMatch };
