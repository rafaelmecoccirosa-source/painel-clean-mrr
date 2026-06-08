import { MVP_PRICING_ACTIVE } from "@/lib/config";

// === FAIXAS DE PREÇO POR PLACA — v2 (tabela oficial Painel Clean) ===

export function getValorPorPlaca(placas: number): number {
  if (placas <= 15)  return 35.00; // R$ 35,00/módulo
  if (placas <= 30)  return 30.00; // R$ 30,00/módulo
  if (placas <= 50)  return 25.00; // R$ 25,00/módulo
  if (placas <= 100) return 20.00; // R$ 20,00/módulo
  return 0; // 100+ módulos: sob consulta
}

export function getFaixaLabel(placas: number): string {
  if (placas <= 30)  return "Até 30 módulos (R$ 30,00/módulo)";
  if (placas <= 50)  return "31–50 módulos (R$ 25,00/módulo)";
  if (placas <= 100) return "51–100 módulos (R$ 20,00/módulo)";
  return "100+ módulos (sob consulta)";
}

// === FUNÇÕES v2 — ASSINATURA ===

/** Preço avulso base (sem multiplicadores) */
export function calcularPrecoAvulso(modules: number): number {
  const valorPorPlaca = getValorPorPlaca(modules);
  if (valorPorPlaca === 0) throw new Error("sob_consulta");
  return modules * valorPorPlaca;
}

/** 1ª limpeza: 50% do preço avulso */
export function calcularEntrada(modules: number): number {
  return calcularPrecoAvulso(modules) * 0.50;
}

/** Limpeza extra para assinante: 40% de desconto (60% do avulso) */
export function calcularLimpezaExtra(modules: number): number {
  return calcularPrecoAvulso(modules) * 0.60;
}

/** Sugere plano com base no nº de módulos */
export function sugerirPlano(modules: number): 'basic' | 'standard' | 'plus' | 'pro' | 'business' {
  if (modules <= 15)  return 'basic';
  if (modules <= 30)  return 'standard';
  if (modules <= 60)  return 'plus';
  if (modules <= 200) return 'pro';
  return 'business';
}

// === CONSTANTES DE PRECIFICAÇÃO ===
export const PRECO_POR_PLACA       = 15;    // mantido para compatibilidade, não usado no algoritmo principal
export const PRECO_MINIMO          = 300;   // mínimo R$ 300 por visita (mercado SC)
export const CUSTO_KM              = 2;     // R$ por km de deslocamento
export const BOOST_MVP             = 1.15;  // 15% boost para atrair técnicos no MVP
export const PAGAMENTO_POR_PAINEL  = 13;    // R$ por painel (módulo) pago ao técnico (avulso fixo)
export const DESCONTO_MVP_CLIENTE  = 0.85;  // 15% desconto pro cliente no MVP (SUBSCRIPTION_ENABLED=false)
export const BOOST_MVP_TECNICO     = 1.15;  // mesma taxa que BOOST_MVP — documentado para clareza

// === TIPOS ===
export type TipoInstalacao = "solo" | "telhado_padrao" | "telhado_dificil";
export type NivelSujeira   = "normal" | "pesada";
export type NivelAcesso    = "normal" | "dificil";

export interface DadosServico {
  placas: number;
  tipoInstalacao: TipoInstalacao;
  sujeira: NivelSujeira;
  acesso: NivelAcesso;
  distanciaKm: number;
}

export interface ResultadoPrecificacao {
  precoBase: number;
  multTipo: number;
  multExtra: number;
  custoDeslocamento: number;
  precoEstimado: number;    // preço interno cheio (com BOOST_MVP)
  precoCliente: number;     // preço que o cliente paga (com desconto MVP se ativo)
  precoMin: number;         // -10% do precoCliente
  precoMax: number;         // +20% do precoCliente
  repasseTecnico: number;   // R$ 13 × placas (pagamento avulso ao técnico)
  margemPlataforma: number; // precoCliente − repasseTecnico
  valorPorPlaca: number;
  boostAplicado: boolean;
  descontoMvpAtivo: boolean;
  sobConsulta?: boolean;
  detalhe: {
    baseCalculo: string;
    tipoLabel: string;
    extras: string[];
  };
}

