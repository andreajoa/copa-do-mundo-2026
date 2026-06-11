"use client";

import { useMemo, useState } from "react";

type Team = {
  name: string;
  flag: string;
  coach: string;
  bio: string;
  players: { name: string; position: string; story: string }[];
};

type Match = {
  id: number;
  group: string;
  round: string;
  stage: "Grupos" | "Oitavas" | "Quartas" | "Semifinal" | "Final";
  date: string;
  time: string;
  stadium: string;
  home: string;
  away: string;
  status: "Ao vivo" | "Agendado" | "Encerrado";
  score?: string;
};

const teams: Team[] = [
  {
    name: "Brasil",
    flag: "🇧🇷",
    coach: "Dorival Júnior",
    bio: "A Seleção Brasileira é a maior campeã da Copa do Mundo, com cinco títulos.",
    players: [
      { name: "Neymar Jr.", position: "Atacante", story: "Um dos jogadores brasileiros mais talentosos da sua geração." },
      { name: "Vinícius Jr.", position: "Atacante", story: "Atacante explosivo, decisivo e referência ofensiva do futebol mundial." },
      { name: "Alisson", position: "Goleiro", story: "Goleiro seguro, experiente e peça importante da Seleção Brasileira." },
    ],
  },
  {
    name: "Argentina",
    flag: "🇦🇷",
    coach: "Lionel Scaloni",
    bio: "Atual campeã mundial, conhecida por sua tradição, raça e grandes craques.",
    players: [
      { name: "Lionel Messi", position: "Atacante", story: "Campeão mundial e um dos maiores jogadores da história do futebol." },
      { name: "Lautaro Martínez", position: "Atacante", story: "Centroavante forte, técnico e decisivo." },
      { name: "Emiliano Martínez", position: "Goleiro", story: "Goleiro campeão mundial, conhecido por defesas decisivas." },
    ],
  },
  {
    name: "França",
    flag: "🇫🇷",
    coach: "Didier Deschamps",
    bio: "Uma das seleções mais fortes do mundo, campeã em 1998 e 2018.",
    players: [
      { name: "Kylian Mbappé", position: "Atacante", story: "Velocidade, finalização e protagonismo em grandes jogos." },
      { name: "Griezmann", position: "Meia", story: "Jogador inteligente, técnico e muito importante taticamente." },
      { name: "Tchouaméni", position: "Volante", story: "Meio-campista moderno, físico e com ótima leitura de jogo." },
    ],
  },
  {
    name: "Inglaterra",
    flag: "🏴",
    coach: "Gareth Southgate",
    bio: "Seleção tradicional, campeã em 1966 e sempre cercada de expectativa.",
    players: [
      { name: "Harry Kane", position: "Atacante", story: "Artilheiro nato, líder e referência ofensiva inglesa." },
      { name: "Bellingham", position: "Meia", story: "Meia completo, jovem, decisivo e com personalidade." },
      { name: "Saka", position: "Atacante", story: "Ponta habilidoso, rápido e muito eficiente." },
    ],
  },
];

const matches: Match[] = [
  { id: 1, group: "Grupo A", round: "Rodada 1", stage: "Grupos", date: "11/06/2026", time: "16:00", stadium: "Estádio Azteca", home: "México", away: "África do Sul", status: "Ao vivo", score: "0 - 0" },
  { id: 2, group: "Grupo B", round: "Rodada 1", stage: "Grupos", date: "12/06/2026", time: "19:00", stadium: "SoFi Stadium", home: "Brasil", away: "Marrocos", status: "Agendado" },
  { id: 3, group: "Grupo C", round: "Rodada 1", stage: "Grupos", date: "13/06/2026", time: "21:00", stadium: "MetLife Stadium", home: "Argentina", away: "Japão", status: "Agendado" },
  { id: 4, group: "Grupo D", round: "Rodada 2", stage: "Grupos", date: "18/06/2026", time: "18:00", stadium: "AT&T Stadium", home: "França", away: "Senegal", status: "Agendado" },
  { id: 5, group: "Grupo E", round: "Rodada 3", stage: "Grupos", date: "24/06/2026", time: "20:00", stadium: "Hard Rock Stadium", home: "Inglaterra", away: "Uruguai", status: "Agendado" },
  { id: 6, group: "Mata-mata", round: "Oitavas de final", stage: "Oitavas", date: "04/07/2026", time: "17:00", stadium: "Mercedes-Benz Stadium", home: "1º Grupo A", away: "2º Grupo B", status: "Agendado" },
  { id: 7, group: "Mata-mata", round: "Quartas de final", stage: "Quartas", date: "09/07/2026", time: "20:00", stadium: "Gillette Stadium", home: "Vencedor O1", away: "Vencedor O2", status: "Agendado" },
  { id: 8, group: "Mata-mata", round: "Semifinal", stage: "Semifinal", date: "14/07/2026", time: "21:00", stadium: "AT&T Stadium", home: "Vencedor Q1", away: "Vencedor Q2", status: "Agendado" },
  { id: 9, group: "Mata-mata", round: "Final", stage: "Final", date: "19/07/2026", time: "19:00", stadium: "MetLife Stadium", home: "Finalista 1", away: "Finalista 2", status: "Agendado" },
];

