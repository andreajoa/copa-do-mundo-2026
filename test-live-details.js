require("dotenv").config({ path: ".env.local" });

async function run() {
  const token = process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    throw new Error("FOOTBALL_DATA_API_KEY não encontrada no .env.local");
  }

  const listResponse = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
    headers: { "X-Auth-Token": token },
  });

  const listData = await listResponse.json();

  console.log("===== CAMPOS DO PRIMEIRO JOGO =====");
  console.log(JSON.stringify(listData.matches?.[0], null, 2));

  const firstId = listData.matches?.[0]?.id;

  if (!firstId) {
    console.log("Nenhum jogo encontrado.");
    return;
  }

  const detailResponse = await fetch(`https://api.football-data.org/v4/matches/${firstId}`, {
    headers: { "X-Auth-Token": token },
  });

  const detailData = await detailResponse.json();

  console.log("");
  console.log("===== DETALHE DO JOGO =====");
  console.log(JSON.stringify(detailData, null, 2));
}

run().catch((err) => {
  console.error("ERRO:", err.response?.data || err.message);
});
