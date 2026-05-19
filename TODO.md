# Painel Clean Plataforma v2 — TODO & Histórico de Decisões

> Arquivo vivo. Atualizar a cada sessão.
> Versão: v2 — modelo assinatura (Netflix)
> Última atualização: 2026-05-15

---

## PENDENTES — Bugs e ajustes

- [ ] Reagendar — confirmar se salva no banco (next_service_at atualiza com data nova)
- [ ] Landing /v2 — contadores animados mostrando 0 (ajustar valores iniciais hardcoded)
- [ ] Landing /v2 — "Placas sujas perdem até 0%" — bug na calculadora
- [ ] Cancelamento — botão existe mas fluxo incompleto (modal criado, falta testar)
- [ ] Notificação pro admin quando chega pedido novo — tarefa pendente
- [ ] Mapa admin — erro supabaseUrl no build (SUPABASE_SERVICE_ROLE_KEY vazio)
- [ ] Limpeza extra para assinantes — preços avulso desatualizados no CLAUDE.md (até 15mod=R$35, não R$30)

---

## PENDENTES — Fluxo e funcionalidades

### Fluxo end-to-end (testar completo)
- [ ] Técnico aceitar chamado → confirmar status muda no banco
- [ ] Admin liberar repasse → testar fluxo completo
- [ ] Notificação pro admin quando novo pedido chega (email ou WhatsApp automático)
- [ ] Notificação pro cliente quando técnico aceita chamado

### Dashboard cliente
- [ ] Indicações — link de indicação funcional (rastrear conversão real)
- [ ] Relatórios — PDF real (MVP: admin gera manualmente)
- [ ] Verificar responsivo nas páginas internas (relatórios, histórico, indicações)

### Dashboard técnico e admin
- [ ] Briefing Claude Design — layout visual para técnico e admin
- [ ] Conclusão de serviço — upload de fotos real (hoje aceita só URL)
- [ ] Aprovação de técnicos — checklist antes de aprovar
- [ ] Relatório mensal — interface para admin preencher manualmente (MVP)

### Login e cadastro
- [ ] Visual do login — alinhar com tokens da landing v2
- [ ] Cadastro — testar fluxo completo com usuário real novo (cliente e técnico)
- [ ] Verificar se "completar-cadastro" ainda aparece indevidamente

### Landing
- [ ] Corrigir contadores zerados e bug da calculadora
- [ ] Promover /v2 → / após aprovação final

---

## PENDENTES — App mobile (Beiço)

- [ ] Definir escopo do MVP mobile — quais telas do cliente entram primeiro
- [ ] Compartilhar CLAUDE.md + schema do banco com o Beiço
- [ ] Definir stack do app (React Native / Swift / Flutter)
- [ ] Garantir que API Supabase funciona via anon key do app
- [ ] Endpoints que o app vai consumir — mapear rotas existentes
- [ ] Autenticação mobile — Google OAuth + email/senha via Supabase Auth
- [ ] Push notifications — definir provider (OneSignal, Expo, APNs)
- [x] Sincronizar decisões de design entre web e mobile (DESIGN_TOKENS.md adicionado ao repo)

---

## PENDENTES — Pré-lançamento

- [ ] Configurar domínio customizado no Vercel
- [ ] Auditoria de acessibilidade
- [ ] Pagamento — MVP: PIX manual por email | Pós-MVP: Mercado Pago
- [ ] SUPABASE_SERVICE_ROLE_KEY no .env.local (build warnings)

---

## PENDENTES — Pós-MVP

- [ ] Integração Mercado Pago (PIX + cartão + débito recorrente)
- [ ] Integração API inversores (Fronius, SolarEdge, Growatt, Sungrow, Hoymiles, Deye)
- [ ] Geração automática de PDF de relatório com fotos antes/depois
- [x] Renomear repo ativo para painel-clean-mrr (feito — painel-clean-mrr.vercel.app)

---

## CONCLUÍDO — Sessões de maio 2026

### Responsivo mobile dashboard cliente
- [x] Hero mobile — donut 130px, texto centralizado, raio SVG oculto no mobile
- [x] Header — hamburger menu + drawer com auto-close ao trocar de rota
- [x] Stat cards — empilhados no mobile
- [x] Páginas internas — títulos 22px, gráficos 200px, grids em coluna
- [x] Botão outline iOS — fix WebkitAppearance para transparência correta

