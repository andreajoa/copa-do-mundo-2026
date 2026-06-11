export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h1 className="text-5xl font-bold">
            FIFA World Cup 2026
          </h1>

          <p className="mt-4 text-zinc-400">
            Canada • USA • Mexico
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-2 text-xl font-bold">
              Total de Jogos
            </h2>

            <div className="text-5xl font-bold text-green-400">
              104
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-2 text-xl font-bold">
              Início
            </h2>

            <div className="text-2xl">
              11 Jun 2026
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-2 text-xl font-bold">
              Final
            </h2>

            <div className="text-2xl">
              19 Jul 2026
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-4 text-2xl font-bold">
            Dashboard em construção
          </h2>

          <p className="text-zinc-400">
            API conectada com Football Data.
          </p>

          <p className="text-zinc-400">
            Próximo passo: carregar os 104 jogos automaticamente.
          </p>
        </div>
      </div>
    </main>
  );
}
