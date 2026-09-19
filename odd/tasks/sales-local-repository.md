# Feature: sales-local-repository

## Objective

Create and implement the local (native) repository contract for sales: the domain interface in `@fludge/client` and its SQLite implementation in `apps/native`, wired through both containers.

## Problem

Sales data already syncs into the local DB (`localSale` / `localSaleItem`), but there is no domain repository to read (or write) sales locally. The upcoming sales history UI needs a paginated local `findAll` without filters.

## Why

User request: "crea e implementa la interfaz del repositorio local para sales, para el metodo findAll no agregues filtros, solo el paginado".

## Scope

New files:

- packages/client/src/application/sales/domain/sale.repository.ts (interface + types)
- apps/native/src/modules/sales/repositories/native-sale.repository.ts (SQLite implementation)

Files to edit:

- packages/client/src/application/sales/container.ts (inject saleRepository)
- apps/native/src/integrations/dependencies/sale.container.ts (wire native repo)

## Constraints

- `findAll(organizationId, cursor)` — NO filters, only pagination (per user instruction).
- Follow the existing native repository pattern (native-customer.repository.ts / native-product.repository.ts): offset/limit + `paginate()` util, `json_group_array` + `jsonObject()` for sale items, `buildConflictUpdateColumn` for upserts.
- Sale items are read as `json_group_array` (same shape as API `FindAllSalesQuery`); dates inside parsed JSON are converted back to `Date`.
- Upsert conflict columns for `localSale`/`localSaleItem` align with `NativeSyncSaleRepository.saveAll` so both writers stay consistent.
- Local DB schema unchanged (localSale/localSaleItem already exist).
- Conventional commits; no AI attribution.

## Checklist

- [x] T1: Create `SaleRepository` interface (`SaleDetail` = LocalSaleSelect + items; findAll sin filtros; save) (commit 37121c0)
- [x] T2: Implement `NativeSaleRepository` (paginated findAll, transactional save) (commit 37121c0)
- [x] T3: Wire containers (client `generateSaleContainer` dep + native `sale.container.ts`) (commit 37121c0)
- [x] T4: check-types verification (see evidence below)
- [x] T5: `useFindSales` infinite query + sales container nested under `repositories` (user-authored; flat consumers migrated by orchestrator) (commit 5b870de)

## Verification evidence

- bun run check-types → packages/client pass (tsc -b)
- bun run check-types → apps/native pass (tsc -b)
- bun test packages/sync → 2 pass / 0 fail (unaffected)
- prettier --check on all touched files → pass
- RDD: off (user-owned switch) — no native review; ordinary checks only
- No repository-level DB test harness exists for native repos (DatabaseService = expo-sqlite, not runnable under bun); verification is typecheck + pattern conformance, consistent with the rest of the repo
- Container restructure to `repositories.*` broke flat consumers: fixed `use-sync-sale.ts` and `use-ticket.store.ts` accesses (root cause of the ~100 TS7006 cascade)

## Delivery

- Branch: feat/sales-local-repository → merged to main (ff) → pushed to origin/main (f452feb..5b870de)
- Authored changed lines: ~236 total (within 400 budget)
- Strategy: ask-on-risk
