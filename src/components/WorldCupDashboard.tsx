"use client";

import { useEffect, useMemo, useState } from "react";

type Team = {
  id?: number;
  name?: string;
  shortName?: string;
  tla?: string;
  crest?: string;
};

type Match = {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  stage?: string;
  group?: string;
  lastUpdated?: string;
  venue?: string | null;
  homeTeam?: Team;
  awayTeam?: Team;
  score?: {
    winner?: string | null;
    fullTime?: { home?: number | null; away?: number | null };
    halfTime?: { home?: number | null; away?: number | null };
  };
  referees?: { name?: string; nationality?: string; type?: string }[];
};

const navItems = [
  { id: "inicio", label: "Início", icon: "⌂" },
  { id: "ao-vivo", label: "Jogos ao vivo", icon: "●" },
  { id: "calendario", label: "Calendário", icon: "▦" },
  { id: "grupos", label: "Grupos", icon: "☷" },
  { id: "mata-mata", label: "Mata-mata", icon: "✣" },
  { id: "selecoes", label: "Seleções", icon: "♛" },
  { id: "resultados", label: "Resultados", icon: "✓" },
];

function stageLabel(stage?: string) {
  const map: Record<string, string> = {
    GROUP_STAGE: "Fase de grupos",
    LAST_16: "Oitavas de final",
    QUARTER_FINALS: "Quartas de final",
    SEMI_FINALS: "Semifinais",
    THIRD_PLACE: "Disputa de 3º lugar",
    FINAL: "Final",
  };

  return map[stage || ""] || stage || "A definir";
}

function groupLabel(group?: string) {
  if (!group) return "Sem grupo";
  return group.replace("GROUP_", "Grupo ");
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    SCHEDULED: "Agendado",
    TIMED: "Agendado",
    IN_PLAY: "Ao vivo",
    PAUSED: "Intervalo",
    FINISHED: "Encerrado",
    POSTPONED: "Adiado",
    SUSPENDED: "Suspenso",
    CANCELED: "Cancelado",
  };

  return map[status || ""] || status || "A definir";
}

function teamName(team?: Team) {
  return team?.shortName || team?.name || "A definir";
}

function score(match: Match) {
  const home = match.score?.fullTime?.home;
  const away = match.score?.fullTime?.away;
  return `${home ?? "-"} - ${away ?? "-"}`;
}

