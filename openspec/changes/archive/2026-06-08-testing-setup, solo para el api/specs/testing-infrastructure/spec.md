# Delta for Testing Infrastructure

## ADDED Requirements

### Requirement: Test Runner Discovery and Execution

The `packages/api/` package MUST support running tests via `bun test` with zero additional dependencies. The runner MUST discover all `*.test.ts` files under `packages/api/test/` and execute them without errors.

#### Scenario: bun test discovers and runs all test files

- GIVEN `packages/api/test/` contains one or more `*.test.ts` files
- WHEN `bun test` is executed from `packages/api/`
- THEN all `*.test.ts` files are discovered and executed
- AND the process exits with code 0 when all tests pass

#### Scenario: test and test:watch scripts exist in package.json

- GIVEN `packages/api/package.json`
- WHEN the `scripts` field is inspected
- THEN a `test` script exists that runs `bun test`
- AND a `test:watch` script exists that runs `bun test --watch`

#### Scenario: no new npm dependencies required

- GIVEN the test harness uses only `bun:test` and `@types/bun`
- WHEN `bun install` is run
- THEN no new packages beyond existing dependencies are required

### Requirement: Test Directory Mirror Convention

Tests for `packages/api/src/modules/` MUST live in `packages/api/test/modules/`, mirroring the source directory structure exactly. Tests MUST NOT be co-located inside `src/modules/`.

#### Scenario: test path mirrors source path

- GIVEN a source file at `packages/api/src/modules/iam/groups/application/commands/create-group.command.ts`
- WHEN its corresponding test file is created
- THEN the test file lives at `packages/api/test/modules/iam/groups/application/commands/create-group.command.test.ts`

#### Scenario: test directory does not exist yet

- GIVEN `packages/api/test/` does not exist
- WHEN the testing setup is complete
- THEN `packages/api/test/` exists with subdirectories mirroring `src/modules/`

### Requirement: Turbo Test Task Integration

The monorepo MUST support running API tests via `turbo test`. The `test` task MUST depend on `^build` to ensure the package is built before tests run.

#### Scenario: turbo test executes API test task

- GIVEN `turbo.json` has a `test` task configured
- WHEN `turbo test` is executed from the monorepo root
- THEN the `test` task runs for `packages/api/`
- AND the task depends on `^build` completing first

### Requirement: Singleton Mocking Strategy

Tests MUST NOT trigger real database connections, auth initialization, or other singleton side effects on import. Modules that transitively load singletons MUST be intercepted via `bun.mock.module()` before evaluation.

#### Scenario: importing a command class does not connect to database

- GIVEN a command class that depends on a repository interface
- WHEN the command class is imported in a test file
- THEN no real database connection is established
- AND the repository dependency is provided as a mock

#### Scenario: mocking a barrel file that loads singletons

- GIVEN a module barrel file that transitively imports `@fludge/auth` or `@fludge/db`
- WHEN a test needs to import from that module
- THEN `bun.mock.module()` is used to intercept the singleton import before evaluation
- AND the mock returns a stub that does not execute side effects

### Requirement: EventBus Test Hygiene

Tests that interact with `EventBus` MUST ensure listeners do not leak across test cases. Each test MUST start with a clean event bus state.

#### Scenario: EventBus is mocked in unit tests

- GIVEN a unit test for a command that publishes domain events
- WHEN the test is set up
- THEN `EventBus` is replaced with a mock instance
- AND published events can be asserted without real listeners firing

#### Scenario: EventBus state is cleared between tests

- GIVEN tests that use the real `EventBus` instance
- WHEN `beforeEach` runs
- THEN `eventBus.clear()` is called to remove all registered listeners
- AND no listener from a previous test fires in the current test

### Requirement: First Smoke Tests

The setup MUST include at least one passing unit test for a command class and at least one oRPC router contract test to validate the harness works end-to-end.

#### Scenario: CreateGroupCommand unit test with mocked dependencies

- GIVEN `CreateGroupCommand` requires a repository and `EventBus`
- WHEN a unit test imports `CreateGroupCommand` with mocked dependencies
- THEN the test verifies the success path (valid input, command executes)
- AND the test verifies the failure path (invalid input, error thrown)
- AND no real database connection is triggered

#### Scenario: oRPC router contract test validates input schema

- GIVEN `groupsRouter.commands.create` has an input schema defined via Zod
- WHEN a contract test calls the handler via `implement` from `@orpc/server`
- THEN a valid payload passes validation and reaches the handler
- AND an invalid payload is rejected with validation errors
- AND no Elysia server or real auth context is involved

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | `bun test` in `packages/api/` discovers and runs all `*.test.ts` files | Run `bun test` from `packages/api/`, exit code 0 |
| 2 | `turbo test` executes the API test task successfully | Run `turbo test` from monorepo root, exit code 0 |
| 3 | At least one command unit test runs with mocked dependencies | `CreateGroupCommand` test passes, no DB connection |
| 4 | At least one oRPC router contract test validates input schema | Valid and invalid payloads tested via `implement` |
| 5 | No test triggers a real database connection or singleton side effect | Monitor network/process during test run, no connections |
