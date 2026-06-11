"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Calendar,
  MapPin,
  Search,
  X,
  TrendingUp,
  Users,
  Globe,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  group: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export default function WorldCupDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) => {
    const homeName = match.homeTeam?.name || "";
    const awayName = match.awayTeam?.name || "";
    
    const matchesSearch =
      homeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awayName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "live" && match.status === "IN_PLAY") ||
      (filterStatus === "scheduled" && match.status === "SCHEDULED") ||
      (filterStatus === "finished" && match.status === "FINISHED");

    return matchesSearch && matchesStatus;
  });

  const liveMatches = matches.filter((m) => m.status === "IN_PLAY");
  const upcomingMatches = matches.filter((m) => m.status === "SCHEDULED");
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");

  const groupMatches = matches.filter((m) => m.group);
  const groupStats = groupMatches.reduce((acc, match) => {
    const group = match.group || "Outros";
    if (!acc[group]) acc[group] = 0;
    acc[group]++;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupStats).map(([name, value]) => ({
    name,
    jogos: value,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Carregando Copa do Mundo 2026...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar Fixa */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-purple-500/30 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
              Copa do Mundo 2026
            </h1>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <Globe className="w-5 h-5" />
            <span className="text-sm">USA • MEX • CAN</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30 shadow-2xl">
            <h2 className="text-5xl font-bold text-white mb-4">
              🏆 FIFA World Cup 2026
            </h2>
            <p className="text-xl text-white/80 mb-6">
              Acompanhe todos os jogos, grupos e estatísticas em tempo real
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-white/60 text-sm">Total de Jogos</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {matches.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-white/60 text-sm">Ao Vivo</span>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {liveMatches.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-white/60 text-sm">Agendados</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {upcomingMatches.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/60 text-sm">Finalizados</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400">
                  {finishedMatches.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Filtros e Busca */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar seleção..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {["all", "live", "scheduled", "finished"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      filterStatus === status
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {status === "all" && "Todos"}
                    {status === "live" && "🔴 Ao Vivo"}
                    {status === "scheduled" && "Agendados"}
                    {status === "finished" && "Finalizados"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de Jogos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer group"
              >
                {match.group && (
                  <div className="mb-4">
                    <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">
                      Grupo {match.group}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center">
                    <img
                      src={match.homeTeam.crest}
                      alt={match.homeTeam.name}
                      className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform"
                    />
                    <div className="text-white font-medium text-sm">
                      {match.homeTeam.shortName}
                    </div>
                  </div>

                  <div className="text-center px-4">
                    {match.status === "SCHEDULED" ? (
                      <div className="text-white/60 text-sm">
                        {new Date(match.utcDate).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                        <br />
                        {new Date(match.utcDate).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-white">
                        {match.score.fullTime.home ?? "-"}
                        <span className="text-white/40 mx-2">x</span>
                        {match.score.fullTime.away ?? "-"}
                      </div>
                    )}
                    {match.status === "IN_PLAY" && (
                      <div className="text-xs text-red-400 font-bold mt-1 animate-pulse">
                        🔴 AO VIVO
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center">
                    <img
                      src={match.awayTeam.crest}
                      alt={match.awayTeam.name}
                      className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform"
                    />
                    <div className="text-white font-medium text-sm">
                      {match.awayTeam.shortName}
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-white/40">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Rodada {match.matchday}
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de Grupos */}
          {chartData.length > 0 && (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">
                Jogos por Grupo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1b4b",
                      border: "1px solid #a855f7",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="jogos" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Modal do Jogo */}
      {selectedMatch && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-8 max-w-2xl w-full border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                {selectedMatch.group && (
                  <span className="text-sm font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">
                    Grupo {selectedMatch.group}
                  </span>
                )}
                <h3 className="text-3xl font-bold text-white mt-2">
                  Detalhes do Jogo
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <img
                  src={selectedMatch.homeTeam.crest}
                  alt={selectedMatch.homeTeam.name}
                  className="w-24 h-24 mx-auto mb-3"
                />
                <div className="text-white font-bold text-lg">
                  {selectedMatch.homeTeam.name}
                </div>
              </div>

              <div className="text-center px-8">
                {selectedMatch.status === "SCHEDULED" ? (
                  <div className="text-white text-xl">
                    {new Date(selectedMatch.utcDate).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                    <br />
                    <span className="text-3xl font-bold">
                      {new Date(selectedMatch.utcDate).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="text-5xl font-bold text-white">
                    {selectedMatch.score.fullTime.home ?? "-"}
                    <span className="text-white/40 mx-4">x</span>
                    {selectedMatch.score.fullTime.away ?? "-"}
                  </div>
                )}
                {selectedMatch.status === "IN_PLAY" && (
                  <div className="text-red-400 font-bold mt-2 animate-pulse">
                    🔴 AO VIVO
                  </div>
                )}
              </div>

              <div className="text-center flex-1">
                <img
                  src={selectedMatch.awayTeam.crest}
                  alt={selectedMatch.awayTeam.name}
                  className="w-24 h-24 mx-auto mb-3"
                />
                <div className="text-white font-bold text-lg">
                  {selectedMatch.awayTeam.name}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-white/80">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Status</div>
                <div className="font-bold">{selectedMatch.status}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Rodada</div>
                <div className="font-bold">{selectedMatch.matchday}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
