# CLAUDE.md — Painel Clean MRR

> ⚠️ **REPO ATIVO DE TRABALHO:** github.com/rafaelmecoccirosa-source/painel-clean-mrr
> Todas as implementações vão aqui. A v1 (painel-clean-plataforma) é só referência histórica — nunca editar.

> Contexto completo do projeto para o Claude Code.
> Atualizado em: 2026-05-15
> Leia este arquivo inteiro antes de qualquer implementação.
> **Este é o repo MRR — modelo assinatura (Netflix). A v1 está em github.com/rafaelmecoccirosa-source/painel-clean-plataforma**

---

## O que é o projeto

Plataforma de limpeza de placas solares no modelo **assinatura recorrente (Netflix)** com serviço avulso como opção secundária. Conecta **donos de painéis solares** com **técnicos certificados** em um corredor de 13 cidades entre Jaraguá do Sul e Florianópolis (SC).

**App (produção):** painel-clean-mrr.vercel.app
**Repo:** github.com/rafaelmecoccirosa-source/painel-clean-mrr
**App v1 (referência):** painel-clean-plataforma.vercel.app

---

## Stack

- **Frontend:** Next.js 14 App Router + Tailwind CSS
- **Backend/DB:** Supabase (auth + banco + RLS + Storage)
- **Deploy:** Vercel
- **Dev:** Claude Code terminal no WSL (Ubuntu 24) via VS Code
- **Padrão de build:** 0 erros antes de mergear

---

## Identidade de marca

### Nome e tagline
- **Nome:** Painel Clean
- **Tagline oficial:** "Limpeza e Cuidado para Usinas Solares"
- **Tagline alternativa (header/rodapé):** "Limpeza e monitoramento de usinas solares"

### Tom de voz
- Direto, confiante, próximo — como um especialista de confiança
- Foca em resultado financeiro: "sua usina perdendo X% = R$ Y/mês desperdiçado"
- Usa "usina" (não "sistema" ou "instalação")
- Usa "módulos" (não "placas" ou "painéis") nos contextos técnicos
- Usa "limpeza" (não "serviço" ou "manutenção")
- Exemplos de copy aprovados:
  - "Sua usina está saudável e a 45 dias da próxima limpeza"
  - "Detectamos queda de 8% na geração — recomendamos limpeza antecipada"
  - "Sua geração subiu 11% após a limpeza"
  - "Se paga em ~4 dias"
  - "Painéis sujos perdem até 30% de eficiência"

### O que NÃO usar
- "Sem fidelidade" — existe contrato de 12 meses
- % de comissão na landing ou dashboard cliente — só no dashboard técnico pós-login
- "Mais Popular" nos planos — critério é tamanho da usina (módulos)
- "Placas" como termo principal — usar "módulos"

---

## Identidade visual

### Tokens de cor
| Token | Hex | Uso |
|-------|-----|-----|
| Dark green | `#1B3A2D` | Headers, texto principal, hero background |
| Dark green hover | `#142C22` | Hover de botões dark |
| Vibrant green | `#3DC45A` | CTAs, destaques, accents |
| Vibrant green hover | `#2DAF4A` | Hover de botões primários |
| Light green | `#EBF3E8` | Superfícies suaves, header nav, badges bg |
| Pale green | `#F4F8F2` | Background de página |
| Border green | `#C8DFC0` | Bordas de cards, divisores |
| Muted green | `#7A9A84` | Texto secundário, meta |
| Amber bg | `#FFFBEB` | Alertas suaves |
| Amber fg | `#92400E` | Texto em fundo amber |

### Tipografia
| Uso | Fonte | Peso | Tamanho |
|-----|-------|------|---------|
| Títulos de página | Montserrat | 800 | 28–32px |
| Títulos de seção | Montserrat | 800 | 20px |
| Títulos de card | Montserrat | 700 | 16–18px |
| Eyebrows | Open Sans | 700 | 11px, uppercase, letter-spacing .12em |
| Corpo | Open Sans | 400 | 14–16px |
| Meta / labels | Open Sans | 500 | 12–13px |
| Valores monetários | Montserrat | 800 | 20–40px |
| Botões | Open Sans | 600–700 | 13–15px |

