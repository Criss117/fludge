# Exploration: Testing Setup for API Package

## Current State

The API package (`@fludge/api`) is a TypeScript ESM monorepo package located at `packages/api/`. It serves as the backend API layer and is consumed by the `apps/server` Elysia application. It has **zero existing tests** — no test files, no test runner, no test scripts, and no testing-related dependencies anywhere in the workspace.

### API Package Location and Structure Overview

- **Location**: `packages/api/`
- **Entry point**: `src/index.ts` (exports oRPC procedures and context builders)
- **Router aggregation**: `src/routers/index.ts` (composes domain routers into `appRouter`)
- **Domain modules**: `src/modules/{domain}/` (e.g., `iam/auth`, `iam/groups`, `iam/members`, `iam/organizations`, `iam/group-members`, `inventory`, `shared`)
- **Pattern per module**:
  - `application/commands/` — CQRS command handlers (classes with `execute()`)
  - `application/queries/` — CQRS query handlers (classes with `execute()`)
  - `domain/` — (optional) domain types/value objects
  - `infrastructure/http/` — oRPC routers (`*.router.ts`)
  - `infrastructure/repositories/` — Drizzle ORM repository implementations
  - `container.ts` — manual dependency injection wiring (pure `new` constructors)

### Workspace Build & Type Configuration

- **Package manager**: `bun@1.3.14`
- **TSConfig base**: `@fludge/config/tsconfig.base.json` extends `ESNext`, `bundler` resolution, `verbatimModuleSyntax`, `types: ["bun"]`
- **API tsconfig**: `packages/api/tsconfig.json` adds `composite: true`, `paths: { "@fludge/api/*": ["./src/*"] }`, `outDir: "dist"`
- **No test-specific tsconfig** exists.
- **Turbo**: `turbo.json` has no `test` task.

### Architecture Patterns Relevant to Testing

1. **oRPC routers**: `appRouter` is a plain object of nested routers. Each router is a `{ commands: {}, queries: {} }` object where values are oRPC procedures built with `.route().input().handler()`.
2. **Procedures**: `publicProcedure`, `protectedProcedure`, `rootOnlyProcedure`, and `withOrganization()` are defined in `src/index.ts` using `os.$context<Context>()`.
3. **Context creation**: `src/context.ts` exports `createContext()` which reads Elysia request headers and calls `auth.api.getSession()` from `@fludge/auth` (better-auth).
4. **Manual DI containers**: Each module has a `container.ts` that instantiates repositories/commands/queries with `new` and exports them as a plain object. Example: `groupsContainer.commands.create` is an instance of `CreateGroupCommand(eventBus, groupsCommandsRepository)`.
5. **Drizzle ORM**: Queries and commands depend on `DbConnection` (from `@fludge/db`) which is a global `drizzle(env.DATABASE_URL, { schema })` instance.
6. **Event bus**: `src/modules/shared/domain/event-bus.ts` provides a simple pub/sub used by commands (e.g., `CreateGroupCommand` registers a listener on `organization:registered`).
7. **Input validation**: Commands use Zod schemas exported alongside the class (e.g., `createGroupCommand` schema is used as `.input()` in the router).

### Current Testing State

| Aspect | Status |
|--------|--------|
| Test runner | None |
| Test files | 0 |
| Test scripts in `packages/api/package.json` | None |
| Test scripts in root `package.json` | None |
| Testing dependencies | None |
| `turbo.json` test task | None |
| CI test step | Unknown (no `.github/workflows` explored) |

### How DI Works — What Needs Mocking

- **Commands**: Take repository and event-bus instances via constructor. Unit tests can inject mocked interfaces directly.
- **Queries**: Take `DbConnection` (Drizzle). To unit-test queries without a DB, one must mock the Drizzle query builder or use an integration test with a real/test DB.
- **Routers**: Depend on containers (globals). To test routers in isolation, either:
  - Use `implement` from `@orpc/server` to override the handler of a procedure for contract testing.
  - Spin up the Elysia server and hit endpoints (integration/e2e style).
- **Context**: Depends on `@fludge/auth` which calls `betterAuth` with a real DB. For router-level tests, a fake `Context` object can be passed directly into the oRPC handler if using `implement` or `os` base calls.

## Recommended Test Runner

### Option A: `bun:test` (Recommended)

**Rationale**: The project is already all-in on Bun (package manager, runtime, types in tsconfig). `bun:test` is built-in, zero-config for Bun projects, fast, and has good TypeScript support. There is no extra dependency to install. The `@types/bun` catalog dependency already provides test types.

- **Pros**: Native Bun integration, no extra install, fastest execution, matches existing runtime, supports `describe/it/expect/mock`.
- **Cons**: Less mature than Vitest for advanced features like in-source testing, UI mode, or complex path aliasing. Mocking APIs are slightly less ergonomic than Vitest (`jest.fn`-style). Workspace-wide test running requires custom script or turbo integration.
- **Effort**: Low

### Option B: Vitest

**Rationale**: Vitest is the gold standard for Vite/Bun-compatible TypeScript testing. It handles `paths` aliases automatically, has a great watch mode, and excellent mocking utilities.

- **Pros**: Best-in-class DX, handles `tsconfig paths` out of the box, rich mock/spy APIs, built-in coverage, works with Bun runtime.
- **Cons**: Adds a dev dependency (~1.5MB) and a config file. Potential friction with `verbatimModuleSyntax` and `types: ["bun"]` if not configured properly.
- **Effort**: Low-Medium

