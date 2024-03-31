const axios = require("axios");
const { apiKey } = require("../../../config.json");

const db = require("../dbObjects.js");

const TEAMID = "1596";
const HOST = "api-football-v1.p.rapidapi.com";
const SEASON = "2024";
const TIMEZONE = "America/Los_Angeles";
const STATUS = "NS";

async function seedDB(params) {
  const home_team = params.home_team;
  const away_team = params.away_team;
  const stadium = params.stadium;
  const refe = params.referee;
  const home_goals = params.home_goals;
  const away_goals = params.away_goals;
  const first_scorer = params.first_scorer;

  const match = await db.Match.create({
    home_team,
    away_team,
    stadium,
    refe,
    home_goals,
    away_goals,
    first_scorer,
  });
  console.log(match);
}

async function getFixtures() {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: {
      season: SEASON,
      team: TEAMID,
      next: 1,
      //   from: "2024-02-23",
      //   to: "2024-10-20",
      //timezone should be in pacific time
      timezone: TIMEZONE,
      status: STATUS,
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": HOST,
    },
  };

  try {
    const result = await axios.request(options);
    console.log(result.data); //overview of the data

    // the number or index represents the fixture (only has MLS games)
    const responseArray = result.data.response;
    // for (let i = 0; i < responseArray.length; i++) {
    //   console.log(result.data.response[i].league.name);
    //   console.log(result.data.response[i].teams.home.name);
    //   console.log(result.data.response[i].teams.away.name);
    //   console.log(result.data.response[i].goals.home);
    //   console.log(result.data.response[i].goals.away);
    //   //also include date and time of the game
    //   console.log(result.data.response[i].fixture.date);
    // }
    // console.log("home team: ", result.data.response[0].teams.home.name);
    // console.log("away team: ", result.data.response[0].teams.away.name);
    // console.log("stadium: ", result.data.response[0].fixture.venue.name);
    // console.log(
    //   "referee:",
    //   result.data.response[0].fixture.referee ?? "Not available yet."
    // );
    // console.log(
    //   "home goals: ",
    //   result.data.response[0].goals.home ?? "Not available yet."
    // );
    // console.log(
    //   "away goals: ",
    //   result.data.response[0].goals.away ?? "Not available yet."
    // );
    // console.log(
    //   "first scorer: ",
    //   result.data.response[0].goalscorers[0].player.name ?? "Does not exist."
    // );

    // console.log(result.data.response[0].league.name);
    //also include date and time of the game
    // console.log(result.data.response[0].fixture.date);

    // console.log("--------------------");

    // // grab the second fixture
    // const fixture = result.data.response[4];
    // console.log(fixture.league.name);
    // console.log(fixture.teams.home.name);
    // console.log(fixture.teams.away.name);
    // console.log(fixture.goals.home);
    // console.log(fixture.goals.away);
    // console.log(fixture.fixture.date);

    //need to expand the above to grab all fixtures at once

    const data = {
      home_team: result.data.response[0].teams.home.name,
      away_team: result.data.response[0].teams.away.name,
      stadium: result.data.response[0].fixture.venue.name,
      referee: result.data.response[0].fixture.referee,
      home_goals: result.data.response[0].goals.home,
      away_goals: result.data.response[0].goals.away,
      first_scorer: null,
    };
    return data;
  } catch (error) {
    console.error(error);
  }
}

function getUpcomingMatch() {
  const result = getFixtures().then((data) => {
    seedDB(data);
  });

  return result;
}

// module.exports = {
//   getUpcomingMatch,
// };

module.exports = {
  seedDB,
  getFixtures,
};