### Componentes visuais
- **Radius:** cards 16px · hero 24px · botões 12px · badges 9999px
- **Sombra card:** `0 2px 12px rgba(27,58,45,.08)`
- **Sombra card hover:** `0 8px 24px rgba(27,58,45,.16)`
- **Border padrão:** `1px solid #C8DFC0`
- **Hero gradient:** `linear-gradient(135deg, #1B3A2D 0%, #0E251C 100%)`

### Header do dashboard (todas as rotas autenticadas)
- Fundo: `#EBF3E8`, altura 68px, border-bottom `1px solid #C8DFC0`
- Logo: ícone + "Painel **Clean**" (Montserrat 800) + tagline (Open Sans 12px muted)
- Nav pills: ativo = fundo white + border-radius 10px + cor dark. Inativo = cor muted
- Sino: badge vermelho + dropdown de notificações
- Avatar: círculo dark green com iniciais + nome + plano (Open Sans 12px muted)

### Menu do dashboard cliente (ordem exata)
**Início · Relatórios · Histórico · Solicitar Limpeza · Indicações · Perfil**
- "Meu Plano" fica dentro de Perfil — não é item de menu separado
- "Solicitar Limpeza" → `/cliente/avulsa`

### Partículas — padrão correto
```css
@keyframes pc-rise {
  0%   { transform: translateY(0);      opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(-120vh); opacity: 0; }
}
```
```typescript
// Canvas-based (components/landing-v2/shared.tsx)
// maxAlpha: 0.4–0.7 | speed: 0.5–1.0 px/frame | count mínimo: 15
// Cores: #3DC45A (60%) + #EBF3E8 (40%) | mix-blend-mode: screen
// Usar componente Particles de components/landing-v2/shared.tsx
```

### Animações de entrada
```css
/* Usar classes fade-up do app/globals.css */
.fade-up   { animation: fadeUp .5s ease both; }
.fade-up-1 { animation-delay: .1s; }
.fade-up-2 { animation-delay: .2s; }
.fade-up-3 { animation-delay: .3s; }
.fade-up-4 { animation-delay: .4s; }
.fade-up-5 { animation-delay: .5s; }
```

---

## Os 3 perfis

| Perfil | Rota | O que faz |
|--------|------|-----------|
| `cliente` | `/cliente` | Assina plano, agenda limpezas, vê relatórios |
| `tecnico` | `/tecnico` | Executa limpezas agendadas e avulsas |
| `admin` | `/admin` | Intermedia, confirma, libera repasse, gerencia assinaturas |

---

## Modelo financeiro

### Planos de assinatura
| Plano | Mensalidade | Módulos | Limpezas/ano |
|-------|-------------|---------|--------------|
| Básico | R$ 30/mês | até 15 | 2 |
| Padrão | R$ 50/mês | 16–30 | 2 |
| Plus | R$ 100/mês | 31–60 | 2 |
| Pro | sob consulta | 61–200 | customizado |
| Business | sob consulta | 200+ | customizado |

### Entrada e contrato
- **1ª limpeza:** 50% do preço avulso equivalente (desconto de entrada para converter)
- A partir do mês seguinte: mensalidade normal do plano
- Contrato mínimo **12 meses com carência**
- Cancelamento: paga saldo devedor do período restante
- **Objetivo estratégico do avulso:** existe como âncora de preço para tornar a assinatura obviamente vantajosa — não é o produto principal

### Preços avulso (sem assinatura)
Faixa regressiva por quantidade de módulos:

| Faixa | Preço/módulo |
|-------|-------------|
| Até 15 módulos | R$ 35,00 |
| 16–30 módulos | R$ 30,00 |
| 31–50 módulos | R$ 25,00 |
| 51–100 módulos | R$ 20,00 |
| 100+ módulos | sob consulta |

### Limpeza extra para assinantes
- **40% mais barata** que o preço avulso equivalente

### Programa de indicações
- Cada indicação que assinar = **+6% de desconto** na mensalidade
- 5 indicações = **30% de desconto** (máximo)
- Créditos válidos por **12 meses** da data da indicação
- Tabela: 1 ind=6% | 2 ind=12% | 3 ind=18% | 4 ind=24% | 5 ind=30%

### Comissão técnico (NÃO mostrar na landing nem dashboard cliente)
- Plataforma: 25% | Técnico (repasse): 75%

