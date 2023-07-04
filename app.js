const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// get players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select player_id as playerId, player_name as playerName
    from player_details;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//GET player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select player_id as playerId, player_name as playerName
    from player_details
    where player_id=${playerId};
    `;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(playerDetails);
});

//PUT player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
    update player_details
    set 
    player_name="${playerName}"
    where player_id="${playerId}";
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//GET match API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    select match_id as matchId, match, year
    from match_details
    where match_id=${matchId};
    `;
  const match = await db.get(getMatchQuery);
  response.send(match);
});

//GET matches of player API
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchOfPlayerQuery = `
    select match_details.match_id as matchId, match_details.match, match_details.year
    from match_details natural join player_match_score
    where player_id=${playerId}
    
   
    `;
  const playersDetails = await db.all(getMatchOfPlayerQuery);
  response.send(playersDetails);
});

//GET players of match API
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerOfMatchQuery = `
    select player_details.player_id as playerId, 
    player_details.player_name as playerName
    from player_details natural join player_match_score
    where match_id=${matchId}
    
    `;
  const matchDetails = await db.all(getPlayerOfMatchQuery);
  response.send(matchDetails);
});

//GET stats of playerdetails
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerOfMatchQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const matchDetails = await db.get(getPlayerOfMatchQuery);
  response.send(matchDetails);
});

module.exports = app;
