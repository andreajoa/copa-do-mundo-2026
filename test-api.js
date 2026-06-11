const axios = require("axios");

async function run() {
  const token = process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    throw new Error("FOOTBALL_DATA_API_KEY não encontrada.");
  }

  const res = await axios.get(
    "https://api.football-data.org/v4/competitions/WC/matches",
    {
      headers: {
        "X-Auth-Token": token,
      },
    }
  );

  console.log(JSON.stringify(res.data, null, 2));
}

run().catch((err) => {
  console.error("Erro:", err.response?.data || err.message);
});
