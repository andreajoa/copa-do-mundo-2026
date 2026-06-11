import { NextResponse } from "next/server";

const BASE_URL = "https://v3.football.api-sports.io";

export async function GET() {
  try {
    const response = await fetch(
      `${BASE_URL}/fixtures?league=1&season=2026`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY || "",
        },
        next: { revalidate: 30 },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to load API-Football fixtures" },
      { status: 500 }
    );
  }
}