### Recommendation

Use **`bun:test`** for this project because:
1. The team is already using Bun as runtime and package manager; adding Vitest is an unnecessary external dependency.
2. `@types/bun` is already in the workspace catalog.
3. The testing gap is large (zero tests) — the priority is getting *any* runner working quickly rather than optimizing DX.
4. `bun:test` supports `mock` and `spyOn` which is sufficient for mocking DI containers and Drizzle.
5. If advanced needs arise later (coverage UI, complex module mocking), migrating to Vitest is trivial because both use the same `describe/it/expect` API.

## Recommended Test Config Approach

1. **Test script in `packages/api/package.json`**:
   ```json
   "scripts": {
     "test": "bun test",
     "test:watch": "bun test --watch"
   }
   ```
2. **Turbo task in `turbo.json`**:
   ```json
   "test": {
     "dependsOn": ["^build"]
   }
   ```
3. **Test file convention**: Co-locate tests alongside source files using `*.test.ts` (e.g., `create-group.command.test.ts` next to `create-group.command.ts`). This aligns with the existing flat module structure and makes tests easy to discover.
4. **No separate test tsconfig needed**: The existing `tsconfig.json` already includes `"types": ["bun"]` via the base config. If the test runner needs to resolve `@fludge/api/*` aliases, ensure the test command runs from the package directory so `paths` in `tsconfig.json` resolves correctly.
5. **Environment**: For integration tests that need a DB, create a test helper that spins up a `drizzle` connection to a separate test database (e.g., `DATABASE_URL_TEST` or an in-memory PostgreSQL via `pglite` or `testcontainers`). For the first setup, avoid DB integration — focus on unit tests with mocked repositories.

## Recommended First Tests to Prove the Setup

1. **Unit test: `trycatch` utility** (`packages/utils/src/trycatch.ts`) — test the `tryCatch` helper that wraps promises in a `[data, error]` tuple. This is a pure utility with no dependencies; it validates the runner works and can import workspace packages.
2. **Unit test: `CreateGroupCommand` — success path** (`packages/api/src/modules/iam/groups/application/commands/create-group.command.test.ts`) — mock `EventBus` and `PGGroupsCommandsRepository`, call `command.execute()`, assert the returned data and that `eventBus.register` was called in constructor.
3. **Unit test: `CreateGroupCommand` — failure path** — mock repository to return error, assert `ORPCError` is thrown with correct code.
4. **Contract test: `groupsRouter.commands.create` input validation** — Use `implement` from `@orpc/server` to call the `.input()` schema with valid/invalid payloads and assert Zod errors. This proves oRPC testing patterns work.
5. **Integration test (optional): Health check endpoint** — In `apps/server`, the root `GET /` returns `"OK"`. This can be tested by starting the Elysia app and making a `fetch` request to it. However, since the scope is `packages/api` only, skip this for now and keep it in `apps/server` testing when that scope is addressed.

**Priority order**: Start with #1 (utility), then #2 (command unit), then #4 (router contract). This proves: (a) runner works, (b) mocking works, (c) oRPC contract testing works.

## Risks and Blockers

- **Risk 1 — `@fludge/auth` global singleton**: `auth` is exported as a singleton from `packages/auth/src/index.ts`. It creates a Drizzle connection at import time. If any test (even indirectly) imports `auth`, it will try to connect to the real database unless `env.DATABASE_URL` is set. For unit tests, we must avoid importing files that transitively import `auth` or use `bun.mock.module` to intercept the `auth` import.
- **Risk 2 — `dbConnection` global singleton**: Same pattern in `packages/db`. Any import of `dbConnection` triggers `drizzle(env.DATABASE_URL)`. Unit tests that import repositories or queries will pull this in. Mitigation: mock `@fludge/db` at the module level (`bun.mock.module`) or structure tests to only import the *class* and instantiate it with a fake DB object.
- **Risk 3 — EventBus side effects**: `CreateGroupCommand` constructor calls `registerListeners()` which mutates the global `eventBus`. If tests instantiate the real command, they may leak listeners across tests. Mitigation: mock `EventBus` in unit tests, or ensure `eventBus.clear()` in a `beforeEach` if using the real one.
- **Risk 4 — `withOrganization` middleware**: Testing routers that use this middleware requires constructing a full `Context` with a fake session, organization, and member. This is verbose. For early setup, focus on testing the *command* (business logic) rather than the *router* (HTTP layer), and add a simpler `publicProcedure` endpoint test for the runner proof.
- **Risk 5 — `verbatimModuleSyntax`**: TypeScript config enforces `verbatimModuleSyntax`. `bun:test` is fine with this, but some testing utilities (like `jest.mock` or Vitest's `vi.mock`) do hoisting that can conflict. `bun.mock.module` is the native equivalent and should be used.
- **Blocker — None**: There is no existing test infrastructure to conflict with. The workspace is clean. The only prerequisite is ensuring `bun` is installed (it is).

## Ready for Proposal

Yes. The exploration is complete. The orchestrator should present the user with the `bun:test` recommendation and the first test plan (utility → command unit → router contract). Ask the user if they want to proceed with `bun:test` or prefer Vitest, and whether they want to include an integration test with a real/test database from the start.