### Bugs corrigidos
- [x] Hero state da Fernanda — corrigido para "healthy" (lógica de drop só usa mês atual)
- [x] "0 dias" na próxima limpeza — corrigido (serviços avulsos não entram no card)
- [x] Cidade "—, SC" no perfil — corrigido com fallback
- [x] Redirect por role — técnico e admin agora vão para as rotas certas
- [x] RLS policy admin_read_all_profiles — corrigida (usa auth.jwt() sem subquery)
- [x] "Completar cadastro" indevido — guard adicionado no mount
- [x] Perfil salva — PATCH /api/cliente/perfil com optimistic update
- [x] Modal de edição de perfil — funcional com loading e erro visível

### Funcionalidades
- [x] Reagendar persiste no banco — PATCH /api/cliente/reagendar
- [x] Contador limpezas corrigido — basic/standard=2, plus=4, ciclo anual
- [x] Email e telefone do cliente no admin de serviços + botões WhatsApp/email
- [x] Limites de caracteres com contador em textareas
- [x] Avulsa — módulos fixos da assinatura (não selecionável)
- [x] Avulsa — cidade read-only com link para perfil
- [x] Avulsa — insert via /api/cliente/avulsa (bypass RLS)
- [x] Notificação pro admin — inserida quando cliente cria pedido avulso
- [x] Notificação pro cliente — inserida quando técnico aceita chamado

### Infraestrutura
- [x] Next.js 14.2.18 → 14.2.35 (security patch)
- [x] Keep-alive workflow removido (desnecessário, causava emails de erro)
- [x] CRON_SECRET configurado no Vercel
- [x] Cron auto-scheduling funcionando

---

## CONCLUÍDO — Sessão 2026-04-30

- [x] Avulsa cria service_request real no banco
- [x] Técnico vê chamados disponíveis por cidade
- [x] Detalhe do chamado via /api/tecnico/chamado/[id]
- [x] Dashboards técnico e admin implementados com dados reais
- [x] Notificações — tabela + RLS + badge + marcar como lidas
- [x] Terminologia corrigida (módulos, usina, limpeza)
- [x] RLS policies referrals aplicadas no banco

---

## CONCLUÍDO — Sessões anteriores (abr 2026)

- [x] Dashboard cliente v2 — 8 telas com dados reais
- [x] Landing /v2 — 14 seções, partículas canvas-based
- [x] Schema banco alinhado com modelo Netflix
- [x] Migrations aplicadas: subscriptions, monthly_reports, service_requests_v2, referrals, notifications, approved_at, read_at
- [x] Cenários hero demo configurados no banco
- [x] Google OAuth + redirect por role funcionando
- [x] Deploy Vercel funcionando

---

## DECISÕES TOMADAS

- **Modelo:** assinatura mensal (Netflix) com avulso como secundário
- **Planos:** Básico R$30/≤15mod · Padrão R$50/16-30mod · Plus R$100/31-60mod · Pro/Business sob consulta
- **Limpezas:** basic/standard=2/ano · plus=4/ano · 1ª limpeza 50% off · contrato 12 meses
- **Cancelamento:** paga saldo devedor do período restante
- **Limpeza extra:** 40% off avulso para assinantes
- **Preços avulso:** até 15mod=R$35 · 16-30=R$30 · 31-50=R$25 · 51-100=R$20
- **Indicações:** +6% por indicação · máximo 30% (5 indicações) · válido 12 meses
- **Comissão:** 25% plataforma / 75% técnico — nunca mostrar na landing ou dashboard cliente
- **Pagamento MVP:** PIX manual por email | Pós-MVP: Mercado Pago
- **Avulsa:** página própria 3 steps | Reagendar: modal na home
- **Hero cliente:** 5 estados (healthy/post_cleaning/soon/drop/report)
- **Menu cliente:** Início · Relatórios · Histórico · Solicitar Limpeza · Indicações · Perfil
- **Técnico aceita direto** — admin pode intervir quando necessário
- **Auto-scheduling:** cron diário cria service_requests quando next_service_at ≤ hoje+7dias
- **App mobile:** Beiço desenvolvendo em paralelo — usar anon key (nunca service_role no app)
- **Repos:** painel-clean-plataforma=v1(uber) · painel-clean-mrr=MRR(netflix atual, produção)

---

## PRÓXIMAS SESSÕES (ordem sugerida)

1. **Landing** — corrigir contadores zerados e bug calculadora
2. **Fluxo end-to-end** — teste completo cliente→técnico→admin→repasse
3. **App mobile** — alinhar escopo e stack com Beiço
4. **Claude Design** — briefar técnico e admin
5. **Pagamento** — definir fluxo PIX manual + preparar Mercado Pago
6. **Landing** — promover /v2 → /
