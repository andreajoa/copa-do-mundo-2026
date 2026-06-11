import { NextResponse } from "next/server";

const enrichment = {
  featuredMatchReports: [
    {
      matchId: 537327,
      title: "México 2 x 0 África do Sul",
      summary:
        "O México abriu a Copa do Mundo 2026 com vitória por 2 a 0 no Estádio Azteca. Julián Quiñones marcou no primeiro tempo, aos 9 minutos. Raúl Jiménez ampliou no segundo tempo, por volta dos 66/67 minutos. A África do Sul terminou com nove jogadores após expulsões de Sphephelo Sithole e Themba Zwane. César Montes também foi expulso nos acréscimos.",
      goals: [
        {
          minute: "9'",
          half: "1º tempo",
          team: "Mexico",
          player: "Julián Quiñones",
          description:
            "Abriu o placar para o México e marcou o primeiro gol da Copa de 2026.",
        },
        {
          minute: "66'/67'",
          half: "2º tempo",
          team: "Mexico",
          player: "Raúl Jiménez",
          description:
            "Ampliou de cabeça no segundo tempo e chegou a uma marca histórica pela seleção mexicana.",
        },
      ],
      cards: [
        "Sphephelo Sithole foi expulso no início do segundo tempo.",
        "Themba Zwane foi expulso aos 84 minutos.",
        "César Montes foi expulso nos acréscimos.",
      ],
    },
  ],
  teams: {
    Mexico: {
      name: "México",
      coach: "Javier Aguirre",
      profile:
        "O México é uma das sedes da Copa do Mundo de 2026 e começou o torneio pressionado pela torcida local. A seleção tem tradição em Copas, costuma ser forte em casa e joga com intensidade, velocidade pelos lados e muita energia no meio-campo.",
      players: [
        {
          name: "Julián Quiñones",
          position: "Atacante",
          club: "Al-Qadsiah",
          story:
            "Atacante colombiano naturalizado mexicano. Chegou à Copa como uma das opções ofensivas mais fortes do México e marcou o primeiro gol do torneio de 2026.",
        },
        {
          name: "Raúl Jiménez",
          position: "Atacante",
          club: "Fulham",
          story:
            "Centroavante experiente, referência técnica e emocional do México. O gol contra a África do Sul reforçou sua importância histórica na seleção mexicana.",
        },
        {
          name: "César Montes",
          position: "Zagueiro",
          club: "Lokomotiv Moscow",
          story:
            "Zagueiro forte no jogo aéreo e presença constante na defesa mexicana. Foi expulso nos acréscimos da estreia.",
        },
      ],
    },
    "South Africa": {
      name: "África do Sul",
      coach: "Hugo Broos",
      profile:
        "A África do Sul voltou ao palco da Copa buscando competitividade e organização defensiva. Na estreia, a equipe sofreu com expulsões e teve dificuldade para reagir contra o México.",
      players: [
        {
          name: "Sphephelo Sithole",
          position: "Meio-campista",
          club: "Gil Vicente",
          story:
            "Meio-campista de marcação. Foi expulso no início do segundo tempo contra o México, em lance que mudou o ritmo da partida.",
        },
        {
          name: "Themba Zwane",
          position: "Meia",
          club: "Mamelodi Sundowns",
          story:
            "Meia experiente e criativo da África do Sul. Foi expulso aos 84 minutos na estreia contra o México.",
        },
      ],
    },
  },
};

export async function GET() {
  return NextResponse.json(enrichment);
}
