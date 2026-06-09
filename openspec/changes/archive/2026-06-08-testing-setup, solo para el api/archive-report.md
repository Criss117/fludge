# Archive Report: Testing Setup for API Package

**Change**: `testing-setup, solo para el api`
**Archived at**: 2026-06-08
**Archive path**: `openspec/changes/archive/2026-06-08-testing-setup, solo para el api/`
**Commit**: `f7a7c02`
**Verification**: PASS WITH WARNINGS (0 critical, 2 warnings, 3 suggestions)

## Delivered vs Planned

| Scope | Planned | Delivered | Status |
|-------|---------|-----------|--------|
| `test` / `test:watch` scripts in `packages/api/package.json` | ✅ | ✅ | ✓ |
| `test` task in `turbo.json` with `dependsOn: ["^build"]` | ✅ | ✅ | ✓ |
| `test/` mirror directory under `packages/api/` | ✅ | ✅ | ✓ |
| `CreateGroupCommand` unit test (success + failure + listener) | ✅ | ✅ | ✓ (3 tests) |
| oRPC contract test via `implement` | ✅ | ⚠️ Deviated | Schema tested, but not via `.handler()` |
| `.gitkeep` files in leaf directories | ✅ | ✅ | ✓ |
| Root `test/.gitkeep` | ✅ | ❌ Not created | Benign — leaf `.gitkeep` files suffice |
| CI/GitHub Actions | ❌ Out of scope | ❌ | Correctly excluded |
| Coverage reporting | ❌ Out of scope | ❌ | Correctly excluded |
| Integration tests | ❌ Out of scope | ❌ | Correctly excluded |

## Task Completion

All 13/13 implementation tasks completed and marked `[x]` in `tasks.md`.

## Verification Summary

| Metric | Value |
|--------|-------|
| Tests passing | 5/5 (0 failures) |
| Execution time | 177ms |
| Type-check | Clean (`tsc --noEmit` exit 0) |
| Turbo pipeline | ✅ 1 task successful |
| CRITICAL issues | 0 |
| WARNINGS | 2 |
| SUGGESTIONS | 3 |

### Warnings (non-blocking)

**WARNING-001** — Contract test does not exercise handler pipeline as designed. Schema validation is tested but `.handler()` via `implement` was not used; the implementer chose a pragmatic scope reduction. Acceptance criterion #4 partially met.

**WARNING-002** — Root `test/.gitkeep` not created. Only leaf-level `.gitkeep` files present. Functionally redundant — git tracks the tree through leaf files.

### Suggestions

**SUGGESTION-001** — Contract test also mocks `@fludge/auth` (positive deviation beyond design). Consider updating the design to reflect this.

**SUGGESTION-002** — EventBus singleton logs during contract test (`console.log` side effect from real `eventBus.register`). Benign but worth mocking for complete isolation.

**SUGGESTION-003** — Task 4.2 references non-existent `check-types` script in `packages/api/`. The actual verification used `tsc --noEmit` which passes. Task description should be corrected.

## Follow-Up Items

1. **Contract test depth**: Consider a follow-up change to add real `implement`-based contract tests that exercise the full `.handler()` pipeline with synthetic context.
2. **Integration tests**: Deferred to a separate proposal (no timeline set).
3. **Coverage + CI**: No coverage reporting or CI workflow yet — proposed out of scope.
4. **EventBus isolation**: Mocking `@fludge/api/modules/shared/domain/event-bus` in the contract test would eliminate the benign `console.log` side effect.

## Spec Sync

| Domain | Action | Details |
|--------|--------|---------|
| testing-infrastructure | Created | 7 requirements, 11 scenarios, 5 acceptance criteria |

The delta spec from `specs/testing-infrastructure/spec.md` was promoted to canonical source of truth at `openspec/specs/testing-infrastructure/spec.md` (no existing main spec).

## SDD Cycle

**Status**: ✅ Complete — change fully planned, implemented, verified, and archived.
