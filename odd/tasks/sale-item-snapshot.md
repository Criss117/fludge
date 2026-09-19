# Feature: sale-item-snapshot

## Objective
Adapt the sales domain (entities, value objects, repository) and the `CreateSaleCommand` to the new `sale_item` schema: `productId` FK, `productSnapshot` JSON, and the `name` / `unitPrice` columns replacing `productPresentationName` / `productPresentationPrice`.

## Problem
`sale.schema.ts` was reworked to store an immutable product+presentation snapshot per sale item, but the API layer still spoke the old vocabulary: `SaleItem` held a `ProductPresentationSnapshot(id, name, price)`, `ProductPresentationSnapshot` could not represent product slug or presentation barcode/conversionFactor, the command mapped items to `productPresentationName/Price`, and `SaleItemRepository` still upserted the removed column. The entity's `values` no longer matched `SaleItemSelect`.

## Why
User request: "he modificado sale.schema.ts, quiero que modifiques las entidades correspondientes, y que arregles el CreateSaleCommand ... centrate solo en la parte de api, no toques ni cliente ni native."

## Scope
API-side only (plus one shared util required for correctness):
- `packages/api/src/modules/sales/domain/value-objects/sale-item-snapshot.ts` (new)
- `packages/api/src/modules/sales/domain/value-objects/product-presentation-snapshot.ts` (removed)
- `packages/api/src/modules/sales/domain/entities/sale-item.entity.ts`
- `packages/api/src/modules/sales/domain/entities/sale-item-collection.ts`
- `packages/api/src/modules/sales/infrastructure/repositories/sale-item.repository.ts`
- `packages/api/src/modules/sales/application/commands/create-sale.command.ts`
- `packages/db/src/utils/build-queries.ts` (root-cause read-path fix, see Decisions)

Out of scope (untouched by request): `packages/client`, `apps/native`.

## Constraints
- Do not touch client or native.
- The create-sale input contract (`name` XOR `presentationId`, `price`, `quantity`) is preserved; only the internal mapping and persistence change.
- Conventional commits; no AI attribution.

## Checklist
- [x] T1: New `SaleItemSnapshot` value object with `SaleItemSnapshotValue` (`product {id,name,slug}`, `presentation {id,name,barcode,conversionFactor}`); removed `ProductPresentationSnapshot`.
- [x] T2: `SaleItem` entity rebuilt around `productId`, `productPresentationId`, `productSnapshot`, `name`, `unitPrice`, `quantity`, `subtotal`; `create`/`reconstitute`/`values` aligned to `SaleItemSelect`; exposed `presentationId` accessor for the collection.
- [x] T3: `SaleItemCollection` dedup/total logic migrated to `item.presentationId`.
- [x] T4: `SaleItemRepository` upsert conflict columns updated to `name`, `unitPrice`, `quantity`, `subtotal`.
- [x] T5: `CreateSaleCommand` builds a `presentationId -> snapshot` map from the products returned by `SaleProductService`; catalog items freeze product+presentation snapshot (name = presentation name, unitPrice = client price); ad-hoc items persist `productId/productSnapshot = null`; removed the unused `itemsWithPresentationName` accumulator; missing snapshot throws `ProductPresentationNotFoundException`.
- [x] T6: `jsonObject` wraps JSON columns with `json(...)` so the raw-SQL aggregation read path returns an object instead of a JSON-encoded string.

## Verification evidence
- `bun run check-types` (packages/db, packages/api) -> clean
- `bun test` packages/api -> 3 pass / 0 fail
- Read-path proof (libsql in-memory, real `saleItem` schema): insert with `productSnapshot` object + `json_group_array(DISTINCT jsonObject(saleItem))` -> `typeof productSnapshot === "object"`, `name`/`unitPrice` present. Before the `jsonObject` fix the same probe returned `typeof productSnapshot === "string"`.

## Decisions
- Catalog `name` = presentation name (previous column was `product_presentation_name`; the client ticket model is per-presentation). Ad-hoc `name` = input name. CONFIRMED by user (2026-09-19): catalog items derive `name` from `snapshot.presentation.name`.
- The `createSaleItemValidator` union (name XOR presentationId) is the intended new contract. Consequence: the native screen `charge-sale.screen.tsx` must stop sending `name` for catalog items and must send no `presentationId` (undefined, not `""`) for ad-hoc items.
- `unitPrice` = the client-sent `price` for both branches (preserves price override / discounts).
- `jsonObject` fixed at the root rather than parsing strings in the entity: a JSON-mode column aggregated by raw SQL loses its JSON subtype, so `json(column)` is required. Only `saleItem.productSnapshot` is affected today (other `jsonObject` call sites have no JSON columns).
- The API value-object type duplicates the schema's local `SaleItemSnapshot` structurally; the entity's `values` return type (`Omit<SaleItemSelect, "saleId">`) makes any divergence a type error, so the duplication is typechecked, not silent.

## Delivery
- Strategy: TBD (not requested). Changes left uncommitted on `main` because the working tree already contained the user's in-progress schema/validator edits; committing would mix them.

## Progress / evidence
- All T1-T6 changes present in the working tree (see Scope). No commit yet.

## Next step
- Native / sync follow-up (NOT done, out of scope): `apps/native/.../native-sync-sale.repository.ts` still upserts `productPresentationName`/`productPresentationPrice`, which no longer exist on `localSaleItem`; it needs `productId`, `productSnapshot`, `name`, `unitPrice`. The native local DB also needs a drizzle migration for the new columns. `packages/sync/test/.../sync-server-sale.engine.test.ts` fixture is stale (not typechecked by `tsc -b`, still passes at runtime).
