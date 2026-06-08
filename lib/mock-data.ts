// lib/mock-data.ts
// Fonte única de dados mockados para todos os dashboards.
// Substituir pelas queries Supabase quando as tabelas estiverem prontas.

// ── Técnico ───────────────────────────────────────────────────────────────

export const MOCK_TECNICO = {
  // Cards de resumo — ganhosMes = soma de repassses de março (modulos × R$13)
  ganhosMes: 2301,
  servicosMes: 14,
  avaliacaoMedia: 4.8,
  tempoMedio: 2.3,
  tendencia: { ganhos: 12, servicos: 3 }, // % e qty vs mês anterior

  // Ganhos por semana (visão mensal do GanhosChart) — repasse = modulos × R$13
  ganhosSemanal: [
    { label: "Sem 1", sub: "01–07", valor: 793 },
    { label: "Sem 2", sub: "08–14", valor: 559 },
    { label: "Sem 3", sub: "15–21", valor: 559 },
    { label: "Sem 4", sub: "22–28", valor: 390 },
  ],

  // Ganhos por dia (visão semanal do GanhosChart)
  ganhosDiario: [
    { label: "Seg", sub: "24/03", valor: 312 },
    { label: "Ter", sub: "25/03", valor: 104 },
    { label: "Qua", sub: "26/03", valor: 0 },
    { label: "Qui", sub: "27/03", valor: 455 },
    { label: "Sex", sub: "28/03", valor: 286 },
    { label: "Sáb", sub: "29/03", valor: 0 },
    { label: "Dom", sub: "30/03", valor: 0 },
  ],

  // Últimos 5 serviços (dashboard + ganhos) — recebido = modulos × R$13
  ultimosServicos: [
    { data: "25/03", cidade: "Jaraguá do Sul", modulos: 22, recebido: 286, nota: 5.0 },
    { data: "21/03", cidade: "Pomerode",        modulos: 8,  recebido: 104, nota: 4.5 },
    { data: "18/03", cidade: "Florianópolis",   modulos: 35, recebido: 455, nota: 5.0 },
    { data: "14/03", cidade: "Jaraguá do Sul",  modulos: 15, recebido: 195, nota: 4.8 },
    { data: "10/03", cidade: "Pomerode",        modulos: 28, recebido: 364, nota: 5.0 },
  ],

  // Página de ganhos — resumo financeiro (repasse = modulos × R$13)
  resumoMes: {
    totalBruto: 8730,    // soma dos valores cobrados dos clientes (14 serviços)
    margem: 4700,        // margem da plataforma (totalBruto − totalRepasse)
    totalRepasse: 4030,  // soma dos repassses ao técnico (modulos × R$13)
    servicos: 14,
    avaliacaoMedia: 4.8,
  },

  // Pagamentos detalhados (página /tecnico/ganhos) — repasse = modulos × R$13
  pagamentos: [
    { id: 1,  data: "28/03/2026", endereco: "Residência — Jaraguá do Sul",  modulos: 22, bruto: 660,  repasse: 286 },
    { id: 2,  data: "25/03/2026", endereco: "Comércio — Pomerode",          modulos: 8,  bruto: 280,  repasse: 104 },
    { id: 3,  data: "21/03/2026", endereco: "Residência — Florianópolis",   modulos: 35, bruto: 875,  repasse: 455 },
    { id: 4,  data: "18/03/2026", endereco: "Sítio — Jaraguá do Sul",       modulos: 8,  bruto: 280,  repasse: 104 },
    { id: 5,  data: "14/03/2026", endereco: "Residência — Pomerode",        modulos: 15, bruto: 525,  repasse: 195 },
    { id: 6,  data: "10/03/2026", endereco: "Empresa — Florianópolis",      modulos: 28, bruto: 840,  repasse: 364 },
    { id: 7,  data: "06/03/2026", endereco: "Residência — Jaraguá do Sul",  modulos: 9,  bruto: 315,  repasse: 117 },
    { id: 8,  data: "03/03/2026", endereco: "Usina Solar — Pomerode",       modulos: 52, bruto: 1040, repasse: 676 },
    { id: 9,  data: "28/02/2026", endereco: "Comércio — Florianópolis",     modulos: 22, bruto: 660,  repasse: 286 },
    { id: 10, data: "24/02/2026", endereco: "Residência — Jaraguá do Sul",  modulos: 12, bruto: 420,  repasse: 156 },
    { id: 11, data: "20/02/2026", endereco: "Empresa — Pomerode",           modulos: 30, bruto: 900,  repasse: 390 },
    { id: 12, data: "17/02/2026", endereco: "Residência — Florianópolis",   modulos: 6,  bruto: 210,  repasse: 78  },
    { id: 13, data: "13/02/2026", endereco: "Sítio — Jaraguá do Sul",       modulos: 48, bruto: 1200, repasse: 624 },
    { id: 14, data: "10/02/2026", endereco: "Residência — Pomerode",        modulos: 15, bruto: 525,  repasse: 195 },
  ],

  // Próximos chamados agendados — repasse = modulos × R$13
  proximosChamados: [
    { id: "cham-001", cidade: "Jaraguá do Sul, SC", data: "30/03", hora: "08:00", modulos: 24, valorServico: 720,  repasse: 312 },
    { id: "cham-002", cidade: "Pomerode, SC",       data: "31/03", hora: "08:00", modulos: 48, valorServico: 1200, repasse: 624, urgente: true },
    { id: "cham-003", cidade: "Jaraguá do Sul, SC", data: "01/04", hora: "13:00", modulos: 8,  valorServico: 280,  repasse: 104 },
  ],

  // Desempenho
  performance: [
    { label: "Pontualidade",   pct: 92, meta: 90 },
    { label: "Qualidade",      pct: 96, meta: 90 },
    { label: "Velocidade",     pct: 78, meta: 80 },
    { label: "Volume",         pct: 65, meta: 100 },
    { label: "Taxa de aceite", pct: 85, meta: 80 },
  ],
};

