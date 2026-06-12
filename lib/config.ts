// ── Feature Flags ─────────────────────────────────────────────────────────────

export const SUBSCRIPTION_ENABLED  = true;   // modelo assinatura ativo (v2)
export const AVULSO_ENABLED        = true;   // serviço avulso mantido como secundário
export const INVERTER_API_ENABLED  = false;  // integração API inversores — pós-MVP
export const FIRST_SERVICE_DISCOUNT = 0.50;  // taxa de adesão = 50% do avulso (inclui a 1ª limpeza)

// ── Programa de indicações ────────────────────────────────────────────────────
export const REFERRAL_DISCOUNT_PER    = 0.06;  // 6% de desconto por indicação ativa
export const REFERRAL_MAX_DISCOUNT    = 0.30;  // teto: 30% (5 indicações)
export const REFERRAL_VALIDITY_MONTHS = 12;    // crédito vale 12 meses a partir da indicação

// ── Contrato ──────────────────────────────────────────────────────────────────
export const CONTRACT_MONTHS = 12;             // carência mínima; cancelar antes paga saldo devedor
export const INVOICE_DUE_DAYS = 5;             // prazo de vencimento das faturas (PIX manual)

/**
 * MVP_PRICING_ACTIVE
 * Quando true, aplica desconto de 15% no preço exibido ao cliente
 * (reduzindo barreira de entrada no lançamento).
 */
export const MVP_PRICING_ACTIVE = true;
