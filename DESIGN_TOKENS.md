# DESIGN_TOKENS — Painel Clean MRR
> Referência única de design para web (Next.js) e mobile (React Native + Expo).
> Última atualização: 2026-05-15
> **Regra:** web mobile-first e app mobile devem ter o mesmo visual. Qualquer alteração aqui deve ser refletida em ambos.

---

## 1. Cores

Fonte: `/lib/brand-tokens.ts` → objeto `COLORS`

| Token | Hex | Uso |
|-------|-----|-----|
| `COLORS.dark` | `#1B3A2D` | Backgrounds escuros, textos principais, header |
| `COLORS.green` | `#3DC45A` | CTAs, destaques, badges ativos, progresso |
| `COLORS.lightBg` | `#EBF3E8` | Superfícies suaves, cards em fundo claro |
| `COLORS.paleBg` | `#F4F8F2` | Background geral das páginas |
| `COLORS.border` | `#C8DFC0` | Bordas, divisores, separadores |
| `COLORS.muted` | `#7A9A84` | Texto secundário, labels, placeholders |
| `COLORS.amberBg` | — | Alertas/avisos (estado `soon` do hero) |

### Cores de estado (Hero 5 estados)
| Estado | Cor principal | Contexto |
|--------|--------------|----------|
| `healthy` | `COLORS.green` | Limpeza em dia |
| `soon` | amber | Limpeza próxima |
| `post_cleaning` | `COLORS.green` | Recém limpo |
| `drop` | vermelho/laranja | Queda de eficiência detectada |
| `pending` | `COLORS.muted` | Sem dados / aguardando |

---

## 2. Tipografia

Fonte: `app/globals.css` e `app/v2/landing-v2.css`

| Uso | Família | Peso(s) |
|-----|---------|---------|
| Títulos | Montserrat | 700, 800, 900 |
| Corpo / parágrafos | Open Sans | 400, 500, 600 |
| Valores numéricos grandes | Montserrat | 800 |
| Botões | Open Sans | 600 |

### Tamanhos de fonte — referência por contexto

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Hero título | 42px | 22px |
| StatCard valor | 52px | 52px (sem ajuste — **pendente**) |
| StatCard label | 22px | 22px (sem ajuste — **pendente**) |
| Corpo de texto | 16px | 15px |
| Label secundário | 13–14px | 13–14px |

> ⚠️ **StatCards:** internamente sem responsividade. No mobile o grid colapsa para 1 coluna mas os tamanhos internos não se ajustam. Considerar 36px/16px no mobile para valor/label.

---

## 3. Espaçamentos

| Contexto | Desktop | Mobile |
|----------|---------|--------|
| Padding de página | `32px 28px 72px` | `24px 16px 56px` |
| Padding do Header | `0 28px` | `0 16px` |
| Gap entre cards | `24px` | `16px` |
| Padding interno card | `24px` | `16px` |
| Max-width container | `1200px` | 100% |
| Max-width header inner | `1280px` | 100% |

---

## 4. Breakpoints

| Nome | Valor | Implementação atual |
|------|-------|---------------------|
| Mobile | `≤ 640px` | `@media (max-width: 640px)` em `globals.css` |
| Desktop | `> 640px` | default (desktop-first) |

> Não usa breakpoints Tailwind (`sm:`, `md:`). Usa classes CSS customizadas com prefixo `pc-`.

### Classes CSS customizadas (globals.css)

| Classe | Comportamento no mobile |
|--------|------------------------|
| `.pc-mobile-stack` | `grid-template-columns: 1fr !important` |
| `.pc-mobile-pad` | `padding: 24px 16px 56px !important` |
| `.pc-mobile-hidden` | `display: none` |
| `.pc-mobile-only` | `display: block` (hidden no desktop) |
| `.pc-mobile-h-scroll` | scroll horizontal com scroll-snap |

---

## 5. Componentes-chave

