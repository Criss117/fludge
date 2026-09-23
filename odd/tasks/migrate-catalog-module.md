# Migrate catalog module to api-new (authContext)

Feature: Migrar el módulo catalog (categories + products) de packages/api a packages/api-new, SIN las queries. Entidades NO cambian; commands se adaptan a authContext; se corrigen fallos detectados en el código viejo.

## Fallos detectados a corregir (repos/commands, NO entidades)

Categories:
- repo save usaba upsert con target id (no cubre unique name/slug) → separar en insert/update con where org+id
- `ensure-category-exists` comparaba length (falla con ids duplicados) → comparar por Set
- create usaba `getMemberByUserId()!` → ahora authContext.member.id (sin non-null)

Products:
- findOneById/findManyByIds usaban innerJoin (producto sin presentations no hidratable) → leftJoin + quitar FILTER/DISTINCT tautológicos
- update-product NUNCA borraba presentations removidas (huérfanas en DB) → corregir en el command con deletePresentations + deleteMany
- `ensure-presentations-exists` match parcial silencioso → comparar por Set y devolver error si falta alguna
- Repos de product separan save (tx agregada) → la tx la inicia el COMMAND (patrón api-new)

## Fases

### Fase 1 — categories (core/catalog/categories/) ✅
1. [x] Copiar entity (imports @core), 2 exceptions (imports @core), value objects si aplica
2. [x] Repo interfaz + SQLite: findById(org,id) / insert / update
3. [x] Services: category-uniqueness-validator (copia), ensure-category-exists (fix Set)
4. [x] Commands: create/update/toggle-status con authContext
5. [x] Container + router (authContext)

### Fase 2 — products (core/catalog/products/) ✅
6. [x] Copiar entities (product, product-presentation, collection), VOs (status, stock), 11 exceptions (imports @core, typo bresentation corregido en nombre de archivo)
7. [x] Repos: product (findById/findManyByIds con leftJoin, insert/update), product-presentation (save/deleteMany), product transaccional
8. [x] Services: product-uniqueness-validator, ensure-presentations-exists (fix Set + typo), sale-product (orgId string + fix match parcial)
9. [x] Commands: create-product, update-product con authContext (+ fix presentations removidas con deleteMany)
10. [x] Container (usa ensureCategoryExistsService de categories) + router (authContext)
11. [x] Verificar typecheck api-new — 12 errores pre-existentes, cero en core/catalog

### Fase 3 — Fix de bugs de entidades (products) ✅
12. [x] `Product.update`: condición falsy (stock/minStock/allowNegativeStock con 0 o false no actualizaban) → `!== undefined` por campo
13. [x] `Product.update`: searchBlob regenerado solo con name (perdía barcodes) → `buildSearchBlob()`
14. [x] Duplicados de name/conversionFactor intra-producto pasaban el dominio (500 en DB) → `checkUniques` con conversionFactor + collection.create/update con validación
15. [x] `ProductPresentation.update`: falsy checks con 0 (conversionFactor/pricePurchase/priceSale) → `!== undefined`
16. [x] `Product.sale`/`refund`: cantidades negativas por item pasaban (total sumado) → validar por item con InvalidAmountException (se agregó el import)

## Decisiones
- Entidades copiadas TAL CUAL (el usuario pidió no cambiar estructura/entidades); bugs de entidades (update falsy, searchBlob solo-name) se anotan pero no se tocan.
- Routers: categoryRouter (create/update/toggleStatus), productsRouter (create/update) — sin queries.
- La tx de products la inicia el command (patrón register/delete-groups).