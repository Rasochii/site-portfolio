// Conteúdo curado do portfólio. Para adicionar ou editar um projeto, mexa só aqui.
// Estrelas e data de atualização vêm da API do GitHub (ver main.js).

const GITHUB_USER = 'Rasochii';

// Repos que nunca aparecem no site, mesmo se a API devolver.
const HIDDEN_REPOS = ['site-portfolio', 'rasochii'];

// Projetos Flutter em destaque, na ordem em que aparecem.
// visual.type: 'cover' (capa gerada em CSS), 'image' (banner) ou 'phones' (screenshots).
const FEATURED_PROJECTS = [
  {
    repo: 'proximo',
    title: 'Próximo!',
    tagline: 'Fila virtual para barbearias',
    status: 'Em desenvolvimento',
    description:
      'O cliente entra na fila pelo QR Code da porta, só com o nome, e espera onde quiser. ' +
      'O barbeiro aperta "Próximo!" e o celular de quem foi chamado atualiza na hora.',
    highlights: [
      'Fila consistente sob concorrência: cada mutação é uma Cloud Function em uma única transação.',
      'Tempo de espera calculado por simulação de eventos, com a mediana das durações reais de cada serviço.',
      'Security Rules deny-by-default, App Check, rate limit e idempotência por requisição.',
      'Regras da fila em TypeScript puro, cobertas por testes e CI.',
    ],
    stack: ['Flutter', 'Riverpod 3', 'go_router', 'Firebase', 'Cloud Functions', 'TypeScript'],
    visual: { type: 'cover', emoji: '✂️', label: 'Próximo!', theme: 'amber' },
  },
  {
    repo: 'pulse',
    title: 'Pulse',
    tagline: 'Hábitos com foco no hoje',
    description:
      'App de hábitos com pouca fricção: clareza no que importa hoje e registro rápido do progresso. ' +
      'Funciona offline-first com SQLite local; login e nuvem são opcionais.',
    highlights: [
      'Offline-first com Drift/SQLite e sincronização opcional com Supabase.',
      'Metas numéricas, dias ativos e vários lembretes por dia com notificações locais.',
      'Check-in de humor e energia, com histórico e gráficos de tendência.',
      'Gamificação com XP, níveis e conquistas.',
    ],
    stack: ['Flutter', 'Riverpod', 'Drift', 'Supabase', 'go_router', 'fl_chart'],
    visual: { type: 'image', src: 'assets/img/pulse-banner.svg', alt: 'Banner do app Pulse' },
  },
  {
    repo: 'play-music',
    title: 'Play Music',
    tagline: 'Player de música local',
    description:
      'Player simples e funcional para as músicas do aparelho: você escolhe a pasta, o app lista ' +
      'as faixas e toca com controles de reprodução e uma tela de detalhes da música.',
    highlights: [
      'Reproduzir, pausar, avançar e voltar entre as faixas da lista.',
      'Slider de tempo com posição atual e duração total.',
      'Bottom sheet com capa, artista e tempo de execução.',
    ],
    stack: ['Flutter', 'just_audio', 'file_picker', 'Rive'],
    visual: {
      type: 'phones',
      images: [
        { src: 'assets/img/play-music-2.jpg', alt: 'Play Music: lista de músicas' },
        { src: 'assets/img/play-music-3.jpg', alt: 'Play Music: reprodução de uma faixa' },
      ],
    },
  },
];

// Projetos fora do Flutter que valem aparecer.
const OTHER_PROJECTS = [
  {
    repo: 'pokewiki',
    title: 'PokéWiki',
    tagline: 'React Native · Expo',
    description:
      'Pokédex com cadastro, busca dos 151 Pokémon de Kanto, favoritos e montagem de time com até 6 Pokémon. ' +
      'Projeto acadêmico com dados da PokéAPI e persistência no Supabase.',
    stack: ['React Native', 'Expo', 'Supabase', 'PokéAPI'],
  },
];
