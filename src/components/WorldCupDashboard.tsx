"use client";

import { useEffect, useState } from "react";
import { Trophy, Globe, MapPin } from "lucide-react";

export default function WorldCupDashboard() {
  const [daysUntilCup, setDaysUntilCup] = useState(0);

  useEffect(() => {
    const cupDate = new Date("2026-06-11").getTime();
    const now = new Date().getTime();
    const distance = cupDate - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    setDaysUntilCup(days > 0 ? days : 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-teal-900">
      {/* Hero Section com Taça */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Background com efeito */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/30 via-purple-600/30 to-teal-600/30 blur-3xl" />
        
        {/* Taça Dourada */}
        <div className="relative z-10 mb-12">
          <div className="w-64 h-64 md:w-96 md:h-96 mx-auto relative">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/FIFA_World_Cup_Trophy.svg/1200px-FIFA_World_Cup_Trophy.svg.png"
              alt="FIFA World Cup Trophy"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{
                filter: "drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))"
              }}
            />
          </div>
        </div>

        {/* Título Principal */}
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            FIFA WORLD CUP
          </h1>
          <p className="text-2xl md:text-3xl text-white/90">
            {daysUntilCup > 0 
              ? `Começa em ${daysUntilCup} dias`
              : "Começa em 11/06/2026 - Evento expirado"}
          </p>
        </div>

        {/* Conteúdo Principal */}
        <div className="relative z-10 max-w-6xl mx-auto mt-16 space-y-24 pb-24">
          {/* Seção Seleção Brasileira 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold mb-4 text-purple-300">
                Seleção Brasileira
              </h2>
              <p className="text-white/80 leading-relaxed">
                A Seleção Brasileira é a mais vitoriosa da história da Copa do Mundo, 
                com 5 títulos (1958, 1962, 1970, 1994 e 2002). Conhecida pelo seu futebol 
                arte, revelou craques como Pelé, Ronaldo e Neymar. É a única seleção 
                que participou de todas as Copas do Mundo.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-72 h-48 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <span className="text-white/40 text-2xl">300 × 200</span>
              </div>
            </div>
          </div>

          {/* Seção Seleção Brasileira 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold mb-4 text-purple-300">
                Seleção Brasileira
              </h2>
              <p className="text-white/80 leading-relaxed">
                A Seleção Brasileira é a mais vitoriosa da história da Copa do Mundo, 
                com 5 títulos (1958, 1962, 1970, 1994 e 2002). Conhecida pelo seu futebol 
                arte, revelou craques como Pelé, Ronaldo e Neymar. É a única seleção 
                que participou de todas as Copas do Mundo.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-72 h-48 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <span className="text-white/40 text-2xl">300 × 200</span>
              </div>
            </div>
          </div>

          {/* Seção Seleção Brasileira 3 */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold mb-4 text-purple-300">
                Seleção Brasileira
              </h2>
              <p className="text-white/80 leading-relaxed">
                A Seleção Brasileira é a mais vitoriosa da história da Copa do Mundo, 
                com 5 títulos (1958, 1962, 1970, 1994 e 2002). Conhecida pelo seu futebol 
                arte, revelou craques como Pelé, Ronaldo e Neymar. É a única seleção 
                que participou de todas as Copas do Mundo.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-72 h-48 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <span className="text-white/40 text-2xl">300 × 200</span>
              </div>
            </div>
          </div>

          {/* Seção Seleção Brasileira 4 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold mb-4 text-purple-300">
                Seleção Brasileira
              </h2>
              <p className="text-white/80 leading-relaxed">
                A Seleção Brasileira é a mais vitoriosa da história da Copa do Mundo, 
                com 5 títulos (1958, 1962, 1970, 1994 e 2002). Conhecida pelo seu futebol 
                arte, revelou craques como Pelé, Ronaldo e Neymar. É a única seleção 
                que participou de todas as Copas do Mundo.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-72 h-48 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <span className="text-white/40 text-2xl">300 × 200</span>
              </div>
            </div>
          </div>

          {/* Seção Sede da Copa */}
          <div className="text-center text-white mt-24">
            <h2 className="text-3xl font-bold mb-6 text-teal-300">
              Sede da Copa
            </h2>
            <p className="text-white/80 leading-relaxed max-w-4xl mx-auto">
              A próxima Copa do Mundo será sediada pelos Estados Unidos, Canadá e México 
              em conjunto. A competição acontecerá em 2026 e será disputada em 16 cidades 
              destes três países. Serão 48 seleções participantes, o que torna a Copa 
              do Mundo de 2026 a primeira da história com esse número de seleções.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
