# Painel Clean — Mobile App Briefing

> Documento para o agente de IA responsável pelo desenvolvimento do app React Native.
> Leia este documento inteiro antes de escrever qualquer código.

---

## O que é o projeto

**Painel Clean** é uma plataforma de limpeza de placas solares no modelo **assinatura recorrente (Netflix)**. Conecta donos de usinas solares com técnicos certificados em Santa Catarina.

O app mobile é o **frontend mobile do cliente** — a mesma experiência do dashboard web, mas nativo.

---

## Repositório e recursos

| Recurso | Link |
|---------|------|
| Repo web (referência) | github.com/rafaelmecoccirosa-source/painel-clean-v2 |
| App web (produção) | painel-clean-v2.vercel.app |
| Supabase URL | https://qprnhafgebfjnkadopge.supabase.co |
| Anon key | pegar no Supabase → Settings → API → anon public |

⚠️ **Nunca usar a service_role key no app mobile** — ela bypassa RLS e dá acesso total ao banco.

---

## Stack do app mobile

- **Framework:** React Native + Expo
- **Auth:** Supabase Auth (SDK: `@supabase/supabase-js`)
- **Backend:** Supabase (mesmo banco da web)
- **Navegação:** Expo Router ou React Navigation
- **Estado:** React Context ou Zustand

---

## Banco de dados — tabelas principais

O schema completo está em `CLAUDE.md` no repo. Resumo das tabelas que o app consome:

### `profiles`
```sql
user_id    uuid  -- SEMPRE usar este (não id)
role       text  -- 'cliente' | 'tecnico' | 'admin'
full_name  text
phone      text
city       text
```

### `subscriptions`
```sql
client_id        uuid
plan_type        text  -- 'basic' | 'standard' | 'plus'
status           text  -- 'active' | 'cancelled' | 'paused'
price_monthly    numeric
modules_count    int
next_service_at  timestamp
next_billing_at  timestamp
```

### `service_requests`
```sql
client_id        uuid
technician_id    uuid  -- nullable até aceite
origin           text  -- 'subscription' | 'avulso'
status           text  -- 'pending' → 'accepted' → 'in_progress' → 'completed'
module_count     int
preferred_date   date
preferred_time   text  -- 'manha' | 'tarde'
price_estimate   numeric
```

### `monthly_reports`
```sql
client_id      uuid
period_month   int
period_year    int
kwh_generated  numeric
kwh_expected   numeric
efficiency_pct numeric
alert_message  text  -- nullable
read_at        timestamp  -- nullable
```

### `notifications`
```sql
user_id    uuid
title      text
body       text
type       text  -- 'service_update' | 'report_ready' | 'billing' | 'system'
read_at    timestamp  -- nullable
```

---

## Autenticação

Usar Supabase Auth com email/senha e Google OAuth.

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qprnhafgebfjnkadopge.supabase.co',
  SUPABASE_ANON_KEY
)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})

// Após login, ler o role do usuário
const { data: profile } = await supabase
  .from('profiles')
  .select('role, full_name, city, phone')
  .eq('user_id', data.user.id)  // SEMPRE user_id, nunca id
  .single()