// ── Admin ─────────────────────────────────────────────────────────────────

export const MOCK_ADMIN = {
  // KPIs
  receitaMes: 2658,         // soma das margens dos serviços concluídos (margem = valor − módulos × R$13)
  totalServicos: 38,
  tecnicosAtivos: 9,
  clientesCadastrados: 75,
  clientesNovosMes: 12,
  satisfacaoMedia: 4.7,
  tendencia: { receita: 18, servicos: 6 }, // % e qty vs mês anterior

  // Margem semanal da plataforma — últimas 8 semanas (AdminReceitaChart)
  receitaSemanal: [
    { label: "10/02", valor: 480 },
    { label: "17/02", valor: 630 },
    { label: "24/02", valor: 520 },
    { label: "03/03", valor: 364 },
    { label: "10/03", valor: 806 },
    { label: "17/03", valor: 782 },
    { label: "24/03", valor: 950 },
    { label: "31/03", valor: 374 },
  ],

  // Por cidade — receita = soma das margens (margem = valor − módulos × R$13)
  porCidade: [
    { nome: "Jaraguá do Sul", servicos: 18, receita: 5760, ticket: 320, tecnicos: 4, clientes: 32, destaque: true  },
    { nome: "Florianópolis",  servicos: 12, receita: 4560, ticket: 380, tecnicos: 3, clientes: 28, destaque: false },
    { nome: "Pomerode",       servicos: 8,  receita: 2720, ticket: 340, tecnicos: 2, clientes: 15, destaque: false },
  ],

  // Últimos serviços — valor = preço cliente; margem = valor − (modulos × R$13)
  ultimosServicos: [
    { id: 1,  data: "28/03", cidade: "Jaraguá do Sul", cliente: "João",    tecnico: "Carlos",  modulos: 22, valor: 660,  margem: 374, status: "concluido",   nota: 5.0  },
    { id: 2,  data: "27/03", cidade: "Pomerode",       cliente: "Empresa", tecnico: "Marcos",  modulos: 48, valor: 1200, margem: 576, status: "concluido",   nota: 4.5  },
    { id: 3,  data: "27/03", cidade: "Florianópolis",  cliente: "Maria",   tecnico: "Rafael",  modulos: 8,  valor: 280,  margem: 176, status: "concluido",   nota: 5.0  },
    { id: 4,  data: "26/03", cidade: "Jaraguá do Sul", cliente: "Fazenda", tecnico: "Luiz",    modulos: 52, valor: 1040, margem: 364, status: "andamento",   nota: null },
    { id: 5,  data: "25/03", cidade: "Pomerode",       cliente: "Ana",     tecnico: "Marcos",  modulos: 15, valor: 525,  margem: 330, status: "concluido",   nota: 4.8  },
    { id: 6,  data: "24/03", cidade: "Florianópolis",  cliente: "Roberto", tecnico: "Rafael",  modulos: 35, valor: 875,  margem: 420, status: "concluido",   nota: 5.0  },
    { id: 7,  data: "22/03", cidade: "Jaraguá do Sul", cliente: "Cláudia", tecnico: "Carlos",  modulos: 10, valor: 350,  margem: 220, status: "agendado",    nota: null },
    { id: 8,  data: "21/03", cidade: "Pomerode",       cliente: "Pedro",   tecnico: "Marcos",  modulos: 28, valor: 840,  margem: 476, status: "concluido",   nota: 5.0  },
    { id: 9,  data: "20/03", cidade: "Florianópolis",  cliente: "Usina",   tecnico: "Rafael",  modulos: 80, valor: 0,    margem: 0,   status: "cancelado",   nota: null },
    { id: 10, data: "18/03", cidade: "Jaraguá do Sul", cliente: "Sônia",   tecnico: "Luiz",    modulos: 18, valor: 540,  margem: 306, status: "concluido",   nota: 4.5  },
  ],
};

