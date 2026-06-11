import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY || "",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      matches: data.matches || [],
      competition: data.competition || null,
      season: data.season || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar dados da Copa" },
      { status: 500 }
    );
  }
}
