import WorldCupDashboard from "@/components/WorldCupDashboard";

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

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl p-6">
        <WorldCupDashboard
          matches={data.matches || []}
        />
      </div>
    </main>
  );
}
