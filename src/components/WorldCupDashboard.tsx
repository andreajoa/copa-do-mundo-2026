"use client";

import { useEffect, useMemo, useState } from "react";

type Fixture = {
  id: number;
  date: string;
  status: {
    short: string;
    long: string;
    elapsed?: number | null;
  };
  teams: {
    home: { name: string; logo?: string; winner?: boolean | null };
    away: { name: string; logo?: string; winner?: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  league: { round?: string };
  venue?: { name?: string; city?: string };
};

type GoalAlert = {
  id: string;
  match: string;
  score: string;
  detectedAt: string;
  scorer: string;
  story: string;
};

const featuredFallback: string[] = [];

type StandingRow = {
  rank: number;
  team: { name: string; logo?: string };
  all: { played: number; win: number; draw: number; lose: number };
  goalsDiff: number;
  points: number;
};

type TopScorer = {
  player: { name: string; photo?: string };
  statistics: { team: { name: string; logo?: string }; goals: { total: number } }[];
};

function mapFootballDataToFixture(match: any): Fixture {
  return {
    id: match.id,
    date: match.utcDate,
    status: {
      short: match.status,
      long: match.status,
      elapsed: null,
    },
    teams: {
      home: {
        name: match.homeTeam?.shortName || match.homeTeam?.name || "A definir",
        logo: match.homeTeam?.crest,
      },
      away: {
        name: match.awayTeam?.shortName || match.awayTeam?.name || "A definir",
        logo: match.awayTeam?.crest,
      },
    },
    goals: {
      home: match.score?.fullTime?.home ?? null,
      away: match.score?.fullTime?.away ?? null,
    },
    league: {
      round: `${match.group || "Grupo"} · Rodada ${match.matchday || "-"}`,
    },
    venue: { name: match.venue || "" },
  };
}

function normalizeFixture(item: any): Fixture {
  if (item.fixture && item.teams) {
    return {
      id: item.fixture.id,
      date: item.fixture.date,
      status: item.fixture.status,
      teams: item.teams,
      goals: item.goals,
      league: item.league,
      venue: item.fixture.venue,
    };
  }

  return mapFootballDataToFixture(item);
}

function isLive(fixture: Fixture) {
  return ["1H", "2H", "HT", "ET", "P", "LIVE", "IN_PLAY", "PAUSED"].includes(
    fixture.status.short
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function score(fixture: Fixture) {
  return `${fixture.goals.home ?? "-"} - ${fixture.goals.away ?? "-"}`;
}

export default function WorldCupDashboard() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState<GoalAlert[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);

  async function loadExtraRealData() {
    try {
      const [standingsResponse, scorersResponse] = await Promise.all([
        fetch("/api/api-football/standings", { cache: "no-store" }),
        fetch("/api/api-football/topscorers", { cache: "no-store" }),
      ]);

      const standingsData = await standingsResponse.json();
      const scorersData = await scorersResponse.json();

      const firstLeague = standingsData.response?.[0]?.league?.standings?.[0] || [];
      setStandings(firstLeague);

      setTopScorers(scorersData.response || []);
    } catch {
      setStandings([]);
      setTopScorers([]);
    }
  }

  async function loadFixtures() {
    try {
      let nextFixtures: Fixture[] = [];

      const apiFootball = await fetch("/api/api-football/fixtures", { cache: "no-store" });
      const apiFootballData = await apiFootball.json();

      if (apiFootballData.response?.length) {
        nextFixtures = apiFootballData.response.map(normalizeFixture);
      } else {
        const oldApi = await fetch("/api/matches", { cache: "no-store" });
        const oldData = await oldApi.json();
        nextFixtures = (oldData.matches || []).map(normalizeFixture);
      }

      setFixtures((previous) => {
        if (previous.length > 0) {
          const alerts: GoalAlert[] = [];

          nextFixtures.forEach((next) => {
            const old = previous.find((item) => item.id === next.id);
            if (!old) return;

            const oldHome = old.goals.home ?? 0;
            const oldAway = old.goals.away ?? 0;
            const nextHome = next.goals.home ?? 0;
            const nextAway = next.goals.away ?? 0;

            if (nextHome > oldHome || nextAway > oldAway) {
              const scoringTeam = nextHome > oldHome ? next.teams.home.name : next.teams.away.name;

              alerts.unshift({
                id: `${next.id}-${Date.now()}`,
                match: `${next.teams.home.name} x ${next.teams.away.name}`,
                score: `${nextHome} - ${nextAway}`,
                detectedAt: new Intl.DateTimeFormat("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date()),
                scorer: "Autor aguardando evento da API",
                story: `Gol detectado para ${scoringTeam}. Quando o endpoint de eventos estiver conectado, aqui aparecerá o jogador, minuto oficial e assistência.`,
              });
            }
          });

          if (alerts.length) {
            setGoalAlerts((current) => [...alerts, ...current].slice(0, 4));
          }
        }

        return nextFixtures;
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFixtures();
    loadExtraRealData();

    const interval = window.setInterval(loadFixtures, 20000);
    const extraInterval = window.setInterval(loadExtraRealData, 60000);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(extraInterval);
    };
  }, []);

  const liveFixtures = fixtures.filter(isLive);
  const upcomingFixtures = fixtures.filter((fixture) => !isLive(fixture)).slice(0, 6);
  const totalGames = fixtures.length;
  const realTeams = Array.from(
    new Map(
      fixtures
        .flatMap((fixture) => [fixture.teams.home, fixture.teams.away])
        .filter((team) => team?.name && team.name !== "A definir")
        .map((team) => [team.name, team])
    ).values()
  );
  const realVenues = Array.from(
    new Set(fixtures.map((fixture) => fixture.venue?.name).filter(Boolean))
  );

  const groups = useMemo(() => {
    return fixtures.reduce<Record<string, Fixture[]>>((acc, fixture) => {
      const round = fixture.league.round || "Grupo A";
      const key = round.includes("Group") ? round : round.split(" - ")[0] || "Grupo A";
      acc[key] ||= [];
      acc[key].push(fixture);
      return acc;
    }, {});
  }, [fixtures]);

  const firstLive = liveFixtures[0] || fixtures[0];

  return (
    <main className="wc-app">
      <aside className="sidebar">
        <div className="brand">
          <img src="/world-cup-trophy-real.png" alt="" />
          <strong>FIFA WORLD CUP<br />2026</strong>
        </div>

        {["Início", "Jogos Ao Vivo", "Grupos", "Tabela Geral", "Mata-Mata", "Seleções", "Jogadores", "Estatísticas", "Estádios", "Notícias", "Favoritos"].map((item, index) => (
          <button className={index === 0 ? "nav active" : "nav"} key={item}>
            <span>{["⌂","◉","▦","☷","✣","♛","♙","▥","⌑","▤","★"][index]}</span>
            {item}
          </button>
        ))}

        <div className="favorite">
          <small>SELEÇÃO FAVORITA</small>
          <div>🇧🇷 Brasil <span>★</span></div>
        </div>

        <div className="side-card">
          <img src="/world-cup-trophy-real.png" alt="" />
          <h3>VIVA A EMOÇÃO DA COPA 2026!</h3>
          <p>O maior espetáculo do futebol mundial está chegando.</p>
          <button>SAIBA MAIS</button>
        </div>
      </aside>

      <section className="main">
        <header className="hero">
          <div className="top-actions">
            <button>Fuso horário</button>
            <button>São Paulo (GMT-3)</button>
            <button>🔔</button>
          </div>

          <div className="hero-content">
            <div>
              <h1>COPA DO<br />MUNDO 2026</h1>
              <p>11 DE JUNHO – 19 DE JULHO • EUA, CANADÁ E MÉXICO</p>

              <div className="countdown">
                <div><strong>364</strong><span>DIAS</span></div>
                <div><strong>12</strong><span>HORAS</span></div>
                <div><strong>45</strong><span>MIN</span></div>
                <div><strong>32</strong><span>SEG</span></div>
              </div>
            </div>

            <img className="hero-trophy" src="/world-cup-trophy-real.png" alt="Taça da Copa do Mundo" />
          </div>
        </header>

        {goalAlerts.length > 0 && (
          <div className="goal-alerts">
            {goalAlerts.map((goal) => (
              <div className="goal-alert" key={goal.id}>
                <div>
                  <strong>⚽ GOL DETECTADO</strong>
                  <h3>{goal.match}</h3>
                  <p>Placar: {goal.score} · Detectado às {goal.detectedAt}</p>
                </div>
                <button>
                  Ver autor
                  <span><b>{goal.scorer}</b><br />{goal.story}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="stats">
          <div><span>⚽</span><small>JOGOS DA API</small><strong>{totalGames || "-"}</strong></div>
          <div><span>👥</span><small>SELEÇÕES NA API</small><strong>{realTeams.length || "-"}</strong></div>
          <div><span>✦</span><small>GRUPOS NA API</small><strong>{Object.keys(groups).length || "-"}</strong></div>
          <div><span>🏟️</span><small>ESTÁDIOS NA API</small><strong>{realVenues.length || "-"}</strong></div>
        </div>

        <div className="grid-main">
          <section className="panel live-panel">
            <div className="panel-head">
              <h2>JOGOS AO VIVO</h2>
              <span>AO VIVO</span>
            </div>

            {loading && <p className="muted">Carregando jogos...</p>}

            {liveFixtures.length === 0 && (
              <p className="muted">Nenhum jogo ao vivo neste momento.</p>
            )}

            {liveFixtures.map((fixture) => (
              <article className="live-match" key={fixture.id}>
                <small>{fixture.league.round || "Grupo"}</small>
                <strong className="elapsed">
                  {isLive(fixture) ? `${fixture.status.long} • ${fixture.status.elapsed || 0}:00` : fixture.status.long}
                </strong>

                <div className="score-row">
                  <div>
                    {fixture.teams.home.logo && <img src={fixture.teams.home.logo} alt="" />}
                    <b>{fixture.teams.home.name}</b>
                  </div>
                  <strong>{score(fixture)}</strong>
                  <div>
                    {fixture.teams.away.logo && <img src={fixture.teams.away.logo} alt="" />}
                    <b>{fixture.teams.away.name}</b>
                  </div>
                </div>
              </article>
            ))}

            <h3>PRÓXIMOS JOGOS</h3>
            <div className="upcoming">
              {upcomingFixtures.map((fixture) => (
                <div key={fixture.id}>
                  <time>{formatDate(fixture.date)}</time>
                  <span>{fixture.teams.home.name}</span>
                  <b>x</b>
                  <span>{fixture.teams.away.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>CLASSIFICAÇÃO - GRUPO A</h2>
            <table>
              <thead><tr><th>#</th><th>SELEÇÃO</th><th>J</th><th>V</th><th>SG</th><th>PTS</th></tr></thead>
              <tbody>
                {standings.length === 0 && (
                  <tr>
                    <td colSpan={6}>Classificação real ainda não disponível na API.</td>
                  </tr>
                )}

                {standings.slice(0, 8).map((row) => (
                  <tr key={row.team.name}>
                    <td>{row.rank}</td>
                    <td>{row.team.logo && <img className="mini-logo" src={row.team.logo} alt="" />} {row.team.name}</td>
                    <td>{row.all.played}</td>
                    <td>{row.all.win}</td>
                    <td>{row.goalsDiff}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="mt">ARTILHEIROS</h2>
            <div className="scorers">
              {topScorers.length === 0 && (
                <p className="muted">Artilharia real ainda não disponível na API.</p>
              )}

              {topScorers.slice(0, 5).map((item, i) => (
                <div key={item.player.name}>
                  <b>{i + 1}</b>
                  <span>{item.player.photo && <img className="avatar" src={item.player.photo} alt="" />} {item.player.name}</span>
                  <small>{item.statistics?.[0]?.team?.name || "-"}</small>
                  <strong>{item.statistics?.[0]?.goals?.total || 0}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="panel bracket">
          <h2>MATA-MATA</h2>
          <div className="bracket-grid">
            {["OITAVAS DE FINAL", "QUARTAS DE FINAL", "SEMIFINAIS", "FINAL"].map((stage, index) => (
              <div className="bracket-col" key={stage}>
                <h3>{stage}</h3>
                <div className="bracket-box">{index === 3 ? <img src="/world-cup-trophy-real.png" alt="" /> : "Vencedor"}</div>
                <div className="bracket-box">{index === 3 ? "Final da Copa do Mundo 2026" : "Vencedor"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>DESTAQUES DAS SELEÇÕES</h2>
            <a>Ver todas ›</a>
          </div>
          <div className="teams-grid">
            {(realTeams.length ? realTeams.slice(0, 8) : featuredFallback).map((team: any) => (
              <article className="team-card" key={team.name || team}>
                <h3>
                  {team.logo && <img className="mini-logo" src={team.logo} alt="" />} {team.name || team}
                  <span>★</span>
                </h3>
                <small>DADOS REAIS</small>
                <p>Seleção presente nos jogos retornados pela API.</p>
                <div>
                  <strong>API<br />Football</strong>
                  <strong>STATUS<br />Real</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>CALENDÁRIO POR GRUPOS</h2>
          <div className="groups-grid">
            {Object.entries(groups).slice(0, 12).map(([group, list]) => (
              <article key={group}>
                <h3>{group}</h3>
                {list.slice(0, 4).map((fixture) => (
                  <p key={fixture.id}>{fixture.teams.home.name} x {fixture.teams.away.name}</p>
                ))}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