### HeroCard (5 estados)
- **Desktop:** grid 2 colunas (`1.4fr auto`), gap 40px, padding `40px 48px`, título 42px
- **Mobile:** grid 1 coluna, donut centralizado abaixo do texto, título 22px, botões em coluna
- **Donut SVG:** animação de pulso, stroke baseado em % de eficiência, cor muda por estado
- **Prioridade de replicação no app: ALTA**

### StatCards (3 cards)
- **Desktop:** `repeat(3, 1fr)`
- **Mobile:** colapsa para 1 coluna via `.pc-mobile-stack`
- **Internamente:** sem ajuste de tamanho — ⚠️ replicar com ajuste no app (36px/16px)
- **Prioridade de replicação no app: MÉDIA**

### Header
- **Desktop:** logo + nav inline + notificações + avatar
- **Mobile:** logo + ícone de notificação + hamburger
- **Drawer mobile:** 78vw, máx 320px, z-index 61, fecha com overlay
- **Dropdown notificações:** 340px desktop → `calc(100vw - 24px)` mobile
- **No app mobile:** substituir por Bottom Navigation Bar
- **Prioridade de replicação no app: ALTA**

### Donut SVG
- SVG puro com animação CSS de pulso
- Centro exibe % de eficiência com Montserrat 800
- Cor do stroke = cor do estado atual
- **Prioridade de replicação no app: MÉDIA** (pode usar biblioteca de charts no RN)

---

## 6. Fluxo de estados — Hero

```
subscription.status = active
  → service_requests recentes?
      → tem limpeza hoje/amanhã? → post_cleaning
      → next_service_at < 7 dias? → soon
      → eficiência caiu > 10%?   → drop
      → senão                    → healthy
  → sem service_requests         → pending
```

---

## 7. Regras para o app mobile (Beiço)

1. **Nunca usar `.eq('id', user.id)`** — sempre `.eq('user_id', user.id)`
2. **Campos corretos:** `module_count` (não `panel_count`), `technician_id` (não `tecnico_id`), `preferred_date` (não `scheduled_date`)
3. **Status subscriptions:** só `active`, `cancelled`, `paused`
4. **Status service_requests:** `pending → accepted → in_progress → completed`
5. **Nunca usar service_role key** — só anon key no app
6. **Bottom Nav** substitui o Header drawer no mobile app
7. **Visual idêntico ao mobile web** — usar as mesmas cores, fontes e espaçamentos deste documento
8. **Fontes React Native:** `Montserrat` e `Open Sans` via `expo-font` ou `@expo-google-fonts`

---

## 8. Dados demo (senha: `Demo@2026!`)

| Email | Perfil | Estado hero esperado |
|-------|--------|----------------------|
| fernanda.alves@demo.painelclean.com.br | Cliente Padrão | healthy |
| ana.silva@demo.painelclean.com.br | Cliente Básico | soon |
| ricardo.mendes@demo.painelclean.com.br | Cliente Plus | post_cleaning |
| maria.oliveira@demo.painelclean.com.br | Cliente Padrão | drop |
| carlos.souza@demo.painelclean.com.br | Técnico JGS | — |
| admin@painelclean.com.br | Admin | — |

---

## 9. Referências

- **Web (referência visual):** `painel-clean-mrr.vercel.app`
- **Repo:** `github.com/rafaelmecoccirosa-source/painel-clean-mrr`
- **Supabase:** `https://qprnhafgebfjnkadopge.supabase.co`
- **brand-tokens.ts:** `/lib/brand-tokens.ts`
- **globals.css:** `/app/globals.css`
- **MOBILE_BRIEFING.md:** já no repo, leia antes de codar

---

> ⚠️ **Pendências conhecidas antes do lançamento:**
> - StatCards: ajustar tamanhos internos no mobile (web e app)
> - Login/cadastro: visual ainda não alinhado com tokens da landing v2
> - Testimonials da landing: substituir placeholders por reais
