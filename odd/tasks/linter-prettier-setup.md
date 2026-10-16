# Linter + Prettier setup for monorepo

Set up shared ESLint and Prettier configuration for the tracked monorepo, enforce type imports, remove unused imports, and run autofix over existing code.

## Specs

S1. "quiero que configures prettier/linter"
S2. "eliminar los imports no usados (como por defecto hace la config de un proyecto expo)"
S3. "los imports de tipos o que se usan como tipos deben ser marcados como types"
S4. "a todo el monorepo" (tracked workspaces only; `apps/native-old` is not part of the repo and `apps/desktop` is not ready to commit)
S5. "corre el autofix"

## Tasks

- [ ] T1: Create shared Prettier config in `@fludge/config`
- [ ] T2: Create shared ESLint base config in `@fludge/config` (TypeScript, unused imports, type imports)
- [ ] T3: Create ESLint React Native preset in `@fludge/config` extending `eslint-config-expo/flat`
- [ ] T4: Install/update linting dependencies in root and tracked workspaces
- [ ] T5: Create local `eslint.config.js` / `.prettierrc` in each tracked workspace
- [ ] T6: Update `turbo.json` and root/package scripts for `lint`, `lint:fix`, `format`, `format:check`
- [ ] T7: Run autofix (`eslint --fix` + `prettier --write`) across tracked code
- [ ] T8: Verify `turbo run lint`, `turbo run format:check`, and `bun test` pass

## Log

L1. User request: "quiero que configures prettier/linter, entre otras cosas, eliminar los imports no usados(como por defecto hace la config de un proyecto expo), los imports de tipos o que se usan como tipos deben ser marcados como types, que mas reglas crees que deberia tener en cuenta"
L2. User clarifies scope: whole tracked monorepo, ignore `apps/native-old` and `apps/desktop`, run autofix.
