# Tasks: Testing Setup for API Package

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150–190 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Test harness + first tests | PR 1 (single) | One PR, well under 400 lines |

## Phase 1: Test Infrastructure

- [x] 1.1 Add `"test": "bun test"` and `"test:watch": "bun test --watch"` to `packages/api/package.json` scripts
- [x] 1.2 Add `test` task to `turbo.json` with `dependsOn: ["^build"]`, no outputs
- [x] 1.3 Create `packages/api/test/modules/iam/groups/application/commands/.gitkeep`
- [x] 1.4 Create `packages/api/test/modules/iam/groups/infrastructure/http/.gitkeep`

## Phase 2: Unit Test — CreateGroupCommand

- [x] 2.1 Create `create-group.command.test.ts` — import class directly from source file path, import `EventBus` type (not instance)
- [x] 2.2 Write `setup()` helper: hand-rolled `EventBus` fake (`register: mock, dispatch: mock`) + `PGGroupsCommandsRepository` fake (`save: mock`)
- [x] 2.3 Write test: "registers organization:registered listener on construction" — assert `eventBus.register` called with `"organization:registered"`, `{ critical: true, listenerName: "CreateGroupCommand" }`
- [x] 2.4 Write test: "executes successfully with valid input" — `repo.save` returns `ok(data)` → result contains merged `createdBy`
- [x] 2.5 Write test: "throws ORPCError when repository returns an error" — `repo.save` returns `err(error)` → throws `ORPCError("INTERNAL_SERVER_ERROR")` with error attached

## Phase 3: Contract Test — groupsRouter.commands.create

- [x] 3.1 Create `groups.router.commands.create.contract.test.ts` — add `mock.module("@fludge/db", ...)` and `mock.module("@fludge/auth", ...)` before dynamic import of router file
- [x] 3.2 Write test: "accepts valid payload" — `implement` call with `{ name: "Admins", permissions: ["groups:view"] }` + synthetic context → handler succeeds
- [x] 3.3 Write test: "rejects payload with empty permissions" — `createGroupCommand.parse({ name: "x", permissions: [] })` throws ZodError

## Phase 4: Verification

- [x] 4.1 Run `bun test` in `packages/api/` — all tests pass, no real DB/auth connection errors
- [x] 4.2 Run `bun run check-types` in `packages/api/` — no type errors in test files
- [x] 4.3 Run `turbo test` from root — pipeline executes test task successfully