// ── Usuários ──────────────────────────────────────────────────────────────

export const MOCK_USUARIOS = [
  { id: 1,  nome: 'Ana Silva',        email: 'ana@email.com',       tipo: 'cliente' as const, cidade: 'Jaraguá do Sul', cadastro: '2026-01-15', status: 'ativo' },
  { id: 2,  nome: 'Carlos Souza',     email: 'carlos@email.com',    tipo: 'tecnico' as const, cidade: 'Jaraguá do Sul', cadastro: '2026-01-20', status: 'ativo',    aprovacao: 'aprovado' as const, avaliacao: 4.9, servicos: 22, ganhosMes: 5610 },
  { id: 3,  nome: 'Maria Oliveira',   email: 'maria@email.com',     tipo: 'cliente' as const, cidade: 'Florianópolis',  cadastro: '2026-02-03', status: 'ativo' },
  { id: 4,  nome: 'Pedro Santos',     email: 'pedro@email.com',     tipo: 'tecnico' as const, cidade: 'Pomerode',       cadastro: '2026-02-10', status: 'ativo',    aprovacao: 'aprovado' as const, avaliacao: 4.7, servicos: 15, ganhosMes: 3825 },
  { id: 5,  nome: 'Juliana Costa',    email: 'juliana@email.com',   tipo: 'cliente' as const, cidade: 'Florianópolis',  cadastro: '2026-02-15', status: 'ativo' },
  { id: 6,  nome: 'Roberto Lima',     email: 'roberto@email.com',   tipo: 'tecnico' as const, cidade: 'Florianópolis',  cadastro: '2026-02-28', status: 'ativo',    aprovacao: 'aprovado' as const, avaliacao: 4.5, servicos: 8,  ganhosMes: 2040 },
  { id: 7,  nome: 'Fernanda Alves',   email: 'fernanda@email.com',  tipo: 'cliente' as const, cidade: 'Jaraguá do Sul', cadastro: '2026-03-01', status: 'ativo' },
  { id: 8,  nome: 'Lucas Martins',    email: 'lucas@email.com',     tipo: 'tecnico' as const, cidade: 'Jaraguá do Sul', cadastro: '2026-03-05', status: 'pendente', aprovacao: 'pendente' as const, avaliacao: 0, servicos: 0, ganhosMes: 0 },
  { id: 9,  nome: 'Camila Rocha',     email: 'camila@email.com',    tipo: 'cliente' as const, cidade: 'Pomerode',       cadastro: '2026-03-10', status: 'ativo' },
  { id: 10, nome: 'Diego Ferreira',   email: 'diego@email.com',     tipo: 'tecnico' as const, cidade: 'Pomerode',       cadastro: '2026-03-12', status: 'pendente', aprovacao: 'pendente' as const, avaliacao: 0, servicos: 0, ganhosMes: 0 },
  { id: 11, nome: 'Patricia Mendes',  email: 'patricia@email.com',  tipo: 'cliente' as const, cidade: 'Florianópolis',  cadastro: '2026-03-15', status: 'ativo' },
  { id: 12, nome: 'Thiago Barbosa',   email: 'thiago@email.com',    tipo: 'cliente' as const, cidade: 'Jaraguá do Sul', cadastro: '2026-03-18', status: 'ativo' },
  { id: 13, nome: 'Amanda Reis',      email: 'amanda@email.com',    tipo: 'tecnico' as const, cidade: 'Florianópolis',  cadastro: '2026-03-20', status: 'inativo',  aprovacao: 'recusado' as const, avaliacao: 0, servicos: 0, ganhosMes: 0 },
  { id: 14, nome: 'Bruno Cardoso',    email: 'bruno@email.com',     tipo: 'cliente' as const, cidade: 'Pomerode',       cadastro: '2026-03-22', status: 'ativo' },
  { id: 15, nome: 'Larissa Nunes',    email: 'larissa@email.com',   tipo: 'cliente' as const, cidade: 'Jaraguá do Sul', cadastro: '2026-03-25', status: 'ativo' },
];