### Calculadora de perda (landing /v2)
```typescript
W_PER_MODULE = 550
KWH_PER_KWP_MONTH = 130   // média SC
TARIFF = 0.92              // R$/kWh

LOSS_PCT = {
  'nunca':  0.30,
  '18m+':   0.25,
  '1ano':   0.20,
  '6meses': 0.15,
}

kWp = modules * W_PER_MODULE / 1000
generationPerMonth = kWp * KWH_PER_KWP_MONTH
lossKwh = generationPerMonth * lossPct
lossBRL_month = lossKwh * TARIFF
```

---

## Banco de dados — estrutura completa

### Tabela `profiles`
```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES auth.users (SEMPRE usar este para queries)
role         text  -- 'cliente' | 'tecnico' | 'admin'
full_name    text
phone        text
city         text
cep          text
lat          float
lng          float
last_seen    timestamp  -- presença técnico (atualizado a cada 4min)
created_at   timestamp
```
⚠️ **SEMPRE** usar `.eq('user_id', user.id)` — nunca `.eq('id', user.id)`
⚠️ Email fica em `auth.users`, não em `profiles`

### Tabela `subscriptions`
```sql
id               uuid PRIMARY KEY
client_id        uuid REFERENCES profiles(user_id)
plan_type        text  -- 'basic' | 'standard' | 'plus'
status           text  -- CHECK: 'active' | 'cancelled' | 'paused'  ⚠️ constraint no banco — não usar outros valores
price_monthly    numeric
modules_count    int
started_at       timestamp
next_billing_at  timestamp
next_service_at  timestamp
inverter_brand   text  -- 'fronius'|'solarEdge'|'growatt'|'sungrow'|'hoymiles'|'deye'
inverter_api_key text  -- pós-MVP
created_at       timestamp
```

### Tabela `service_requests`
```sql
id               uuid PRIMARY KEY
client_id        uuid REFERENCES auth.users(id)
technician_id    uuid REFERENCES auth.users(id)     -- nullable até aceite  ⚠️ é technician_id (não tecnico_id)
subscription_id  uuid REFERENCES subscriptions(id)  -- nullable se avulso
origin           text  -- 'subscription' | 'avulso'
status           text  -- ver fluxo abaixo
module_count     int   -- NUNCA usar panel_count (removido)
address          text
preferred_date   date                               -- ⚠️ é preferred_date (não scheduled_date)
preferred_time   text  -- 'manha' | 'tarde'         -- ⚠️ é preferred_time (não shift)
notes            text
price_estimate   numeric
created_at       timestamp
updated_at       timestamp
```

**Status válidos de service_requests (CHECK no banco):**
```
pending → accepted → in_progress → completed
cancelled (qualquer etapa)
```

### Tabela `service_reports` (relatório de limpeza — por serviço)
Gerado pelo técnico ao concluir cada limpeza. Diferente do `monthly_reports` que é de performance mensal.

```sql
id                  uuid PRIMARY KEY
service_request_id  uuid REFERENCES service_requests(id)
technician_id       uuid REFERENCES auth.users(id)
client_id           uuid REFERENCES auth.users(id)

-- Fotos
photos_before       text[]  -- URLs no Supabase Storage
photos_after        text[]  -- URLs no Supabase Storage

-- Checklist técnico (bool)
check_fixacao       boolean  -- fixação e estrutura ok
check_cabos         boolean  -- cabos e conexões ok
check_inversor      boolean  -- inversor sem alertas
check_sombra        boolean  -- ausência de sombreamento
check_corrosao      boolean  -- sem sinais de corrosão
check_limpeza       boolean  -- limpeza concluída

-- Condições no momento
condicao_antes      text  -- 'leve' | 'moderada' | 'pesada' | 'muito_pesada'
eficiencia_visual   text  -- avaliação visual do técnico: 'otima' | 'boa' | 'regular' | 'ruim'

-- Observações livres
observacoes         text  -- nullable — anotações e recomendações do técnico

-- Controle
submitted_at        timestamp
reviewed_at         timestamp  -- nullable — quando admin revisou
created_at          timestamp
```

### Tabela `monthly_reports` (relatório de performance mensal — automático)
Enviado todo mês ao cliente, mesmo sem visita. MVP = admin preenche manualmente. Pós-MVP = API do inversor.

