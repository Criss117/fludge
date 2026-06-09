# Design: Testing Setup for API Package

## Technical Approach

Bootstrap `bun:test` for `packages/api/` by adding the runner scripts to `package.json`, registering a `test` task in `turbo.json` that depends on `^build`, and creating a `test/` tree that mirrors `src/modules/`. Tests are pure unit tests with mocks — no real DB, no Elysia, no auth initialization. Singleton side effects are neutralized by either (a) importing the class under test directly (skipping barrel files that load `@fludge/auth` or `@fludge/db`) or (b) using `bun.mock.module()` to intercept transitively-loaded singletons before evaluation.

This maps directly to the proposal: harness + first smoke tests in one change, deferring integration tests, coverage, and CI to later proposals.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Runner | `bun:test` (built into Bun runtime) | vitest, jest, node:test | Already the runtime + package manager; zero install cost; uses `@types/bun` (already in catalog). Proposal mandated. |
| Test location | `packages/api/test/` mirroring `src/modules/` | Co-located `*.test.ts` next to source | User directive in proposal. Keeps `src/` purely production code; easier to exclude `test/` from build outputs and coverage later. |
| Mock strategy | Constructor injection of fakes; `bun.mock.module()` for transitively-loaded singletons | DI container in test mode, MSW, full integration tests | Command classes already accept `EventBus` + repository via constructor. Router contract tests use `implement` so we never load Elysia or `groupsContainer` (which imports `dbConnection` from `@fludge/db`). |
| EventBus in tests | Hand-rolled fake (`{ register: mock, dispatch: mock }`) — never the real instance | Import real `eventBus` and call `clear()` between tests | Constructor injection means we can pass a fake. Real `eventBus` has a global `externalBus.publish` logger that pollutes test output. |
| Router contract | `implement` from `@orpc/server` calling `.handler()` with synthetic `input` + `context` | Spin up Elysia + supertest, call `groupsContainer.commands.create` directly | `implement` runs the full procedure pipeline (input parsing → handler) without HTTP/transport. Direct container call skips the `withOrganization` permission middleware, so it isn't a true contract test. |
| Coverage / CI | Out of scope (deferred) | Add `c8` + `bun test --coverage`, GitHub Actions | Proposal explicitly excludes. Adding now inflates scope and decisions. |

## Directory Structure

```
packages/api/
├── package.json                          # +test, +test:watch scripts
├── src/                                  # unchanged
│   ├── context.ts
│   ├── index.ts
│   ├── modules/
│   │   ├── iam/groups/...
│   │   └── shared/...
│   └── routers/...
└── test/                                 # NEW — mirrors src/modules/
    └── modules/
        └── iam/
            └── groups/
                ├── application/
                │   └── commands/
                │       └── create-group.command.test.ts
                └── infrastructure/
                    └── http/
                        └── groups.router.commands.create.contract.test.ts
```