// ── Agenda Técnico ────────────────────────────────────────────────────────

export const MOCK_AGENDA_TECNICO = [
  { id: '1',  data: '2026-03-03', horario: '08:00', duracao: 2,   cidade: 'Jaraguá do Sul', endereco: 'Rua das Palmeiras, 120',      modulos: 18, valor: 300, status: 'concluido' as const },
  { id: '2',  data: '2026-03-05', horario: '09:00', duracao: 3,   cidade: 'Pomerode',       endereco: 'Rua XV de Novembro, 450',     modulos: 28, valor: 300, status: 'concluido' as const },
  { id: '3',  data: '2026-03-05', horario: '14:00', duracao: 2,   cidade: 'Pomerode',       endereco: 'Rua Hermann Weege, 80',       modulos: 12, valor: 300, status: 'concluido' as const },
  { id: '4',  data: '2026-03-10', horario: '07:30', duracao: 2,   cidade: 'Jaraguá do Sul', endereco: 'Rua Marechal Deodoro, 300',   modulos: 8,  valor: 180, status: 'concluido' as const },
  { id: '5',  data: '2026-03-14', horario: '09:00', duracao: 3,   cidade: 'Florianópolis',  endereco: 'Rod. SC-401, km 5',           modulos: 35, valor: 520, status: 'concluido' as const },
  { id: '6',  data: '2026-03-14', horario: '14:00', duracao: 2,   cidade: 'Florianópolis',  endereco: 'Rua Lauro Linhares, 700',     modulos: 15, valor: 300, status: 'concluido' as const },
  { id: '7',  data: '2026-03-14', horario: '17:00', duracao: 1.5, cidade: 'Florianópolis',  endereco: 'Rua Bocaiúva, 200',           modulos: 6,  valor: 180, status: 'concluido' as const },
  { id: '8',  data: '2026-03-21', horario: '08:00', duracao: 2.5, cidade: 'Jaraguá do Sul', endereco: 'Rua Otto Marquardt, 55',      modulos: 22, valor: 300, status: 'concluido' as const },
  { id: '9',  data: '2026-03-25', horario: '09:00', duracao: 2,   cidade: 'Pomerode',       endereco: 'Rua Georg Osterroht, 180',    modulos: 14, valor: 300, status: 'concluido' as const },
  { id: '10', data: '2026-03-28', horario: '08:30', duracao: 3,   cidade: 'Jaraguá do Sul', endereco: 'Rua Walter Marquardt, 90',    modulos: 30, valor: 300, status: 'agendado'  as const },
  { id: '11', data: '2026-03-29', horario: '09:00', duracao: 4,   cidade: 'Florianópolis',  endereco: 'Av. Beira Mar Norte, 1500',   modulos: 55, valor: 520, status: 'agendado'  as const },
  { id: '12', data: '2026-03-31', horario: '08:00', duracao: 2,   cidade: 'Pomerode',       endereco: 'Rua Joinville, 300',          modulos: 10, valor: 180, status: 'agendado'  as const },
  { id: '13', data: '2026-03-31', horario: '13:00', duracao: 2.5, cidade: 'Jaraguá do Sul', endereco: 'Rua Expedicionário, 400',     modulos: 20, valor: 300, status: 'agendado'  as const },
  { id: '14', data: '2026-04-02', horario: '09:00', duracao: 2,   cidade: 'Jaraguá do Sul', endereco: 'Rua Bernardo Dornbusch, 150', modulos: 16, valor: 300, status: 'agendado'  as const },
  { id: '15', data: '2026-04-05', horario: '08:00', duracao: 3,   cidade: 'Florianópolis',  endereco: 'Rod. Admar Gonzaga, 800',     modulos: 40, valor: 520, status: 'agendado'  as const },
];