```

---

## Telas do app (MVP — foco no perfil cliente)

### Prioridade 1 — Fluxo básico
1. **Splash / Onboarding** — logo + tagline
2. **Login** — email/senha + Google OAuth
3. **Cadastro** — 4 steps: dados pessoais → usina → plano → confirmação
4. **Home do cliente** — hero dinâmico + stat cards + histórico resumido
5. **Solicitar limpeza** — avulsa em 3 steps

### Prioridade 2 — Funcionalidades principais
6. **Relatórios** — lista de PDFs + gráfico de geração
7. **Histórico** — lista de serviços + gráficos
8. **Perfil** — dados pessoais + usina + assinatura
9. **Notificações** — lista + marcar como lida

### Prioridade 3 — Extras
10. **Indicações** — programa de desconto progressivo
11. **Meu Plano** — detalhes + comparativo + cancelamento

---

## Hero do dashboard cliente — 5 estados dinâmicos

A lógica do hero muda conforme os dados da assinatura. Verificar nesta ordem:

```typescript
// 1. post_cleaning: último serviço completed há < 7 dias
// 2. soon: próxima limpeza em <= 3 dias
// 3. drop: efficiency_pct < 85 OU alert_message != null (mês atual)
// 4. report: monthly_report do mês atual com read_at = null
// 5. healthy: padrão
```

| Estado | Título | Visual |
|--------|--------|--------|
| healthy | "Sua usina está saudável e a X dias da próxima limpeza" | Verde, gauge eficiência |
| post_cleaning | "Sua geração subiu X% após a limpeza" | Verde vibrante, antes/depois |
| soon | "Sua limpeza é em X dias — [data]" | Verde, card do técnico |
| drop | "Detectamos queda de X% na geração" | Âmbar, CTA urgente |
| report | "Seu relatório de [mês] chegou" | Azul, kWh em destaque |

---

## Identidade visual

### Cores
```
Dark green:    #1B3A2D  (backgrounds, texto principal)
Vibrant green: #3DC45A  (CTAs, destaques)
Light green:   #EBF3E8  (superfícies suaves)
Pale green:    #F4F8F2  (background de página)
Border:        #C8DFC0  (bordas, divisores)
Muted:         #7A9A84  (texto secundário)
```

### Tipografia
- Títulos: **Montserrat 800**
- Corpo: **Open Sans**
- Valores monetários: Montserrat 800, tamanho grande

### Tom de voz
- Usa "usina" (não "sistema" ou "instalação")
- Usa "módulos" (não "placas" ou "painéis")
- Usa "limpeza" (não "serviço" ou "manutenção")
- **Nunca mostrar % de comissão** para o cliente

---

## Modelo de negócio (para entender o produto)

### Planos de assinatura
| Plano | Mensalidade | Módulos | Limpezas/ano |
|-------|-------------|---------|--------------|
| Básico | R$ 30/mês | até 15 | 2 |
| Padrão | R$ 50/mês | 16–30 | 2 |
| Plus | R$ 100/mês | 31–60 | 4 |

- 1ª limpeza com **50% off**
- Contrato mínimo **12 meses**
- Limpeza extra: **40% mais barata** que avulso para assinantes

### Preços avulso (para cálculos)
| Módulos | Preço/módulo |
|---------|-------------|
| até 15 | R$ 35,00 |
| 16–30 | R$ 30,00 |
| 31–50 | R$ 25,00 |
| 51–100 | R$ 20,00 |

### Programa de indicações
- +6% de desconto por indicação ativa
- Máximo 30% (5 indicações)
- Válido por 12 meses

---

## Usuários demo para testar

**Senha de todos:** `Demo@2026!`

| Email | Perfil | Dashboard esperado |
|-------|--------|--------------------|
| fernanda.alves@demo.painelclean.com.br | Cliente Padrão | Hero: healthy |
| ana.silva@demo.painelclean.com.br | Cliente Básico | Hero: soon |
| ricardo.mendes@demo.painelclean.com.br | Cliente Plus | Hero: post_cleaning |
| maria.oliveira@demo.painelclean.com.br | Cliente Padrão | Hero: drop |
| carlos.souza@demo.painelclean.com.br | Técnico | Jaraguá do Sul |
| admin@painelclean.com.br | Admin | Painel admin |

---

## Regras críticas de desenvolvimento

1. **Queries sempre com `.eq('user_id', user.id)`** — nunca `.eq('id', user.id)`
2. **Email fica em `auth.users`** — não em `profiles`
3. **Anon key apenas** no app — service_role nunca vai pro cliente
4. **RLS está ativo** — cada usuário só vê seus próprios dados
5. **`service_requests` usa `module_count`** — nunca `panel_count` (removido)
6. **Status de service_requests:** pending → accepted → in_progress → completed
7. **Status de subscriptions:** só `active`, `cancelled`, `paused` — o banco tem CHECK constraint

---

## API routes existentes no backend web

O app pode consumir estas rotas diretamente (autenticação via Bearer token do Supabase):

| Método | Rota | O que faz |
|--------|------|-----------|
| POST | `/api/cliente/avulsa` | Cria pedido de limpeza avulsa |
| PATCH | `/api/cliente/reagendar` | Reagenda próxima limpeza |
| PATCH | `/api/cliente/perfil` | Atualiza dados do perfil |

Para as demais operações, usar o Supabase SDK diretamente com a anon key.

---

## Referências visuais

O app web já tem o design implementado. Ver em:
- `painel-clean-v2.vercel.app/cliente/home` (login com Fernanda)
- Componentes em `components/cliente/` no repo
- Design tokens em `CLAUDE.md` no repo
