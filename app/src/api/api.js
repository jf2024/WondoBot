const axios = require("axios");
const { apiKey } = require("../../../config.json");
const teamID = "1596";
const host = "api-football-v1.p.rapidapi.com";

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

  const fixturesObject = { data: [] };

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
        first_scorer: "none",
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
    return firstScorer ? firstScorer.player.name : "None";
  } catch (error) {
    console.error("Error getting first scorer:", error);
  }
}

//grabs players and their photos
async function getPlayers() {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/players/squads",
    params: { team: teamID },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": host,
    },
  };

  try {
    const response = await axios.request(options);
    // console.log(response.data.response[0].players)
    const players = response.data.response[0].players.map((player) => ({
      name: player.name,
      photoUrl: player.photo,
    }));
    return players;
  } catch (error) {
    console.error(error);
    return [];
  }
}

getFixtures().then((data) => console.log(data));

module.exports = { getFixtures, getFirstScorer, getPlayers };
