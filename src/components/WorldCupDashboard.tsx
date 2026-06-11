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

type NewsItem = {
  title?: string;
  source?: string;
  pubDate?: string;
};

type Enrichment = {
  featuredMatchReports?: any[];
  teams?: Record<string, any>;
};

const navItems = [
  { id: "inicio", label: "Início", icon: "⌂" },
  { id: "resultado", label: "Resultado de hoje", icon: "✓" },
  { id: "ao-vivo", label: "Jogos ao vivo", icon: "●" },
  { id: "noticias", label: "Notícias", icon: "▤" },
  { id: "grupos", label: "Grupos", icon: "☷" },
  { id: "calendario", label: "Calendário", icon: "▦" },
  { id: "mata-mata", label: "Mata-mata", icon: "✣" },
  { id: "selecoes", label: "Seleções", icon: "♛" },
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [enrichment, setEnrichment] = useState<Enrichment>({});
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("ALL");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  async function loadMatches() {
    try {
      const response = await fetch("/api/live-worldcup", { cache: "no-store" });
      const data = await response.json();
      setMatches(data.matches || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadContent() {
    const [newsResponse, enrichmentResponse] = await Promise.all([
      fetch("/api/worldcup-news", { cache: "no-store" }),
      fetch("/api/worldcup-enrichment", { cache: "no-store" }),
    ]);

    const newsData = await newsResponse.json();
    const enrichmentData = await enrichmentResponse.json();

    setNews(newsData.news || []);
    setEnrichment(enrichmentData || {});
  }

  useEffect(() => {
    loadMatches();
    loadContent();

    const matchInterval = window.setInterval(loadMatches, 20000);
    const contentInterval = window.setInterval(loadContent, 300000);

    return () => {
      window.clearInterval(matchInterval);
      window.clearInterval(contentInterval);
    };
  }, []);

  const liveMatches = matches.filter(isLive);
  const finishedMatches = matches.filter((match) => match.status === "FINISHED");
  const mexicoMatch =
    matches.find((match) => match.id === 537327) ||
    finishedMatches.find((match) =>
      `${teamName(match.homeTeam)} ${teamName(match.awayTeam)}`
        .toLowerCase()
        .includes("mexico")
    );

  const mexicoReport = enrichment.featuredMatchReports?.[0];

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

  const selectedTeamInfo = selectedTeam?.name
    ? enrichment.teams?.[selectedTeam.name]
    : null;

  const selectedTeamMatches = selectedTeam
    ? matches.filter(
        (match) =>
          match.homeTeam?.name === selectedTeam.name ||
          match.awayTeam?.name === selectedTeam.name
      )
    : [];

  const selectedReport =
    selectedMatch?.id === 537327 ? mexicoReport : null;

  return (
    <main className="wc-app">
      <aside className="sidebar">
        <a className="brand" href="#inicio">
          <img src="/world-cup-trophy-real.svg" alt="Taça da Copa" />
          <strong>WORLD CUP<br />2026</strong>
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
          <img src="/world-cup-trophy-real.svg" alt="Taça da Copa" />
          <h3>Copa do Mundo 2026</h3>
          <p>Placar, jogos, grupos, notícias e histórias em um painel organizado.</p>
        </div>
      </aside>

      <section className="main">
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <span>Dashboard em tempo real</span>
            <h1>COPA DO MUNDO 2026</h1>
            <p>Resultados, notícias, grupos, seleções e informações relevantes para quem acompanha futebol.</p>

            <div className="facts">
              <div><strong>{matches.length || "-"}</strong><small>Jogos</small></div>
              <div><strong>{liveMatches.length}</strong><small>Ao vivo</small></div>
              <div><strong>{finishedMatches.length}</strong><small>Encerrados</small></div>
              <div><strong>{teams.length || "-"}</strong><small>Seleções</small></div>
            </div>
          </div>

          <img className="hero-trophy" src="/world-cup-trophy-real.svg" alt="Taça da Copa do Mundo" />
        </section>

        <section className="panel result-feature" id="resultado">
          <div className="panel-head">
            <div>
              <span>Resultado em destaque</span>
              <h2>México x África do Sul</h2>
            </div>
            <button onClick={loadMatches}>Atualizar placar</button>
          </div>

          {mexicoMatch ? (
            <div className="feature-match" onClick={() => setSelectedMatch(mexicoMatch)}>
              <div>
                {mexicoMatch.homeTeam?.crest && <img src={mexicoMatch.homeTeam.crest} alt="" />}
                <h3>{teamName(mexicoMatch.homeTeam)}</h3>
              </div>

              <strong>{score(mexicoMatch)}</strong>

              <div>
                {mexicoMatch.awayTeam?.crest && <img src={mexicoMatch.awayTeam.crest} alt="" />}
                <h3>{teamName(mexicoMatch.awayTeam)}</h3>
              </div>
            </div>
          ) : (
            <p className="muted">Carregando resultado do jogo...</p>
          )}

          {mexicoReport && (
            <div className="match-story">
              <p>{mexicoReport.summary}</p>
              <div className="goals-line">
                {mexicoReport.goals.map((goal: any) => (
                  <article key={`${goal.player}-${goal.minute}`}>
                    <b>⚽ {goal.minute}</b>
                    <strong>{goal.player}</strong>
                    <span>{goal.half}</span>
                    <p>{goal.description}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="panel" id="ao-vivo">
          <div className="panel-head">
            <div><span>Tempo real</span><h2>Jogos ao vivo</h2></div>
            <button onClick={loadMatches}>Atualizar agora</button>
          </div>

          {loading && <p className="muted">Carregando jogos...</p>}
          {!loading && liveMatches.length === 0 && <p className="muted">Nenhum jogo ao vivo neste momento.</p>}

          <div className="match-grid">
            {liveMatches.map((match) => (
              <article className="match-card live" key={match.id} onClick={() => setSelectedMatch(match)}>
                <div className="match-top"><span>{stageLabel(match.stage)}</span><b>{statusLabel(match.status)}</b></div>
                <div className="teams-row">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedTeam(match.homeTeam || null); }}>
                    {match.homeTeam?.crest && <img src={match.homeTeam.crest} alt="" />}
                    {teamName(match.homeTeam)}
                  </button>
                  <strong>{score(match)}</strong>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedTeam(match.awayTeam || null); }}>
                    {match.awayTeam?.crest && <img src={match.awayTeam.crest} alt="" />}
                    {teamName(match.awayTeam)}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="noticias">
          <div className="panel-head">
            <div>
              <span>Atualizado a cada 5 minutos</span>
              <h2>Notícias e contexto da Copa</h2>
            </div>
            <button onClick={loadContent}>Atualizar notícias</button>
          </div>

          <div className="news-grid">
            {news.length === 0 && <p className="muted">Carregando notícias...</p>}
            {news.map((item, index) => (
              <article className="news-card" key={`${item.title}-${index}`}>
                <small>{item.source || "Fonte pública"}</small>
                <h3>{item.title}</h3>
                <p>{item.pubDate ? new Date(item.pubDate).toLocaleString("pt-BR") : "Atualizado recentemente"}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="grupos">
          <div className="panel-head"><div><span>Grupos</span><h2>Calendário por grupos</h2></div></div>
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
                    <p key={match.id} onClick={() => setSelectedMatch(match)}>
                      {formatDate(match.utcDate)} · {teamName(match.homeTeam)} x {teamName(match.awayTeam)}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="calendario">
          <div className="panel-head"><div><span>Calendário</span><h2>Jogos por fase</h2></div></div>
          <div className="tabs">
            {["ALL", "GROUP_STAGE", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"].map((stage) => (
              <button key={stage} className={activeStage === stage ? "active" : ""} onClick={() => setActiveStage(stage)}>
                {stage === "ALL" ? "Todos" : stageLabel(stage)}
              </button>
            ))}
          </div>

          <div className="match-list">
            {stageMatches.map((match) => (
              <article className="calendar-card" key={match.id} onClick={() => setSelectedMatch(match)}>
                <div>
                  <small>{stageLabel(match.stage)} · {groupLabel(match.group)}</small>
                  <h3>{teamName(match.homeTeam)} x {teamName(match.awayTeam)}</h3>
                  <p>Rodada {match.matchday || "-"} · {formatDate(match.utcDate)}</p>
                </div>
                <div><strong>{score(match)}</strong><span>{statusLabel(match.status)}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="mata-mata">
          <div className="panel-head"><div><span>Fase final</span><h2>Mata-mata</h2></div></div>
          <div className="bracket-grid">
            {["LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"].map((stage) => {
              const list = matches.filter((match) => match.stage === stage);
              return (
                <article className="bracket-col" key={stage}>
                  <h3>{stageLabel(stage)}</h3>
                  {list.length === 0 ? <div className="bracket-box">Aguardando definição oficial</div> : list.map((match) => (
                    <div className="bracket-box" key={match.id} onClick={() => setSelectedMatch(match)}>
                      <span>{teamName(match.homeTeam)} x {teamName(match.awayTeam)}</span>
                      <strong>{score(match)}</strong>
                    </div>
                  ))}
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel" id="selecoes">
          <div className="panel-head"><div><span>Seleções</span><h2>Times encontrados no calendário</h2></div></div>
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

        {selectedMatch && (
          <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
            <section className="team-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={() => setSelectedMatch(null)}>×</button>
              <div className="modal-title">
                <div>
                  <span>Detalhes do jogo</span>
                  <h2>{teamName(selectedMatch.homeTeam)} x {teamName(selectedMatch.awayTeam)}</h2>
                  <p>{stageLabel(selectedMatch.stage)} · {groupLabel(selectedMatch.group)} · {formatDate(selectedMatch.utcDate)}</p>
                </div>
              </div>

              <div className="feature-match small">
                <div>{selectedMatch.homeTeam?.crest && <img src={selectedMatch.homeTeam.crest} alt="" />}<h3>{teamName(selectedMatch.homeTeam)}</h3></div>
                <strong>{score(selectedMatch)}</strong>
                <div>{selectedMatch.awayTeam?.crest && <img src={selectedMatch.awayTeam.crest} alt="" />}<h3>{teamName(selectedMatch.awayTeam)}</h3></div>
              </div>

              {selectedReport ? (
                <div className="match-story">
                  <p>{selectedReport.summary}</p>
                  <h3>Gols</h3>
                  <div className="goals-line">
                    {selectedReport.goals.map((goal: any) => (
                      <article key={`${goal.player}-${goal.minute}`}>
                        <b>⚽ {goal.minute}</b>
                        <strong>{goal.player}</strong>
                        <span>{goal.half}</span>
                        <p>{goal.description}</p>
                      </article>
                    ))}
                  </div>
                  <h3>Cartões e momentos importantes</h3>
                  {selectedReport.cards.map((card: string) => <p key={card}>• {card}</p>)}
                </div>
              ) : (
                <p className="modal-note">Esta fonte mostra placar, horário, grupo, fase, árbitro e status. Eventos detalhados ainda não estão disponíveis para este jogo.</p>
              )}
            </section>
          </div>
        )}

        {selectedTeam && (
          <div className="modal-backdrop" onClick={() => setSelectedTeam(null)}>
            <section className="team-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={() => setSelectedTeam(null)}>×</button>
              <div className="modal-title">
                {selectedTeam.crest && <img src={selectedTeam.crest} alt="" />}
                <div>
                  <span>Seleção</span>
                  <h2>{selectedTeamInfo?.name || teamName(selectedTeam)}</h2>
                  <p>{selectedTeam.tla || "Copa do Mundo 2026"}</p>
                </div>
              </div>

              {selectedTeamInfo ? (
                <>
                  <p className="modal-note"><b>Técnico:</b> {selectedTeamInfo.coach}</p>
                  <p>{selectedTeamInfo.profile}</p>
                  <h3>Jogadores em destaque</h3>
                  <div className="player-list">
                    {selectedTeamInfo.players.map((player: any) => (
                      <article key={player.name}>
                        <strong>{player.name}</strong>
                        <span>{player.position} · {player.club}</span>
                        <p>{player.story}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <p className="modal-note">Informações editoriais deste time ainda serão adicionadas pelo coletor de conteúdo.</p>
              )}

              <h3>Jogos desta seleção</h3>
              <div className="modal-matches">
                {selectedTeamMatches.map((match) => (
                  <article key={match.id} onClick={() => setSelectedMatch(match)}>
                    <span>{formatDate(match.utcDate)}</span>
                    <strong>{teamName(match.homeTeam)} x {teamName(match.awayTeam)}</strong>
                    <b>{score(match)}</b>
                    <small>{statusLabel(match.status)}</small>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
