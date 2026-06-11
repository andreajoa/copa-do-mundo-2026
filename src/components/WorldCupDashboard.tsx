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

const featuredTeams = [
  { name: "Brasil", flag: "🇧🇷", coach: "Dorival Júnior", ranking: "3º", titles: 5 },
  { name: "França", flag: "🇫🇷", coach: "Didier Deschamps", ranking: "2º", titles: 2 },
  { name: "Argentina", flag: "🇦🇷", coach: "Lionel Scaloni", ranking: "1º", titles: 3 },
  { name: "Portugal", flag: "🇵🇹", coach: "Roberto Martínez", ranking: "6º", titles: 0 },
];

const scorers = [
  ["H. Lozano", "México", 3],
  ["G. Martin", "México", 2],
  ["J. David", "Canadá", 2],
  ["F. Valverde", "Uruguai", 1],
  ["K. Mbappé", "França", 1],
];

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
    const interval = window.setInterval(loadFixtures, 20000);
    return () => window.clearInterval(interval);
  }, []);

  const liveFixtures = fixtures.filter(isLive);
  const upcomingFixtures = fixtures.filter((fixture) => !isLive(fixture)).slice(0, 6);
  const totalGames = fixtures.length || 104;

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
          <img src="/world-cup-trophy.svg" alt="" />
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
          <img src="/world-cup-trophy.svg" alt="" />
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

            <img className="hero-trophy" src="/world-cup-trophy.svg" alt="Taça da Copa do Mundo" />
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
          <div><span>⚽</span><small>JOGOS</small><strong>{totalGames}</strong></div>
          <div><span>👥</span><small>SELEÇÕES</small><strong>48</strong></div>
          <div><span>✦</span><small>GRUPOS</small><strong>12</strong></div>
          <div><span>🏟️</span><small>ESTÁDIOS</small><strong>16</strong></div>
        </div>

        <div className="grid-main">
          <section className="panel live-panel">
            <div className="panel-head">
              <h2>JOGOS AO VIVO</h2>
              <span>AO VIVO</span>
            </div>

            {loading && <p className="muted">Carregando jogos...</p>}

            {(liveFixtures.length ? liveFixtures : fixtures.slice(0, 2)).map((fixture) => (
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
                {["México","Suíça","Coreia do Sul","África do Sul"].map((team, i) => (
                  <tr key={team}><td>{i + 1}</td><td>{team}</td><td>1</td><td>{i < 2 ? 1 : 0}</td><td>{i === 0 ? "+2" : i === 1 ? "+1" : "-1"}</td><td>{i < 2 ? 3 : 0}</td></tr>
                ))}
              </tbody>
            </table>

            <h2 className="mt">ARTILHEIROS</h2>
            <div className="scorers">
              {scorers.map((item, i) => (
                <div key={item[0]}>
                  <b>{i + 1}</b><span>{item[0]}</span><small>{item[1]}</small><strong>{item[2]}</strong>
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
                <div className="bracket-box">{index === 3 ? <img src="/world-cup-trophy.svg" alt="" /> : "Vencedor"}</div>
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
            {featuredTeams.map((team) => (
              <article className="team-card" key={team.name}>
                <h3>{team.flag} {team.name} <span>★</span></h3>
                <small>TÉCNICO</small>
                <p>{team.coach}</p>
                <div>
                  <strong>RANKING FIFA<br />{team.ranking}</strong>
                  <strong>TÍTULOS<br />{team.titles}</strong>
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
