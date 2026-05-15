# Painel Clean — Plataforma MRR

Plataforma de limpeza de usinas solares no modelo **assinatura recorrente (Netflix)**. Conecta donos de painéis solares com técnicos certificados em Santa Catarina.

> **Tagline:** Limpeza e Cuidado para Usinas Solares

## Stack

- **Next.js 14** com App Router
- **TypeScript**
- **Tailwind CSS** com design system próprio
- **Supabase** (Auth + PostgreSQL + RLS + Storage)
- **Vercel** (deploy + cron jobs)
- **Chart.js** (gráficos de geração e eficiência)

## Modelo de negócio

| Plano | Mensalidade | Módulos | Limpezas/ano |
|-------|-------------|---------|--------------|
| Básico | R$ 30/mês | até 15 | 2 |
| Padrão | R$ 50/mês | 16–30 | 2 |
| Plus | R$ 100/mês | 31–60 | 4 |
| Pro/Business | sob consulta | 61+ | customizado |

- 1ª limpeza com **50% off**
- Contrato mínimo **12 meses**
- Limpeza avulsa disponível com **40% off** para assinantes

## Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `dark-green` | `#1B3A2D` | Headers, textos, hero background |
| `vibrant-green` | `#3DC45A` | CTAs, destaques, accents |
| `light-green` | `#EBF3E8` | Superfícies suaves, nav |
| `pale-green` | `#F4F8F2` | Background de página |
| `border-green` | `#C8DFC0` | Bordas de cards |
| `muted-green` | `#7A9A84` | Texto secundário |

## Estrutura de rotas

```
/                         → Landing page pública (modelo atual)
/v2                       → Nova landing page (em aprovação → será a /)
/login                    → Autenticação (email/senha + Google OAuth)
/cadastro                 → Registro em steps (cliente 4 steps / técnico 3 steps)
/completar-cadastro       → Complemento pós-Google OAuth

/cliente/home             → Dashboard cliente (hero dinâmico 5 estados)
/cliente/relatorios       → Relatórios mensais + gráficos
/cliente/historico        → Histórico de serviços + gráficos
/cliente/avulsa           → Solicitar limpeza avulsa (3 steps)
/cliente/indicacoes       → Programa de indicações (até 30% desconto)
/cliente/perfil           → Dados pessoais + usina + assinatura

/tecnico                  → Dashboard técnico (chamados + ganhos)
/tecnico/chamados         → Chamados disponíveis na região
/tecnico/chamados/[id]    → Detalhe + aceitar chamado
/tecnico/agenda           → Agenda de serviços
/tecnico/ganhos           → Histórico financeiro
/tecnico/conclusao/[id]   → Concluir serviço + fotos
/tecnico/perfil           → Perfil do técnico

/admin                    → Painel administrativo (métricas + MRR)
/admin/servicos           → Gestão de serviços
/admin/servicos/[id]      → Detalhe + designar técnico
/admin/pagamentos         → Liberação de repasses
/admin/relatorios         → Métricas da plataforma
/admin/usuarios           → Aprovação de técnicos
/admin/mapa               → Mapa de técnicos online
```

## Perfis de usuário

| Perfil | O que faz |
|--------|-----------|
| `cliente` | Assina plano, solicita limpezas, acompanha relatórios |
| `tecnico` | Aceita chamados, executa limpezas, recebe repasse |
| `admin` | Gerencia plataforma, aprova técnicos, libera repasses |

## Configuração local

1. Clone o repositório:
   ```bash
   git clone https://github.com/rafaelmecoccirosa-source/painel-clean-mrr
   cd painel-clean-mrr
   npm install
   ```

2. Configure as variáveis de ambiente:
   ```bash
   cp .env.local.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qprnhafgebfjnkadopge.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
   CRON_SECRET=seu-cron-secret
   ```

3. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Usuários demo

**Senha:** `Demo@2026!`

| Email | Perfil |
|-------|--------|
| fernanda.alves@demo.painelclean.com.br | Cliente — Padrão |
| ana.silva@demo.painelclean.com.br | Cliente — Básico |
| ricardo.mendes@demo.painelclean.com.br | Cliente — Plus |
| carlos.souza@demo.painelclean.com.br | Técnico — Jaraguá do Sul |
| admin@painelclean.com.br | Admin |

## Documentação

- **`CLAUDE.md`** — arquitetura completa, schema do banco, fluxos e regras
- **`TODO.md`** — estado atual e próximos passos
- **`MOBILE_BRIEFING.md`** — briefing para desenvolvimento do app mobile
- **`supabase/migrations/`** — todas as migrations aplicadas

## App mobile

Em desenvolvimento paralelo com React Native + Expo.
Ver `MOBILE_BRIEFING.md` para detalhes de integração.