```sql
id               uuid PRIMARY KEY
subscription_id  uuid REFERENCES subscriptions(id)
client_id        uuid REFERENCES profiles(user_id)
period_month     int   -- 1–12
period_year      int
kwh_generated    numeric
kwh_expected     numeric
efficiency_pct   numeric
savings_estimated numeric
alert_message    text  -- nullable — usado para estado 'drop' no hero
report_pdf_url   text
sent_at          timestamp
read_at          timestamp  -- nullable — usado para estado 'report' no hero
created_at       timestamp
```

### Tabela `referrals` (programa de indicações)
```sql
id            uuid PRIMARY KEY
referrer_id   uuid REFERENCES auth.users(id)  -- quem indicou
referred_id   uuid REFERENCES auth.users(id)  -- quem foi indicado
status        varchar(20)  -- CHECK: 'pending' | 'active' | 'expired'
discount_pct  decimal(5,2) DEFAULT 6.00
expires_at    timestamptz
created_at    timestamptz DEFAULT now()
```

### RLS crítico
- Admin: usar `auth.jwt() -> 'user_metadata' ->> 'role'` — nunca subquery em profiles (erro 42P17)
- Queries admin: usar `createServiceClient()` (bypass RLS)
- Queries cliente/técnico: usar `createClient()` (RLS aplica)

---

## Relatórios — dois tipos distintos

### 1. Relatório de limpeza (`service_reports`)
- **Quando:** após cada limpeza executada pelo técnico
- **Quem preenche:** técnico, no app, antes de marcar serviço como concluído
- **Conteúdo:** fotos antes/depois, checklist técnico (fixação, cabos, inversor, sombra, corrosão), condição encontrada, observações livres
- **MVP:** técnico sobe no app — fotos + checks + observações
- **Visível para:** cliente (histórico de limpezas) + admin (revisão antes de liberar repasse)

### 2. Relatório mensal de performance (`monthly_reports`)
- **Quando:** todo mês, independente de ter havido limpeza
- **Quem preenche:** MVP = admin preenche manualmente. Pós-MVP = automático via API do inversor
- **Conteúdo:** kWh gerado vs esperado, eficiência %, economia estimada, alerta se queda detectada
- **Inversores compatíveis (pós-MVP):** Fronius, SolarEdge, Growatt, Sungrow, Hoymiles, Deye
- **Visível para:** cliente (aba Relatórios no dashboard)
- **Objetivo:** cliente "vê" o serviço funcionando todo mês — elimina churn por "não vi valor"

---

## Fluxo end-to-end de serviço

### 1. Cliente cria pedido
```
Cliente → /cliente/avulsa → cria service_request (status: pending)
         ou agendamento automático via subscription (status: pending)
```

### 2. Técnico aceita
```
Técnico → /tecnico/chamados → aceita → status: accepted  (technician_id preenchido)
          Sistema notifica cliente (email + notificação in-app)
```

### 3. Execução
```
Técnico → inicia serviço → status: in_progress
Técnico → executa limpeza
Técnico → preenche service_report:
          - fotos antes/depois
          - checklist técnico
          - condição encontrada
          - observações
Técnico → conclui → status: completed
```

### 4. Relatório e liberação
```
Admin → revisa service_report → aprova qualidade
Admin → libera repasse ao técnico (75% do valor)
Cliente → recebe notificação → acessa relatório de limpeza → pode avaliar serviço
```

### 5. Relatório mensal (todo mês)
```
MVP:    Admin → preenche monthly_report manualmente → envia ao cliente
Pós-MVP: Sistema → busca dados do inversor via API → gera monthly_report automaticamente
         → envia email ao cliente → marca sent_at
```

---

## Dashboard cliente — estados do hero

Lógica de estado (verificar nesta ordem):
```typescript
// 1. post_cleaning: última limpeza há menos de 7 dias
// 2. soon: próxima limpeza em <= 3 dias
// 3. drop: efficiency_pct do último monthly_report < 85% OU alert_message não null
// 4. report: monthly_report do mês atual com read_at null
// 5. healthy: padrão
```

**healthy:** "Sua usina está saudável e a X dias da próxima limpeza" + donut % eficiência
**post_cleaning:** "Sua geração subiu X% após a limpeza" + donut verde vibrante + antes/depois
**soon:** "Sua limpeza é em 3 dias — [data]" + card do técnico
**drop:** Hero âmbar — "Detectamos queda de X% na geração" + CTA limpeza antecipada
**report:** "Seu relatório de [mês] chegou" + kWh em destaque

---

## Autenticação — regras críticas