The first PR creates the full directory tree even though only two files are populated. This enforces the mirror convention from day one — adding a new source module requires adding its test directory, not a co-located file.

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/api/package.json` | Modify | Add `"test": "bun test"` and `"test:watch": "bun test --watch"` to `scripts` |
| `turbo.json` | Modify | Add `test` task with `dependsOn: ["^build"]`, no `outputs` (tests are side-effect runs) |
| `packages/api/test/modules/iam/groups/application/commands/create-group.command.test.ts` | Create | First command unit test (success + failure paths) |
| `packages/api/test/modules/iam/groups/infrastructure/http/groups.router.commands.create.contract.test.ts` | Create | First oRPC contract test using `implement` |
| `packages/api/test/.gitkeep` | Create | Keeps the `test/` tree tracked before any file is committed |

## Mocking Architecture

The codebase has exactly two singletons that trigger side effects on import: `dbConnection` (`@fludge/db`) and `auth` (`@fludge/auth`). Both create real Postgres pool / Better Auth instances at module load time. The DI containers under `src/modules/*/container.ts` import them eagerly, so importing a container file in a test is forbidden.

### Three-tier mock strategy

1. **Constructor injection (preferred)** — command classes take `EventBus` and repository instances in the constructor. Tests instantiate them with hand-rolled fakes. Zero `bun.mock.module()` needed for the class under test.

2. **Direct class import (also preferred)** — import `CreateGroupCommand` from its concrete file path, never from `container.ts`. The file's only external dep is `@fludge/utils/...` (pure) and `@fludge/api/modules/shared/domain/event-bus` (type-only import). No singletons fire.

3. **`bun.mock.module()` (fallback)** — when a module under test transitively imports something that fires a singleton (e.g. a router file that imports `groupsContainer` → `dbConnection`), intercept the singleton module before importing the file. Pattern:

   ```ts
   import { mock } from "bun:test";

   mock.module("@fludge/db", () => ({
     dbConnection: { /* query stub */ },
   }));

   // Now safe to import the router file
   const { groupsRouter } = await import("@fludge/api/modules/iam/groups/infrastructure/http/groups.router");
   ```

   This applies to the oRPC contract test because `groupsRouter.commands.create` reaches into `groupsContainer` at handler-call time, not at import time. We can either (a) `mock.module("@fludge/db", ...)` before importing the router, or (b) skip the container and call `os.$context().input(createGroupCommand).handler(...)` directly. Decision: **(a)** — it tests the real wiring up to the handler boundary.

### EventBus fake

```ts
const eventBus = {
  register: mock(() => eventBus),
  dispatch: mock(async () => {}),
} as unknown as EventBus;
```

Tracks calls via `mock()`; never executes registered handlers; lets us assert `register` was called with the right event name during `CreateGroupCommand` construction.

## Test Patterns

### Pattern A — Command unit test (`create-group.command.test.ts`)

Imports the class directly. Fakes `EventBus` and `PGGroupsCommandsRepository`. Tests:

- **success path**: valid input → `groupsCommandsRepository.save` called with slugified name + `preparePermissions` output → returns repo result merged with `createdBy`
- **failure path**: `save` returns `err(...)` → `ORPCError("INTERNAL_SERVER_ERROR")` thrown with the error attached
- **listener registration**: constructor calls `eventBus.register("organization:registered", handler, { critical: true, listenerName: "CreateGroupCommand" })`

```ts
import { describe, expect, it, mock } from "bun:test";
import { CreateGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";

describe("CreateGroupCommand", () => {
  const setup = () => {
    const eventBus = {
      register: mock(() => eventBus),
      dispatch: mock(async () => {}),
    } as unknown as EventBus;

    const repo = {
      save: mock(async () => ok({ id: "g1", name: "Admins", ... })),
    } as unknown as PGGroupsCommandsRepository;

    return { eventBus, repo, cmd: new CreateGroupCommand(eventBus, repo) };
  };

  it("registers organization:registered listener on construction", () => { ... });
  it("executes successfully with valid input", async () => { ... });
  it("throws ORPCError when repository returns an error", async () => { ... });
});
```

### Pattern B — oRPC router contract test (`groups.router.commands.create.contract.test.ts`)

Mocks `@fludge/db` before importing the router, then calls the procedure via `implement`:

```ts
import { describe, expect, it, mock } from "bun:test";

mock.module("@fludge/db", () => ({
  dbConnection: {},
}));

const { groupsRouter } = await import(
  "@fludge/api/modules/iam/groups/infrastructure/http/groups.router"
);

describe("groupsRouter.commands.create contract", () => {
  it("accepts a valid payload", async () => {
    const os = groupsRouter.commands.create as any;
    const result = await os.handler({
      input: { name: "Admins", permissions: ["groups:view"] },
      context: { /* synthetic auth + org context */ },
    });
    expect(result).toBeDefined();
  });

  it("rejects a payload with empty permissions", async () => {
    // os.input.parse({ name: "x", permissions: [] }) throws ZodError
  });
});
```

Note: this test exercises the input schema in isolation (via `createGroupCommand.parse(...)`) and the handler with a synthetic context. It does NOT exercise `withOrganization` permission middleware — that's a deeper E2E concern out of scope.

## Configuration Changes

### `packages/api/package.json`

```diff
   "scripts": {
+    "test": "bun test",
+    "test:watch": "bun test --watch"
   },
```

### `turbo.json`

```diff
   "tasks": {
+    "test": {
+      "dependsOn": ["^build"]
+    },
     "build": { ... }
   }
```

No `outputs` — tests are not cached artifacts. `^build` ensures dependency packages (`@fludge/db`, `@fludge/auth`, `@fludge/utils`) are built before the API test task runs, matching the existing `lint` and `check-types` pattern.

### `tsconfig.json` — unchanged

Already has `"types": ["bun"]` in the inherited base config, so `bun:test` globals (`describe`, `it`, `expect`, `mock`) type-check without further setup.

## Import Strategy (singleton avoidance)

Allowed imports in test files:
- The class file under test: `@fludge/api/modules/iam/groups/application/commands/create-group.command`
- The router file under test: `@fludge/api/modules/iam/groups/infrastructure/http/groups.router` (only after `mock.module("@fludge/db", ...)`)
- Pure utilities: `@fludge/utils/trycatch`, `@fludge/utils/slugify`, `@fludge/utils/permissions/...`
- Test types from `bun:test`

Forbidden imports:
- `@fludge/db` (real `dbConnection`) — except via `mock.module`
- `@fludge/auth` (real `auth`) — except via `mock.module`
- `src/index.ts` (the public package entry; pulls in `groupsContainer`)
- Any `container.ts` file (`src/modules/*/container.ts` — eagerly wires `dbConnection`)
- `src/routers/index.ts` (composes all routers; triggers every container)

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit (command) | `CreateGroupCommand.execute` success/failure + listener registration | Constructor-injected fakes; assertions on `mock` call args |
| Unit (utility) | (deferred — `trycatch`, `slugify` already covered in `packages/utils` if/when that package gets tests) | n/a in this change |
| Contract (router) | `groupsRouter.commands.create` input schema accepts/rejects | `implement` from `@orpc/server` + `mock.module("@fludge/db")` to skip container wiring |
| Integration | Real DB, real auth | **Out of scope** — separate proposal |

## Migration / Rollout

No migration. No data changes. The new `test/` directory is excluded from the `build` task's `outputs` (no `dist/test/` produced). Rolling back = revert the 4 file changes above.

## Open Questions

- [ ] Should `bunfig.toml` get a `[test]` section configuring preloads or per-test setup? **Default: no** — the few smoke tests don't need it; revisit if a `beforeEach` factory is added later.
- [ ] Should the contract test exercise `withOrganization` permission checks? **Default: no** — would require mocking `@fludge/auth` extensively; out of scope for first smoke tests.
- [ ] Should `test/` be excluded from `tsc` compilation via tsconfig? **Default: no** — `verbatimModuleSyntax` already makes `test/` a clean runtime boundary; `tsc --noEmit` will type-check it as a bonus.
