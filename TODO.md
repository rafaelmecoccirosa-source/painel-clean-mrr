# Painel Clean Plataforma v2 — TODO & Histórico de Decisões

> Arquivo vivo. Atualizar a cada sessão.
> Versão: v2 — modelo assinatura (Netflix)
> Última atualização: 2026-04-30

---

## PENDENTES — Bugs críticos a resolver

- [ ] RLS policy `admin_read_all_profiles` causa 42P17 (recursão infinita) em várias leituras client-side
  - Fix: aplicar `auth.jwt() -> 'user_metadata' ->> 'role'` na policy em vez de subquery em profiles
  - Isso destrava chamados do técnico, perfil, e outras leituras que usam createClient()
- [ ] "Completar cadastro" aparecendo indevidamente para usuários que já têm perfil completo
- [ ] Perfil cliente — modal de edição não salva corretamente em alguns casos
- [ ] Hero state da Fernanda mostrando "drop" em vez de "healthy" — monthly_report com alert_message ativo sobrepondo lógica
- [ ] Responsivo mobile — dashboard cliente quebra no celular (admin e técnico ok)

---

## PENDENTES — Fluxo e funcionalidades

### Fluxo end-to-end (parcialmente testado)
- [ ] Técnico aceitar chamado → testar se status muda corretamente no banco
- [ ] Admin liberar repasse → testar fluxo completo de pagamento
- [ ] Notificações em tempo real quando chamado é aceito

### Dashboard cliente
- [ ] Responsivo mobile — todas as páginas
- [ ] Hero state corrigido com lógica de prioridade correta
- [ ] Indicações — conectar com tabela referrals real (link de indicação funcional)
- [ ] Relatórios — PDF real gerado (MVP: admin gera manualmente)

### Dashboard técnico
- [ ] Briefing Claude Design — layout, componentes, animações
- [ ] Agenda — conectada ao banco mas layout básico, precisa de design
- [ ] Conclusão de serviço — upload de fotos real (hoje aceita URL)
- [ ] Perfil técnico — status de aprovação visível

### Dashboard admin
- [ ] Briefing Claude Design — layout, componentes, animações
- [ ] Aprovação de técnicos — checklist antes de aprovar
- [ ] Relatório mensal — interface para admin preencher manualmente (MVP)
- [ ] Mapa — corrigir erro supabaseUrl (SUPABASE_SERVICE_ROLE_KEY vazio no build)

### Login e cadastro
- [ ] Visual do login — alinhar com tokens da landing v2
- [ ] Cadastro — testar fluxo completo com usuário real novo (cliente e técnico)
- [ ] completar-cadastro — revisar condição que dispara indevidamente

### Landing
- [ ] Promover /v2 → / após aprovação final (arquivar atual em /v1)

---

## PENDENTES — Pré-lançamento

- [ ] Corrigir RLS policy admin_read_all_profiles (raiz de vários bugs)
- [ ] Adicionar SUPABASE_SERVICE_ROLE_KEY no .env.local local (build warnings)
- [ ] Configurar domínio customizado no Vercel
- [ ] Auditoria de acessibilidade
- [ ] Responsivo mobile — todas as páginas

---

## PENDENTES — Pós-MVP

- [ ] Integração API inversores (Fronius, SolarEdge, Growatt, Sungrow, Hoymiles, Deye)
- [ ] Débito automático recorrente
- [ ] App mobile (base responsiva sendo construída com isso em mente)
- [ ] Geração automática de PDF de relatório com fotos antes/depois
- [ ] Renomear repos: painel-clean-plataforma → v1, painel-clean-v2 → v2/v3

---

## CONCLUÍDO — Sessão 2026-04-30

### Fluxo end-to-end — primeiros testes reais
- [x] Avulsa cria service_request real no banco (origin='avulso', protocolo real)
- [x] Técnico vê chamados disponíveis na home
- [x] Detalhe do chamado funcionando (criado GET /api/tecnico/chamado/[id])
- [x] Aba Chamados disponíveis corrigida (fallback quando RLS falha)
- [x] Fix "takenByOther" — card adequado quando chamado já foi aceito

### Segurança e infraestrutura
- [x] Next.js atualizado 14.2.18 → 14.2.35 (security patch CVE)
- [x] CRON_SECRET adicionado no Vercel
- [x] Cron job de auto-scheduling criado (app/api/cron/schedule-services)
- [x] vercel.json configurado com cron diário às 8h

