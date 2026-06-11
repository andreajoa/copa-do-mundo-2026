type Match = {
  id: number;
  group: string;
  status: string;
  utcDate: string;
  homeTeam: {
    name: string;
    crest?: string;
  };
  awayTeam: {
    name: string;
    crest?: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
};

async function getMatches() {
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/matches`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Home() {
  const data = await getMatches();

  const matches: Match[] = data.matches || [];

  const brazilMatches = matches.filter(
    (match) =>
      match.homeTeam?.name?.includes("Brazil") ||
      match.awayTeam?.name?.includes("Brazil")
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-12">
          <h1 className="text-6xl font-black tracking-tight">
            FIFA WORLD CUP 2026
          </h1>

          <p className="mt-3 text-zinc-400">
            Dashboard ao vivo da Copa do Mundo
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">
              Jogos
            </div>

            <div className="mt-2 text-5xl font-black">
              {matches.length}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">
              Início
            </div>

            <div className="mt-2 text-2xl font-bold">
              11 Jun 2026
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">
              Final
            </div>

            <div className="mt-2 text-2xl font-bold">
              19 Jul 2026
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">
              Jogos do Brasil
            </div>

            <div className="mt-2 text-5xl font-black text-green-400">
              {brazilMatches.length}
            </div>
          </div>

        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Todos os Jogos
          </h2>
        </div>

        <div className="grid gap-4">

          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="mb-4 flex justify-between">

                <span className="text-xs text-zinc-500">
                  {match.group}
                </span>

                <span className="text-xs text-green-400">
                  {match.status}
                </span>

              </div>

              <div className="grid grid-cols-3 items-center gap-4">

                <div className="flex items-center gap-3">

                  {match.homeTeam?.crest && (
                    <img
                      src={match.homeTeam.crest}
                      alt={match.homeTeam.name}
                      className="h-8 w-8"
                    />
                  )}

                  <span className="font-bold">
                    {match.homeTeam.name}
                  </span>

                </div>

                <div className="text-center text-2xl font-black">

                  {match.score?.fullTime?.home ?? "-"}

                  {" x "}

                  {match.score?.fullTime?.away ?? "-"}

                </div>

                <div className="flex items-center justify-end gap-3">

                  <span className="font-bold">
                    {match.awayTeam.name}
                  </span>

                  {match.awayTeam?.crest && (
                    <img
                      src={match.awayTeam.crest}
                      alt={match.awayTeam.name}
                      className="h-8 w-8"
                    />
                  )}

                </div>

              </div>

              <div className="mt-4 text-sm text-zinc-400">

                {new Date(match.utcDate).toLocaleString(
                  "pt-BR",
                  {
                    timeZone: "America/Sao_Paulo",
                  }
                )}

              </div>

            </div>
          ))}

        </div>

      </div>
    </main>
  );
}