// === MULTIPLICADORES ===
export function getMultiplicadorTipo(tipo: TipoInstalacao): number {
  switch (tipo) {
    case "solo":            return 1.0;
    case "telhado_padrao":  return 1.25;
    case "telhado_dificil": return 1.5;
  }
}

export function getLabelTipo(tipo: TipoInstalacao): string {
  switch (tipo) {
    case "solo":            return "Solo (acesso fácil)";
    case "telhado_padrao":  return "Telhado padrão";
    case "telhado_dificil": return "Telhado difícil / alto";
  }
}

// === ALGORITMO PRINCIPAL ===
export function calcularPreco(dados: DadosServico): ResultadoPrecificacao {
  const valorPorPlaca = getValorPorPlaca(dados.placas);

  // Acima de 200 placas → sob consulta
  if (valorPorPlaca === 0) {
    return {
      precoBase: 0,
      multTipo: 0,
      multExtra: 0,
      custoDeslocamento: 0,
      precoEstimado: 0,
      precoCliente: 0,
      precoMin: 0,
      precoMax: 0,
      repasseTecnico: 0,
      margemPlataforma: 0,
      valorPorPlaca: 0,
      boostAplicado: false,
      descontoMvpAtivo: false,
      sobConsulta: true,
      detalhe: {
        baseCalculo: "Acima de 200 placas — sob consulta",
        tipoLabel: getLabelTipo(dados.tipoInstalacao),
        extras: [],
      },
    };
  }

  // 1. Preço base (escala de mercado, mínimo R$ 300)
  const precoBase = Math.max(PRECO_MINIMO, dados.placas * valorPorPlaca);

  // 2. Multiplicador de tipo de instalação
  const multTipo = getMultiplicadorTipo(dados.tipoInstalacao);

  // 3. Multiplicador de extras (aditivo)
  let multExtra = 1.0;
  const extras: string[] = [];
  if (dados.sujeira === "pesada") {
    multExtra += 0.2;
    extras.push("Sujeira pesada (+20%)");
  }
  if (dados.acesso === "dificil") {
    multExtra += 0.2;
    extras.push("Acesso difícil (+20%)");
  }

  // 4. Custo de deslocamento
  const custoDeslocamento = dados.distanciaKm * CUSTO_KM;

  // 5. Preço estimado (interno / cheio)
  let precoEstimado = precoBase * multTipo * multExtra + custoDeslocamento;

  // 6. Boost MVP (garantir aceitação dos técnicos)
  precoEstimado *= BOOST_MVP;

  // 7. Arredondar preço interno
  precoEstimado = Math.round(precoEstimado);

  // 8. Preço para o cliente (com desconto MVP se ativo)
  const descontoMvpAtivo = MVP_PRICING_ACTIVE;
  const precoCliente = descontoMvpAtivo
    ? Math.round(precoEstimado * DESCONTO_MVP_CLIENTE)
    : precoEstimado;

  // 9. Repasse ao técnico: pagamento avulso fixo por painel
  const repasseTecnico = dados.placas * PAGAMENTO_POR_PAINEL;

  // 10. Margem da plataforma = o que o cliente paga menos o repasse
  const margemPlataforma = precoCliente - repasseTecnico;

  // 11. Faixa exibida baseada no precoCliente (±10% min, +20% max)
  const precoMin = Math.round(precoCliente * 0.9);
  const precoMax = Math.round(precoCliente * 1.2);

  return {
    precoBase,
    multTipo,
    multExtra,
    custoDeslocamento,
    precoEstimado,
    precoCliente,
    precoMin,
    precoMax,
    repasseTecnico,
    margemPlataforma,
    valorPorPlaca: Math.round(precoCliente / dados.placas),
    boostAplicado: true,
    descontoMvpAtivo,
    sobConsulta: false,
    detalhe: {
      baseCalculo: `${dados.placas} placas × R$ ${valorPorPlaca.toFixed(2)} = R$ ${(dados.placas * valorPorPlaca).toFixed(0)} (mín R$ ${PRECO_MINIMO})`,
      tipoLabel: getLabelTipo(dados.tipoInstalacao),
      extras,
    },
  };
}
