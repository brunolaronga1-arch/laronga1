# Cópia parcial do projeto Lovable "Little Nest Household Planner"

Cópia somente leitura, feita em 2026-11-08 a partir do commit Lovable `6c384082087b162aab4ea60efb53d3560675d3fa`,
para revisão com o plugin Elephant-Goldfish (EGM). Não sincroniza com o Lovable: alterações devem ser feitas no Lovable.

## Incluído
- `spec.md` — resumo do projeto (requisitos, papéis, regras de acesso, decisões, pendências)
- `AGENTS.md` — regras de arquitetura do projeto
- `roadmap.md`, `.lovable/north-star/north-star.md`, `package.json`, `README.md`
- `drizzle/migrations/` — esquema do banco, RLS e triggers (exceto `0001_seed_catalogs.sql`, só dados iniciais)
- `src/lib/auth-rules.ts`, `src/lib/auth.functions.ts`, `src/lib/members.functions.ts` — login, recuperação, pessoas e convites
- `src/routes/api/public/jobs/reminders.ts` — job de avisos

## Não incluído
Telas (`src/routes/_authenticated/*`, `src/components/*`), demais arquivos de `src/lib` (recorrência, avisos, diário, PWA, push),
integrações Supabase, testes, `.env` (segredos), imagens e lockfile.
Para a cópia completa e sempre atualizada, conecte o projeto ao GitHub no Lovable.