### Banco de dados
- [x] Migration read_at em monthly_reports aplicada
- [x] Tabela referrals criada com RLS policies
- [x] Tabela notifications criada com RLS
- [x] Migration approved_at em profiles aplicada
- [x] efficiency_pct corrigido em todos os monthly_reports demo
- [x] Cenários de hero configurados por cliente demo:
  - Fernanda Alves → healthy (próxima limpeza 45 dias)
  - Ana Silva → soon (limpeza em 2 dias)
  - Ricardo Mendes → post_cleaning (limpeza há 3 dias)
  - Maria Oliveira → drop (efficiency 69.9% + alert_message)

### Autenticação e redirect
- [x] Fix redirect por role — layouts de cliente/técnico/admin corrigidos
- [x] user_metadata.role atualizado para todos os usuários demo
- [x] /api/auth/redirect cria profile se não existir

### Terminologia e identidade
- [x] Tagline corrigida para "Limpeza e Cuidado para Usinas Solares"
- [x] "Sem fidelidade" removido → "1ª limpeza com 50% off"
- [x] "placas" → "módulos" em 7 arquivos de UI
- [x] panel_count removido → module_count em 4 arquivos
- [x] lib/pricing.ts — nova faixa até 15 módulos R$35/módulo

### Dashboards implementados
- [x] Dashboard cliente — 8 telas com dados reais do Supabase
- [x] Dashboard técnico — home, chamados, agenda, ganhos, perfil, conclusão
- [x] Dashboard admin — home, serviços, pagamentos, relatórios, mapa, aprovação técnicos
- [x] Notificações — tabela + RLS + badge no header + marcar como lidas

### CLAUDE.md
- [x] Schema completo documentado (service_reports, notifications, approved_at)
- [x] Cenários demo documentados
- [x] Divergências corrigidas (technician_id, preferred_date, status values)

---

## CONCLUÍDO — Sessão 2026-04-21

- [x] Dashboard cliente v2 — 8 telas implementadas via Claude Code
- [x] Chart.js instalado e configurado
- [x] Fix redirect pós-login
- [x] CLAUDE.md e TODO.md atualizados

---

## CONCLUÍDO — Sessão 2026-04-20

- [x] Landing /v2 implementada — 14 seções, partículas canvas-based
- [x] Calculadora corrigida (130 kWh/kWp/mês)
- [x] Migrations v2 aplicadas no Supabase

---

## CONCLUÍDO — Sessões anteriores

- [x] Repo painel-clean-v2 criado e configurado
- [x] Supabase v2 com RLS configurado
- [x] Deploy Vercel funcionando
- [x] Google OAuth configurado
- [x] 6 técnicos + 6 clientes + 1 admin demo criados
- [x] Landing atual (/) refinada mobile

---

## DECISÕES TOMADAS

- **Modelo:** assinatura mensal (Netflix) com avulso como secundário
- **Planos:** Básico R$30/≤15mod · Padrão R$50/16-30mod · Plus R$100/31-60mod · Pro/Business sob consulta
- **Limpezas:** 2/ano incluídas · 1ª limpeza 50% off · contrato 12 meses
- **Cancelamento:** paga saldo devedor do período restante
- **Limpeza extra:** 40% off avulso para assinantes
- **Preços avulso:** até 15mod=R$35 · 16-30=R$30 · 31-50=R$25 · 51-100=R$20
- **Indicações:** +6% por indicação · máximo 30% (5 indicações) · válido 12 meses
- **Comissão:** 25% plataforma / 75% técnico — nunca mostrar na landing ou dashboard cliente
- **Avulsa:** página própria 3 steps | Reagendar: modal na home
- **Hero cliente:** 5 estados (healthy/post_cleaning/soon/drop/report)
- **Menu cliente:** Início · Relatórios · Histórico · Solicitar Limpeza · Indicações · Perfil
- **Meu Plano:** dentro de Perfil — não é item de menu separado
- **Referência visual:** handoff Claude Design é fonte de verdade
- **Tagline:** "Limpeza e Cuidado para Usinas Solares"
- **Nomenclatura:** "módulos" / "usina" / "limpeza"
- **Técnico aceita direto** — admin pode intervir quando necessário
- **Auto-scheduling:** cron diário cria service_requests quando next_service_at ≤ hoje+7dias
- **Repos pós-MVP:** painel-clean-plataforma=v1(uber) · painel-clean-v2=v2/v3(netflix atual)

---

## PRÓXIMAS SESSÕES (ordem sugerida)

1. **Fix RLS** — corrigir admin_read_all_profiles policy (raiz de vários bugs)
2. **Bugs** — completar-cadastro indevido + hero state Fernanda + perfil não salva
3. **Responsivo** — dashboard cliente mobile-first
4. **Claude Design** — briefar técnico e admin, depois implementar
5. **Fluxo end-to-end** — teste completo cliente→técnico→admin→repasse
6. **Landing** — promover /v2 → /