const groups = Array.from({ length: 12 }, (_, i) => ({
  name: `Grupo ${String.fromCharCode(65 + i)}`,
  teams: ["Brasil", "Argentina", "França", "Inglaterra"].sort(() => 0.5 - Math.random()).slice(0, 4),
}));

export default function WorldCupDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0]);
  const [selectedPlayer, setSelectedPlayer] = useState(selectedTeam.players[0]);
  const [stage, setStage] = useState<Match["stage"] | "Todos">("Todos");

  const filteredMatches = useMemo(() => {
    return stage === "Todos" ? matches : matches.filter((match) => match.stage === stage);
  }, [stage]);

  function selectTeam(team: Team) {
    setSelectedTeam(team);
    setSelectedPlayer(team.players[0]);
  }

  return (
    <main className="world-page">
      <section className="hero">
        <div className="hero-art">
          <div className="beam pink" />
          <div className="beam cyan" />
          <div className="beam orange" />
          <div className="trophy-emoji">🏆</div>
        </div>

        <div className="hero-card">
          <span className="eyebrow">Dashboard Oficial da Copa 2026</span>
          <h1>FIFA WORLD CUP</h1>
          <p>Jogos, grupos, rodadas, mata-mata, seleções e jogadores em um só painel.</p>
        </div>
      </section>

      <section className="dashboard">
        <div className="section-head">
          <span>Ao vivo</span>
          <h2>Central de Jogos</h2>
          <p>Acompanhe partidas, datas, horários, grupos, fases e status em tempo real.</p>
        </div>

        <div className="live-grid">
          {matches.filter((match) => match.status === "Ao vivo").map((match) => (
            <article className="live-card" key={match.id}>
              <div className="live-badge">● AO VIVO</div>
              <h3>{match.home} x {match.away}</h3>
              <strong>{match.score}</strong>
              <p>{match.round} · {match.group}</p>
              <small>{match.stadium}</small>
            </article>
          ))}
        </div>

        <div className="tabs">
          {["Todos", "Grupos", "Oitavas", "Quartas", "Semifinal", "Final"].map((item) => (
            <button
              key={item}
              className={stage === item ? "active" : ""}
              onClick={() => setStage(item as Match["stage"] | "Todos")}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="match-list">
          {filteredMatches.map((match) => (
            <article className="match-card" key={match.id}>
              <div>
                <span>{match.stage}</span>
                <h3>{match.home} x {match.away}</h3>
                <p>{match.group} · {match.round}</p>
              </div>
              <div className="match-meta">
                <strong>{match.date}</strong>
                <small>{match.time} · {match.stadium}</small>
                <em className={match.status === "Ao vivo" ? "live" : ""}>{match.status}</em>
              </div>
            </article>
          ))}
        </div>

        <div className="section-head">
          <span>Calendário por grupos</span>
          <h2>Grupos da Copa</h2>
        </div>

        <div className="groups-grid">
          {groups.map((group) => (
            <article className="group-card" key={group.name}>
              <h3>{group.name}</h3>
              {group.teams.map((team) => (
                <button key={team} onClick={() => selectTeam(teams.find((item) => item.name === team) || teams[0])}>
                  {teams.find((item) => item.name === team)?.flag} {team}
                </button>
              ))}
            </article>
          ))}
        </div>

        <div className="team-panel">
          <div className="team-info">
            <span>{selectedTeam.flag}</span>
            <h2>{selectedTeam.name}</h2>
            <p>{selectedTeam.bio}</p>
            <strong>Técnico: {selectedTeam.coach}</strong>
          </div>

          <div className="squad">
            <h3>Escalação / Jogadores</h3>
            {selectedTeam.players.map((player) => (
              <button
                key={player.name}
                className={selectedPlayer.name === player.name ? "active-player" : ""}
                onClick={() => setSelectedPlayer(player)}
              >
                <strong>{player.name}</strong>
                <small>{player.position}</small>
              </button>
            ))}
          </div>

          <div className="player-story">
            <h3>História do jogador</h3>
            <h2>{selectedPlayer.name}</h2>
            <p>{selectedPlayer.story}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
