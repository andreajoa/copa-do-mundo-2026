const axios = require("axios");

async function run() {
  const res = await axios.get(
    "https://api.football-data.org/v4/competitions/WC/matches",
    {
      headers: {
        "X-Auth-Token": "83403618fc824a13b1bd601a82a24eb8"
      }
    }
  );

  const match = res.data.matches[0];

  console.log("\nHOME TEAM");
  console.log(JSON.stringify(match.homeTeam, null, 2));

  console.log("\nAWAY TEAM");
  console.log(JSON.stringify(match.awayTeam, null, 2));
}

run().catch(err => {
  console.error("Erro:", err.response?.data || err.message);
});
