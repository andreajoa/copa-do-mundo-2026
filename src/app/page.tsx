async function getMatches() {
  const res = await fetch("http://localhost:3000/api/matches", {
    cache: "no-store",
  });

  return res.json();
}

export default async function Home() {
  const data = await getMatches();

  const matches = data.matches || [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl p-6">

        <div className="mb-10">
          <h1 className="text-6xl font-black">
            FIFA WORLD CUP 2026
          </h1>

          <p className="mt-3 text-zinc-400">
            Live Dashboard • {matches.length} jogos
          </p>
        </div>

        <div className="grid gap-4">

          {matches.slice(0, 50).map((match: any) => (
            <div
              key={match.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="mb-3 flex justify-between">
                <span className="text-xs text-zinc-500">
                  {match.group}
                </span>

                <span className="text-xs text-green-400">
                  {match.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-bold">
                  {match.homeTeam?.name}
                </div>

                <div className="text-xl font-black">
                  {match.score?.fullTime?.home ?? "-"}
                  {" x "}
                  {match.score?.fullTime?.away ?? "-"}
                </div>

                <div className="font-bold text-right">
                  {match.awayTeam?.name}
                </div>
              </div>

              <div className="mt-3 text-sm text-zinc-400">
                {new Date(match.utcDate).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
