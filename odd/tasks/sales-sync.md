# Feature: sales-sync

## Objective
Add sales sync to the sync module, following the exact pattern of customer sync (mem #283), covering both the API side (packages/sync, packages/api) and the native client (packages/client, apps/native).

## Problem
Mobile clients can already sync IAM, catalog and customer data, but sales (tickets sold offline) have no sync: the native app cannot pull sales from the server nor push pull-based deltas for it.

## Why
User request: "agrega sync de sales, al igual que el resto de sync en el modulo sync, implementa tanto en api como en native".

## Scope
New files (mirroring customer naming):
- packages/sync/src/types/sale.types.ts
- packages/sync/src/repositories/sale/server-sync-sale.repository.ts
- packages/sync/src/repositories/sale/client-sync-sale.repository.ts
- packages/sync/src/engine/sale/sync-server-sale.engine.ts
- packages/api/src/modules/sync/infrastructure/repositories/sync-sale.repository.ts
- packages/api/src/modules/sync/application/queries/find-sync-sale.query.ts
- packages/client/src/application/sync/use-sync-sale.ts
- apps/native/src/integrations/db/repositories/native-sync-sale.repository.ts

Files to edit:
- packages/api/src/modules/sync/container.ts (register)
- packages/api/src/modules/sync/infrastructure/http/sync.router.ts (route POST /sync/sale)
- packages/client/src/application/sales/container.ts (inject syncSaleRepository)
- packages/client/src/application/sync/use-invalidate-sync.ts (invalidateSale)
- apps/native/src/integrations/dependencies/sale.container.ts (wire native repo)
- apps/native/src/integrations/db/sync.tsx (SyncSaleSuspense)
- apps/native/src/modules/iam/auth/presentation/sections/settings-sync.section.tsx (SyncItem module "sale" + icon + useSyncSale)
- packages/i18n/src/locales/es/screens.ts (screens.settings.sync.sale)
- packages/i18n/src/locales/es/api-errors.ts (sync.sale error keys)

## Constraints
- Follow the customer sync structure exactly (two sides: server types -> ServerSync interface -> engine -> drizzle repo -> query -> container -> router; client ClientSync interface -> native repo -> containers -> hook -> sync.tsx suspense).
- Do not create a client engine (SyncClient*Engine are dead code; hooks implement http repo inline).
- No changes to packages/db (localSale/localSaleItem with updatedAt already exist), container.provider.tsx, dependencies/index.tsx, routers/index.ts.
- Conventional commits; no AI attribution.

## Checklist
- [x] T1: packages/sync — sale.types.ts, server/client sync repositories, SyncServerSaleEngine (commits 58024f3; tests RED→GREEN: bun test packages/sync → 2 pass)
- [x] T2: packages/api — SyncSaleRepository (drizzle delta queries), FindSyncSaleQuery (zod), container registration, router route (commit 58024f3; bun test packages/api/test/modules/sync → 3 pass)
- [x] T3: packages/client — useSyncSale hook, sales container Deps injection (flat), invalidateSale in use-invalidate-sync (commit b969def; check-types pass)
- [x] T4: apps/native — NativeSyncSaleRepository (transaction upsert via buildConflictUpdateColumn), sale.container wiring, SyncSaleSuspense in db/sync.tsx (commit 325b06d; check-types pass)
- [x] T5: Settings sync UI — module/icon unions, SyncItem for sale ("point-of-sale"), i18n es keys (commit f545cf3; check-types apps/native pass)
- [x] T6: Tests + check-types verification (see evidence below)

## Verification evidence
- bun test packages/sync → 2 pass / 0 fail
- bun test packages/api/test/modules/sync → 3 pass / 0 fail
- bun test packages/i18n/src/locales/es.test.ts → 1 pass / 1 fail ("preserves protected dictionary divisions") — BASELINE FAILURE: identical failure on main (verified by checkout); protected divisions (api_errors/validators/permissions) were not touched by this feature
- bun run check-types (packages/sync, packages/api, packages/client, apps/native) → all clean

## Accepted deviations
- salesContainer stays FLAT (syncSaleRepository at top level) instead of nesting under `repositories` like customerContainer — avoids breaking use-ticket.store.ts consumers of salesContainer.localTicketRepository.
- api-errors.ts untouched: sale query reuses the same api_errors.sync.iam.* keys the customer query reuses (existing pattern).
- TDD strict honored only for the testable units (engine delegation, zod schema); repo has zero test infrastructure in sync/api (only i18n es.test.ts exists), so wiring files were verified via type check as planned in the doc.

## Delivery
- Strategy: single-pr — user chose one PR; maintainer accepts size:exception (564 authored lines > 400 budget).
- RDD: off (global) — no native review; commits are delivery-ready under ordinary repo policy.
- PR: created on push (see commit/PR identity below).

## Progress / evidence
- Work-unit commits: 58024f3 (sync+api), b969def (client), 325b06d (native persist), f545cf3 (native UI+i18n)

## Next step
Create single PR (size:exception) from feat/sales-sync.
