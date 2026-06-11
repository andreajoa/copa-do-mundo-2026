import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://v3.football.api-sports.io";

export async function GET(request: NextRequest) {
  const fixture = request.nextUrl.searchParams.get("fixture");

  if (!fixture) {
    return NextResponse.json({ error: "Missing fixture id" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/fixtures/lineups?fixture=${fixture}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY || "",
        },
        next: { revalidate: 60 },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to load fixture lineups" },
      { status: 500 }
    );
  }
}
