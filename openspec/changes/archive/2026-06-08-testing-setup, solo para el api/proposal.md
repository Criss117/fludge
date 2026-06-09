# Proposal: Testing Setup for API Package

## Intent

The `@fludge/api` package has zero tests, no runner, and no testing workflow. This proposal establishes a `bun:test` runner with a `packages/api/test/` directory that mirrors `packages/api/modules/`, plus the first unit tests to validate the harness, mocking patterns, and oRPC contract testing.

## Scope

### In Scope
- Add `test` / `test:watch` scripts to `packages/api/package.json`
- Add `test` task to `turbo.json`
- Create `packages/api/test/` with subdirectories mirroring `modules/*`
- Write first unit tests: `trycatch` utility (if cross-package runner proof needed), `CreateGroupCommand` success/failure paths
- Write first contract test: `groupsRouter.commands.create` input validation via `@orpc/server` `implement`
- Define mocking strategy for singletons (`@fludge/auth`, `@fludge/db`, `EventBus`)

### Out of Scope
- `apps/server` tests or E2E tests
- CI/GitHub Actions workflow changes
- Coverage reporting and thresholds
- Integration tests with a real/test database
- Co-located tests inside `src/modules/*` (tests live in `test/` per user directive)

## Capabilities

### New Capabilities
None — this is pure infrastructure and tooling setup with no new product behavior.

### Modified Capabilities
None — no existing spec requirements change.

## Approach

Use `bun:test` (native, zero dependencies) because Bun is already the runtime, package manager, and catalog type provider.

- **Test directory**: `packages/api/test/` mirrors `src/modules/`. Example: `test/modules/iam/groups/application/commands/create-group.command.test.ts`.
- **Unit test pattern**: Import the command class directly, inject mocked repositories and `EventBus` via constructor.
- **Router contract test**: Use `implement` from `@orpc/server` to isolate the `.input()` schema and handler without touching Elysia or real auth context.
- **Singleton mitigation**: Never import container files or index barrel files that transitively pull `@fludge/auth` or `@fludge/db`. If a test must import a module that transitively loads a singleton, use `bun.mock.module()` to intercept the import before evaluation.
- **EventBus hygiene**: Mock `EventBus` in unit tests, or call `eventBus.clear()` in `beforeEach` when testing with the real instance.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/api/package.json` | Modified | Add `test`, `test:watch` scripts |
| `turbo.json` | Modified | Add `test` task depending on `^build` |
| `packages/api/test/` | New | Mirror directory for all API tests |
| `packages/api/tsconfig.json` | None | Existing config already includes `"types": ["bun"]` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Singletons (`auth`, `dbConnection`) trigger real DB connections on import | High | Mock at module level with `bun.mock.module()`; only import classes under test, never barrel/container files |
| `EventBus` listeners leak across tests | Med | Mock `EventBus` in unit tests; clear state in `beforeEach` if real instance is used |
| `verbatimModuleSyntax` conflicts with hoisted mocks | Low | Use `bun.mock.module()` instead of `jest.mock`-style hoisted mocks |
| Test directory structure diverges from `src/modules/` over time | Low | Enforce via PR review; add a lint rule or directory tree check if needed |

## Rollback Plan

1. Revert `packages/api/package.json` scripts.
2. Revert `turbo.json`.
3. Delete `packages/api/test/` directory.
4. No database or runtime state is affected; rollback is immediate and safe.

## Dependencies

- Bun runtime (already installed and in use)
- `@types/bun` catalog dependency (already present)
- No new npm packages required

## Success Criteria

- [ ] `bun test` in `packages/api/` discovers and runs all `*.test.ts` files without errors
- [ ] `turbo test` executes the API test task successfully
- [ ] At least one command unit test runs with mocked dependencies (no real DB connection)
- [ ] At least one oRPC router contract test validates input schema with valid and invalid payloads
- [ ] No test triggers a real database connection or singleton side effect

## Proposal Question Round

Assumptions made (user may confirm or correct):
1. **Scope is strictly `packages/api/`**: `apps/server`, `packages/web`, and `packages/utils` tests are excluded.
2. **No integration tests yet**: All first tests use mocks; a real/test DB is deferred to a later proposal.
3. **No CI changes**: This proposal does not add or modify GitHub Actions workflows.
4. **Test directory is `packages/api/test/`**: Not co-located inside `src/modules/`, mirroring the module tree.
