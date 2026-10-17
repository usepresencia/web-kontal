# web-kontal

Frontend do **Kontal** — gestão financeira e contábil para micro e
pequenas empresas do Simples Nacional e escritórios de contabilidade
terceirizados. Next.js + React.

Extraído do monorepo original (`grupo04/accountflow-front`), sem
histórico de commits. Vai ganhar seletor de empresa ativa, envio de
contexto de tenant e migração de auth para Firebase, para falar com o
novo backend em
[`api-kontal`](https://github.com/usepresencia/api-kontal).

Contexto completo da migração:
[spec de design](https://github.com/6-Semestre-Grupo-4/grupo04/blob/main/docs/superpowers/specs/2026-09-19-kontal-migration-design.md).

## Como contribuir

Usamos [Commitizen](https://commitizen.github.io/cz-cli/) e
[Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).
Em vez de `git commit`, use:

```bash
npm run commit
```

Commits fora do padrão não passam no CI (`commitlint`).

## Rodando localmente

```bash
npm install
npm run dev
```

## Ambiente local com Docker

Portas: api-kontal `3000`, web-presencia `3001`, web-kontal `3002`.

1. Suba a api-kontal (`docker compose up -d` no banco e `npm run start:dev`) e o web-presencia (`npm run dev -- -p 3001`) com `NEXT_PUBLIC_KONTAL_DOMAIN=http://localhost:3002`.
2. Aqui: `cp .env.example .env.local` e `docker compose up --build`.
3. Entre no web-presencia como `INTERNAL_ADMIN`, clique em Kontal e confira que abre `http://localhost:3002`.

A api-kontal precisa ter `http://localhost:3002` em `CORS_ALLOWED_ORIGINS`.

## Tema e tokens

O tema fica em `src/app/globals.css`, em duas camadas: a da marca (valores do brand board) e a semântica
(`bg-background`, `text-primary`, `text-positive`...). Os componentes só usam a camada semântica; cores
`brand-*` existem só para a página `/design`, que mostra os tokens em desenvolvimento.

`npm run lint` falha se achar hex, `rgb(`, `hsl(`, valor arbitrário de cor ou cor padrão do Tailwind
fora do `globals.css` (regra em `src/lib/_utils/token-rules.ts`). Accent só aparece sobre Ink; Positive e
Negative só em valores e estados financeiros.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run format
npm test
```

O CI roda commitlint, `prettier --check`, lint, typecheck, testes (Vitest) e build.
