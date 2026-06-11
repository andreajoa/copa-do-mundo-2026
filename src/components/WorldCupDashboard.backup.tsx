"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function WorldCupDashboard({
  matches,
}: {
  matches: any[];
}) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("ALL");

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const teamMatch =
        match.homeTeam?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        match.awayTeam?.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const groupMatch =
        group === "ALL" ||
        match.group === group;

      return teamMatch && groupMatch;
    });
  }, [matches, search, group]);

  const brazilMatches = filteredMatches.filter(
    (m) =>
      m.homeTeam?.name?.includes("Brazil") ||
      m.awayTeam?.name?.includes("Brazil")
  );

  const openingDate = new Date("2026-06-11T19:00:00Z");
  const now = new Date();

  const daysLeft = Math.max(
    0,
    Math.floor(
      (openingDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div>

      <section className="mb-12 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-10">

        <div className="flex flex-col gap-6">

          <div>
            <h1 className="text-6xl font-black tracking-tight">
              FIFA WORLD CUP 2026
            </h1>

            <p className="mt-4 text-zinc-400">
              Dashboard em tempo real
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">

            <div className="rounded-2xl bg-black/40 p-5">
              <div className="text-sm text-zinc-500">
                Jogos
              </div>

              <div className="text-4xl font-black">
                {matches.length}
              </div>
            </div>

            <div className="rounded-2xl bg-black/40 p-5">
              <div className="text-sm text-zinc-500">
                Jogos Brasil
              </div>

              <div className="text-4xl font-black text-green-400">
                {brazilMatches.length}
              </div>
            </div>

            <div className="rounded-2xl bg-black/40 p-5">
              <div className="text-sm text-zinc-500">
                Grupos
              </div>

              <div className="text-4xl font-black">
                12
              </div>
            </div>

            <div className="rounded-2xl bg-black/40 p-5">
              <div className="text-sm text-zinc-500">
                Faltam
              </div>

              <div className="text-4xl font-black text-yellow-400">
                {daysLeft}
              </div>
            </div>

          </div>
        </div>

      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2">

        <input
          className="rounded-xl border border-zinc-700 bg-zinc-900 p-4"
          placeholder="Buscar seleção..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="rounded-xl border border-zinc-700 bg-zinc-900 p-4"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="ALL">Todos os grupos</option>

          {[...new Set(matches.map((m) => m.group))]
            .filter(Boolean)
            .map((group) => (
              <option key={group}>
                {group}
              </option>
            ))}
        </select>

      </div>

      <div className="grid gap-4">

        {filteredMatches.map((match) => {
          const isBrazil =
            match.homeTeam?.name?.includes("Brazil") ||
            match.awayTeam?.name?.includes("Brazil");

          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={
                isBrazil
                  ? "rounded-2xl border border-green-500 bg-zinc-900 p-5"
                  : "rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              }
            >
              <div className="mb-3 flex justify-between">

                <span className="text-xs text-zinc-500">
                  {match.group}
                </span>

                <span className="text-xs text-green-400">
                  {match.status}
                </span>

              </div>

              <div className="grid grid-cols-3 items-center gap-4">

                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    {match.homeTeam?.name}
                  </span>
                </div>

                <div className="text-center text-2xl font-black">
                  {match.score?.fullTime?.home ?? "-"}
                  {" x "}
                  {match.score?.fullTime?.away ?? "-"}
                </div>

                <div className="text-right font-bold">
                  {match.awayTeam?.name}
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

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
