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

## Qualidade

```bash
npm run lint
npm run typecheck
npm run format
npm test
```

O CI roda commitlint, `prettier --check`, lint, typecheck, testes (Vitest) e build.