function formatDate(value?: string) {
  if (!value) return "A definir";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isLive(match: Match) {
  return ["IN_PLAY", "PAUSED"].includes(match.status);
}

export default function WorldCupDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("ALL");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [goalAlerts, setGoalAlerts] = useState<
    { id: string; match: string; score: string; time: string }[]
  >([]);

  async function loadMatches() {
    try {
      const response = await fetch("/api/live-worldcup", { cache: "no-store" });
      const data = await response.json();
      const nextMatches: Match[] = data.matches || [];

      setMatches((previous) => {
        if (previous.length > 0) {
          const alerts: { id: string; match: string; score: string; time: string }[] = [];

          nextMatches.forEach((next) => {
            const old = previous.find((item) => item.id === next.id);
            if (!old) return;

            const oldHome = old.score?.fullTime?.home ?? 0;
            const oldAway = old.score?.fullTime?.away ?? 0;
            const newHome = next.score?.fullTime?.home ?? 0;
            const newAway = next.score?.fullTime?.away ?? 0;

            if (newHome > oldHome || newAway > oldAway) {
              alerts.unshift({
                id: `${next.id}-${Date.now()}`,
                match: `${teamName(next.homeTeam)} x ${teamName(next.awayTeam)}`,
                score: `${newHome} - ${newAway}`,
                time: new Intl.DateTimeFormat("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date()),
              });
            }
          });

          if (alerts.length > 0) {
            setGoalAlerts((current) => [...alerts, ...current].slice(0, 4));
          }
        }

        return nextMatches;
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
    const interval = window.setInterval(loadMatches, 20000);
    return () => window.clearInterval(interval);
  }, []);

  const liveMatches = matches.filter(isLive);
  const finishedMatches = matches.filter((match) => match.status === "FINISHED");
  const upcomingMatches = matches.filter((match) =>
    ["SCHEDULED", "TIMED"].includes(match.status)
  );

  const stageMatches = useMemo(() => {
    if (activeStage === "ALL") return matches;
    return matches.filter((match) => match.stage === activeStage);
  }, [matches, activeStage]);

  const groups = useMemo(() => {
    const result: Record<string, { teams: Team[]; matches: Match[] }> = {};

    matches.forEach((match) => {
      const key = groupLabel(match.group);
      result[key] ||= { teams: [], matches: [] };
      result[key].matches.push(match);

      [match.homeTeam, match.awayTeam].forEach((team) => {
        if (!team?.name) return;
        if (!result[key].teams.some((item) => item.name === team.name)) {
          result[key].teams.push(team);
        }
      });
    });

    return result;
  }, [matches]);

  const teams = useMemo(() => {
    const map = new Map<string, Team>();

    matches.forEach((match) => {
      [match.homeTeam, match.awayTeam].forEach((team) => {
        if (team?.name) map.set(team.name, team);
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }, [matches]);

  const selectedTeamMatches = selectedTeam
    ? matches.filter(
        (match) =>
          match.homeTeam?.name === selectedTeam.name ||
          match.awayTeam?.name === selectedTeam.name
      )
    : [];

  const knockoutStages = ["LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"];

  return (
    <main className="wc-app">
      <aside className="sidebar">
        <a className="brand" href="#inicio">
          <img src="/world-cup-trophy-real.png" alt="Taça da Copa" />
          <strong>
            WORLD CUP
            <br />
            2026
          </strong>
        </a>

        <nav>
          {navItems.map((item) => (
            <a className="nav" href={`#${item.id}`} key={item.id}>
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="side-card">
          <img src="/world-cup-trophy-real.png" alt="Taça da Copa" />
          <h3>Copa do Mundo 2026</h3>
          <p>Estados Unidos, Canadá e México recebem o maior torneio da história.</p>
        </div>
      </aside>

      <section className="main">
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <span>Dashboard em tempo real</span>
            <h1>COPA DO MUNDO 2026</h1>
            <p>Jogos, placares, grupos, rodadas, mata-mata e seleções.</p>

            <div className="facts">
              <div>
                <strong>11 JUN</strong>
                <small>Início</small>
              </div>
              <div>
                <strong>19 JUL</strong>
                <small>Final</small>
              </div>
              <div>
                <strong>48</strong>
                <small>Seleções</small>
              </div>
              <div>
                <strong>16</strong>
                <small>Cidades</small>
              </div>
            </div>
          </div>

          <img className="hero-trophy" src="/world-cup-trophy-real.png" alt="Taça da Copa do Mundo" />
        </section>

        {goalAlerts.length > 0 && (
          <section className="goal-alerts">
            {goalAlerts.map((goal) => (
              <article className="goal-alert" key={goal.id}>
                <strong>⚽ Gol detectado</strong>
                <span>{goal.match}</span>
                <b>{goal.score}</b>
                <small>Atualizado às {goal.time}</small>
              </article>
            ))}
          </section>
        )}

        <section className="stats">
          <article>
            <span>⚽</span>
            <small>Jogos carregados</small>
            <strong>{matches.length || "-"}</strong>
          </article>
          <article>
            <span>●</span>
            <small>Ao vivo</small>
            <strong>{liveMatches.length}</strong>
          </article>
          <article>
            <span>✓</span>
            <small>Encerrados</small>
            <strong>{finishedMatches.length}</strong>
          </article>
          <article>
            <span>▦</span>
            <small>Seleções encontradas</small>
            <strong>{teams.length || "-"}</strong>
          </article>
        </section>

        <section className="panel" id="ao-vivo">
          <div className="panel-head">
            <div>
              <span>Tempo real</span>
              <h2>Jogos ao vivo</h2>
            </div>
            <button onClick={loadMatches}>Atualizar agora</button>
          </div>

          {loading && <p className="muted">Carregando jogos...</p>}

          {!loading && liveMatches.length === 0 && (
            <p className="muted">Nenhum jogo ao vivo neste momento.</p>
          )}

          <div className="match-grid">
            {liveMatches.map((match) => (
              <article className="match-card live" key={match.id}>
                <div className="match-top">
                  <span>{stageLabel(match.stage)}</span>
                  <b>{statusLabel(match.status)}</b>
                </div>

                <div className="teams-row">
                  <button onClick={() => setSelectedTeam(match.homeTeam || null)}>
                    {match.homeTeam?.crest && <img src={match.homeTeam.crest} alt="" />}
                    {teamName(match.homeTeam)}
                  </button>

                  <strong>{score(match)}</strong>

                  <button onClick={() => setSelectedTeam(match.awayTeam || null)}>
                    {match.awayTeam?.crest && <img src={match.awayTeam.crest} alt="" />}
                    {teamName(match.awayTeam)}
                  </button>
                </div>

                <p>{groupLabel(match.group)} · Rodada {match.matchday || "-"}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="calendario">
          <div className="panel-head">
            <div>
              <span>Calendário</span>
              <h2>Jogos por fase</h2>
            </div>
          </div>

          <div className="tabs">
            {["ALL", "GROUP_STAGE", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"].map((stage) => (
              <button
                key={stage}
                className={activeStage === stage ? "active" : ""}
                onClick={() => setActiveStage(stage)}
              >
                {stage === "ALL" ? "Todos" : stageLabel(stage)}
              </button>
            ))}
          </div>

          <div className="match-list">
            {stageMatches.map((match) => (
              <article className="calendar-card" key={match.id}>
                <div>
                  <small>{stageLabel(match.stage)} · {groupLabel(match.group)}</small>
                  <h3>{teamName(match.homeTeam)} x {teamName(match.awayTeam)}</h3>
                  <p>Rodada {match.matchday || "-"} · {formatDate(match.utcDate)}</p>
                </div>

                <div>
                  <strong>{score(match)}</strong>
                  <span>{statusLabel(match.status)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="grupos">
          <div className="panel-head">
            <div>
              <span>Grupos</span>
              <h2>Calendário por grupos</h2>
            </div>
          </div>

          <div className="groups-grid">
            {Object.entries(groups).map(([group, data]) => (
              <article className="group-card" key={group}>
                <h3>{group}</h3>

                <div className="group-teams">
                  {data.teams.map((team) => (
                    <button key={team.name} onClick={() => setSelectedTeam(team)}>
                      {team.crest && <img src={team.crest} alt="" />}
                      {teamName(team)}
                    </button>
                  ))}
                </div>

                <div className="group-matches">
                  {data.matches.slice(0, 6).map((match) => (
                    <p key={match.id}>
                      {formatDate(match.utcDate)} · {teamName(match.homeTeam)} x {teamName(match.awayTeam)}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="mata-mata">
          <div className="panel-head">
            <div>
              <span>Fase final</span>
              <h2>Mata-mata</h2>
            </div>
          </div>

          <div className="bracket-grid">
            {knockoutStages.map((stage) => {
              const list = matches.filter((match) => match.stage === stage);

              return (
                <article className="bracket-col" key={stage}>
                  <h3>{stageLabel(stage)}</h3>

                  {list.length === 0 ? (
                    <div className="bracket-box">Aguardando definição oficial</div>
                  ) : (
                    list.map((match) => (
                      <div className="bracket-box" key={match.id}>
                        <span>{teamName(match.homeTeam)} x {teamName(match.awayTeam)}</span>
                        <strong>{score(match)}</strong>
                      </div>
                    ))
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel" id="selecoes">
          <div className="panel-head">
            <div>
              <span>Seleções</span>
              <h2>Times encontrados no calendário</h2>
            </div>
          </div>

          <div className="teams-grid">
            {teams.map((team) => (
              <button className="team-card" key={team.name} onClick={() => setSelectedTeam(team)}>
                {team.crest && <img src={team.crest} alt="" />}
                <strong>{teamName(team)}</strong>
                <small>{team.tla || "Copa 2026"}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel" id="resultados">
          <div className="panel-head">
            <div>
              <span>Resultados</span>
              <h2>Jogos encerrados</h2>
            </div>
          </div>

          <div className="match-list">
            {finishedMatches.length === 0 && (
              <p className="muted">Nenhum jogo encerrado disponível ainda.</p>
            )}

            {finishedMatches.map((match) => (
              <article className="calendar-card" key={match.id}>
                <div>
                  <small>{stageLabel(match.stage)} · {groupLabel(match.group)}</small>
                  <h3>{teamName(match.homeTeam)} x {teamName(match.awayTeam)}</h3>
                  <p>Atualizado em {match.lastUpdated ? formatDate(match.lastUpdated) : "tempo real"}</p>
                </div>

                <div>
                  <strong>{score(match)}</strong>
                  <span>{statusLabel(match.status)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {selectedTeam && (
          <div className="modal-backdrop" onClick={() => setSelectedTeam(null)}>
            <section className="team-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={() => setSelectedTeam(null)}>×</button>

              <div className="modal-title">
                {selectedTeam.crest && <img src={selectedTeam.crest} alt="" />}
                <div>
                  <span>Seleção</span>
                  <h2>{teamName(selectedTeam)}</h2>
                  <p>{selectedTeam.tla || "Copa do Mundo 2026"}</p>
                </div>
              </div>

              <h3>Jogos desta seleção</h3>

              <div className="modal-matches">
                {selectedTeamMatches.map((match) => (
                  <article key={match.id}>
                    <span>{formatDate(match.utcDate)}</span>
                    <strong>{teamName(match.homeTeam)} x {teamName(match.awayTeam)}</strong>
                    <b>{score(match)}</b>
                    <small>{statusLabel(match.status)}</small>
                  </article>
                ))}
              </div>

              <p className="modal-note">
                Escalação, técnico, autor do gol e história dos jogadores dependem de uma fonte
                que envie eventos e elenco. A fonte atual mostra placares reais, calendário,
                grupos, rodadas, escudos e status das partidas.
              </p>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
