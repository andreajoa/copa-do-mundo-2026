"use client";

import { useEffect, useMemo, useState } from "react";

type ApiMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage?: string;
  group?: string;
  matchday?: number;
  homeTeam?: { name?: string; shortName?: string; crest?: string };
  awayTeam?: { name?: string; shortName?: string; crest?: string };
  score?: {
    fullTime?: { home?: number | null; away?: number | null };
  };
};

const stages = ["Todos", "GROUP_STAGE", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"];

function stageLabel(stage?: string) {
  const map: Record<string, string> = {
    GROUP_STAGE: "Fase de Grupos",
    LAST_16: "Oitavas de Final",
    QUARTER_FINALS: "Quartas de Final",
    SEMI_FINALS: "Semifinais",
    THIRD_PLACE: "Disputa de 3º Lugar",
    FINAL: "Final",
  };
  return map[stage || ""] || stage || "A definir";
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    SCHEDULED: "Agendado",
    TIMED: "Agendado",
    IN_PLAY: "Ao vivo",
    PAUSED: "Intervalo",
    FINISHED: "Encerrado",
    POSTPONED: "Adiado",
  };
  return map[status || ""] || status || "A definir";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function WorldCupDashboard() {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState("Todos");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await fetch("/api/matches", { cache: "no-store" });
        const data = await response.json();
        setMatches(data.matches || []);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const filteredMatches = useMemo(() => {
    if (selectedStage === "Todos") return matches;
    return matches.filter((match) => match.stage === selectedStage);
  }, [matches, selectedStage]);

  const liveMatches = matches.filter((match) =>
    ["IN_PLAY", "PAUSED"].includes(match.status)
  );

  const groups = useMemo(() => {
    const result: Record<string, ApiMatch[]> = {};

    matches.forEach((match) => {
      const key = match.group || "Sem grupo";
      if (!result[key]) result[key] = [];
      result[key].push(match);
    });

    return result;
  }, [matches]);

  const selectedTeamMatches = selectedTeam
    ? matches.filter(
        (match) =>
          match.homeTeam?.name === selectedTeam ||
          match.awayTeam?.name === selectedTeam
      )
    : [];

  return (
    <main className="world-page">
      <section className="hero">
        <div className="hero-lights" />
        <div className="trophy">🏆</div>

        <div className="hero-title">
          <h1>FIFA WORLD CUP</h1>
          <p>Jogos ao vivo, calendário, grupos, rodadas e mata-mata</p>
        </div>
      </section>

      <section className="dashboard">
        <div className="section-title">
          <span>Tempo real</span>
          <h2>Jogos ao vivo</h2>
          <p>Dados carregados diretamente da API Football Data.</p>
        </div>

        {loading ? (
          <div className="empty">Carregando jogos...</div>
        ) : liveMatches.length > 0 ? (
          <div className="live-grid">
            {liveMatches.map((match) => (
              <article className="live-card" key={match.id}>
                <strong>● AO VIVO</strong>
                <h3>
                  {match.homeTeam?.shortName || match.homeTeam?.name} x{" "}
                  {match.awayTeam?.shortName || match.awayTeam?.name}
                </h3>
                <p>{stageLabel(match.stage)} · Rodada {match.matchday || "-"}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">Nenhum jogo ao vivo neste momento.</div>
        )}

        <div className="tabs">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={selectedStage === stage ? "active" : ""}
            >
              {stage === "Todos" ? "Todos" : stageLabel(stage)}
            </button>
          ))}
        </div>

        <div className="section-title">
          <span>Calendário</span>
          <h2>Jogos por fase</h2>
        </div>

        <div className="matches">
          {filteredMatches.map((match) => {
            const homeScore = match.score?.fullTime?.home;
            const awayScore = match.score?.fullTime?.away;

            return (
              <article className="match-card" key={match.id}>
                <div className="teams">
                  <button onClick={() => setSelectedTeam(match.homeTeam?.name || null)}>
                    {match.homeTeam?.crest && <img src={match.homeTeam.crest} alt="" />}
                    <span>{match.homeTeam?.name || "A definir"}</span>
                  </button>

                  <div className="score">
                    {homeScore ?? "-"} x {awayScore ?? "-"}
                  </div>

                  <button onClick={() => setSelectedTeam(match.awayTeam?.name || null)}>
                    {match.awayTeam?.crest && <img src={match.awayTeam.crest} alt="" />}
                    <span>{match.awayTeam?.name || "A definir"}</span>
                  </button>
                </div>

                <div className="match-info">
                  <strong>{stageLabel(match.stage)}</strong>
                  <span>{match.group || "Mata-mata"} · Rodada {match.matchday || "-"}</span>
                  <span>{formatDate(match.utcDate)}</span>
                  <em>{statusLabel(match.status)}</em>
                </div>
              </article>
            );
          })}
        </div>

        <div className="section-title">
          <span>Grupos</span>
          <h2>Calendário por grupos</h2>
        </div>

        <div className="groups">
          {Object.entries(groups).map(([group, groupMatches]) => (
            <article className="group-card" key={group}>
              <h3>{group}</h3>
              {groupMatches.map((match) => (
                <p key={match.id}>
                  Rodada {match.matchday || "-"} · {match.homeTeam?.shortName || match.homeTeam?.name || "A definir"} x{" "}
                  {match.awayTeam?.shortName || match.awayTeam?.name || "A definir"}
                </p>
              ))}
            </article>
          ))}
        </div>

        {selectedTeam && (
          <section className="team-panel">
            <div>
              <span>Seleção</span>
              <h2>{selectedTeam}</h2>
              <p>
                A API atual mostra jogos, datas, placares, fases, grupos e escudos.
                Para escalação, técnico e história individual dos jogadores, precisamos
                adicionar um endpoint de squads/jogadores.
              </p>
            </div>

            <div>
              <h3>Jogos desta seleção</h3>
              {selectedTeamMatches.map((match) => (
                <p key={match.id}>
                  {formatDate(match.utcDate)} · {match.homeTeam?.shortName || match.homeTeam?.name} x{" "}
                  {match.awayTeam?.shortName || match.awayTeam?.name}
                </p>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