### Supabase clients
| Contexto | Função | RLS |
|---|---|---|
| Server Component | `createClient()` de `@/lib/supabase/server` | aplica |
| Client Component | `createClient()` de `@/lib/supabase/client` | aplica |
| Admin (bypass RLS) | `createServiceClient()` de `@/lib/supabase/service` | não aplica |

### Middleware
- Verifica sessão ativa — sem sessão → redireciona para `/login`
- **Rotas públicas:** `/`, `/v2`, `/v2/*`, `/login`, `/cadastro`, `/completar-cadastro`
- **Não faz** verificação de role (Edge Runtime — falha silenciosamente)

### Redirect pós-login
```typescript
// CORRETO — via /api/auth/redirect que usa createClient() (não service)
window.location.href = '/api/auth/redirect'
// ERRADO (flash visual)
router.push('/cliente')
```

### redirect() — CRÍTICO
```typescript
// SEMPRE fora do try/catch — lança NEXT_REDIRECT internamente
redirect('/admin')
```

---

## Landing page — estratégia de rotas

- `app/page.tsx` — landing atual em `/` — **NÃO ALTERAR**
- `app/v2/page.tsx` — nova landing em `/v2` — referência visual aprovada
- `components/landing-v2/` — componentes da nova landing
- **`'use client'` obrigatório** em todo componente com hooks ou event handlers
- Após aprovação final: `/v2` → `/`, atual → `/v1`

---

## Mapa de técnicos (`/admin/mapa`)

- `last_seen` em `profiles` atualizado pelo `PresencePing` a cada 4min
- Online = `last_seen` nos últimos 5 minutos
- Leaflet: importar **apenas dentro de useEffect** — nunca no topo do arquivo

---

## Dados demo

Senha padrão: `Demo@2026!`

**Técnicos:** carlos.souza, lucas.martins, pedro.santos, diego.ferreira, roberto.lima, amanda.reis — todos `@demo.painelclean.com.br`

**Clientes com assinatura ativa:**
| Email | Plano | Módulos |
|-------|-------|---------|
| fernanda.alves@demo.painelclean.com.br | Padrão | 20 |
| ana.silva@demo.painelclean.com.br | Básico | 12 |
| ricardo.mendes@demo.painelclean.com.br | Plus | 40 |
| maria.oliveira@demo.painelclean.com.br | Padrão | 20 |

**Admin:** `admin@painelclean.com.br`

---

## Flags de config (`lib/config.ts`)

```typescript
SUBSCRIPTION_ENABLED = true
AVULSO_ENABLED = true
INVERTER_API_ENABLED = false        // pós-MVP — fase 3
FIRST_SERVICE_DISCOUNT = 0.50       // 50% desconto na 1ª limpeza
SUBSCRIBER_EXTRA_DISCOUNT = 0.40    // 40% desconto em limpezas extras p/ assinantes
REFERRAL_DISCOUNT_PER = 0.06        // 6% por indicação
REFERRAL_MAX_DISCOUNT = 0.30        // 30% máximo
REFERRAL_VALIDITY_MONTHS = 12
COMMISSION_PLATFORM = 0.25
COMMISSION_TECNICO = 0.75
```

---

## Checklist antes de mergear

- [ ] `npm run build` com 0 erros
- [ ] Testado login com os 3 perfis
- [ ] Redirect por role sem flash (`/api/auth/redirect` usa `createClient()`)
- [ ] Dados reais quando banco tem dados, mock com badge quando vazio
- [ ] Leaflet importado só dentro de useEffect
- [ ] RLS admin usando `auth.jwt()` — nunca subquery em profiles
- [ ] `'use client'` nos componentes que usam hooks
- [ ] Rotas públicas (`/`, `/v2`) não bloqueadas pelo middleware
- [ ] Commits cirúrgicos sem CRLF churn
- [ ] Tagline correta: "Limpeza e Cuidado para Usinas Solares"
- [ ] Menu cliente na ordem: Início · Relatórios · Histórico · Solicitar Limpeza · Indicações · Perfil
- [ ] Partículas usando canvas-based de `components/landing-v2/shared.tsx`
- [ ] Animações fade-up nas seções (classes do globals.css)
- [ ] Relatório de limpeza (`service_reports`) preenchido pelo técnico antes de concluir serviço
- [ ] Relatório mensal (`monthly_reports`) distinto do relatório de limpeza
