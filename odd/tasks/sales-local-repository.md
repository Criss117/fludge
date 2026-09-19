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

- [ ] T1: Create `SaleRepository` interface (`SaleDetail` = LocalSaleSelect + items; findAll sin filtros; save)
- [ ] T2: Implement `NativeSaleRepository` (paginated findAll, transactional save)
- [ ] T3: Wire containers (client `generateSaleContainer` dep + native `sale.container.ts`)
- [ ] T4: check-types verification

## Verification evidence

- (pending)

## Delivery

- Branch: feat/sales-local-repository
- Forecast authored lines: ~120 (within 400 budget)
- Strategy: ask-on-risk
