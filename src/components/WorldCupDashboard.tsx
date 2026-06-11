"use client";

const sections = [
  {
    title: "Seleção Brasileira",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=900&auto=format&fit=crop",
    text: "A Seleção Brasileira é a mais vitoriosa da história da Copa do Mundo, com 5 títulos: 1958, 1962, 1970, 1994 e 2002. Conhecida pelo futebol arte, revelou craques como Pelé, Ronaldo, Ronaldinho e Neymar.",
  },
  {
    title: "Estádios Históricos",
    image: "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?q=80&w=900&auto=format&fit=crop",
    text: "A Copa de 2026 será disputada em grandes arenas dos Estados Unidos, Canadá e México. Será uma edição histórica, com estrutura moderna, grandes públicos e jogos espalhados por 16 cidades-sede.",
  },
  {
    title: "48 Seleções",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=900&auto=format&fit=crop",
    text: "Pela primeira vez na história, a Copa do Mundo contará com 48 seleções. O novo formato aumenta a competitividade, abre espaço para novas histórias e torna o torneio ainda maior.",
  },
  {
    title: "A Emoção da Copa",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=900&auto=format&fit=crop",
    text: "Mais do que futebol, a Copa do Mundo reúne culturas, torcidas, rivalidades e momentos inesquecíveis. É o evento esportivo mais aguardado do planeta.",
  },
];

export default function WorldCupDashboard() {
  return (
    <main className="world-page">
      <section className="hero">
        <div className="heroLights" />
        <div className="trophyWrap">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/FIFA_World_Cup_Trophy.svg/1200px-FIFA_World_Cup_Trophy.svg.png"
            alt="Taça da Copa do Mundo"
            className="trophy"
          />
        </div>

        <div className="heroTitle">
          <h1>FIFA WORLD CUP</h1>
          <p>Começa em 11/06/2026</p>
        </div>
      </section>

      <section className="content">
        {sections.map((item, index) => (
          <article
            key={item.title}
            className={`infoBlock ${index % 2 === 1 ? "reverse" : ""}`}
          >
            <div className="infoText">
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>

            <div className="imageCard">
              <img src={item.image} alt={item.title} />
            </div>
          </article>
        ))}

        <section className="host">
          <h2>Sede da Copa</h2>
          <p>
            A próxima Copa do Mundo será sediada pelos Estados Unidos, Canadá e México
            em conjunto. A competição acontecerá em 2026 e será disputada em 16 cidades
            destes três países. Serão 48 seleções participantes, tornando esta a maior
            Copa do Mundo da história.
          </p>
        </section>
      </section>
    </main>
  );
}
