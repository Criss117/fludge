# Repository Result<..., RepositoryError>

Cambiar todas las interfaces de repositories en `@fludge/client` (y las que implementan los nativos en `@fludge/sync`) para que retornen `Result<T, RepositoryError>`, y todas las implementaciones nativas en `apps/native` para envolver su trabajo con `tryCatch` y devolver errores tipados con `TranslationKey` y `cause`.

## Specs

- **S1.** Las interfaces de repositories en `@fludge/client` deben retornar `Result<T, RepositoryError>` en lugar de `Promise<T>`. Los métodos que antes retornaban `Promise<void>` deben retornar `Result<void, RepositoryError>`.
- **S2.** Las interfaces de repositories en `@fludge/sync` que tienen implementaciones nativas (`ClientSyncCatalogRepository`, `ClientSyncCommerceRepository`, `ClientSyncIamRepository`) deben retornar `Result<T, RepositoryError>`.
- **S3.** `RepositoryError` debe ser un `Error` cuyo `message` sea un `TranslationKey` y cuyo `cause` sea el error original convertido a `Error` si no lo era ya.
- **S4.** `RepositoryError` debe vivir en `@fludge/utils` para poder usarse desde `@fludge/client`, `@fludge/sync` y `apps/native` sin crear dependencias circulares.
- **S5.** Las implementaciones nativas deben usar `tryCatch` de `@fludge/utils/trycatch` con `parseError` que construya un `RepositoryError` usando como `TranslationKey` las keys existentes `api_errors.*.isr_on_*` (find/save/delete). Para operaciones sin key exacta (`clearAll`, sync, app) se usará la key más cercana del mismo dominio.
- **S6.** Los consumidores de repositories en `@fludge/client` (queries, mutations, hooks, sync) deben adaptarse para desestructurar el `Result` y propagar el error (por ejemplo con un helper `unwrapResult`).
- **S7.** `SessionRepository` de `@fludge/client/iam/domain/session.repository.ts` también debe retornar `Result<..., RepositoryError>`; su implementación en `apps/native` debe convertir las respuestas de `better-auth` al tipo `Result`.
- **S8.** Después de los cambios, `bun run check-types` debe pasar en `@fludge/utils`, `@fludge/client`, `@fludge/sync` y `apps/native` (o al menos en los paquetes afectados).
- **S9.** Las interfaces `HttpClientSyncCatalogRepository`, `HttpClientSyncCommerceRepository` y `HttpClientSyncIamRepository` en `@fludge/sync` también deben retornar `Result<T, RepositoryError>`, y sus implementaciones en los hooks de sync de `@fludge/client` deben convertir las llamadas orPC al mismo contrato.

## Tasks

| ID | Spec | Task | Route | Commit |
|----|------|------|-------|--------|
| T1 | S3-S4 | Crear `RepositoryError` y helper `toRepositoryError` en `@fludge/utils` | inline | `feat(utils): add RepositoryError with TranslationKey message and cause` |
| T2 | S1 | Actualizar interfaces de repositories de `@fludge/client` a `Result<T, RepositoryError>` | worker | `feat(client): return Result<..., RepositoryError> from repository interfaces` |
| T3 | S2,S7 | Actualizar interfaces de repositories de `@fludge/sync` y `SessionRepository` de `@fludge/client` | worker | `feat(sync,client): return Result<..., RepositoryError> from sync and session interfaces` |
| T4 | S5 | Adaptar implementaciones nativas de `apps/native/core` a `tryCatch` + `RepositoryError` | worker | `feat(native): wrap core repositories with tryCatch and RepositoryError` |
| T5 | S5 | Adaptar implementaciones nativas de sync en `apps/native/integrations/db/repositories` | worker | `feat(native): wrap sync repositories with tryCatch and RepositoryError` |
| T6 | S6 | Adaptar consumidores de repositories en `@fludge/client` (queries, mutations, hooks, sync) | worker | `refactor(client): unwrap Result in repository consumers` |
| T7 | S8 | Correr `check-types` y `lint` en paquetes afectados y corregir errores | inline | `chore: fix types and lint after Result migration` |
| T8 | S9 | Migrar `HttpClientSync*Repository` a `Result<T, RepositoryError>` (interfaces + implementaciones orPC + consumidores) | inline | `feat(sync,client): return Result from HTTP sync repositories` |

## Log

- **L1.** "quiero que client y native, modifiques las interfaces de los repositories para retornar un Result< y las implementaciones en native para use tryCatch, el Error que retornara un error en el que el message sera un TranslationKey y el cause sera el cause del error original"
- **L2.** Decisión: usar las keys existentes `api_errors.*.isr_on_*` como TranslationKey de los errores de repository.
- **L3.** Decisión: adaptar también todos los consumidores de repositories en `@fludge/client` para que el proyecto compile.
- **L4.** Corrección de alcance: migrar también `HttpClientSyncCatalogRepository`, `HttpClientSyncCommerceRepository` y `HttpClientSyncIamRepository` a `Result<T, RepositoryError>`.
- **L5.** Cierre T8: `HttpClientSyncCatalogRepository` ya retornaba `Result`; se le agregó `parseError` con key `api_errors.catalog.products.isr_on_find`. `HttpClientSyncCommerceRepository` e `HttpClientSyncIamRepository` se migraron a `Result<..., RepositoryError>` con `parseError` usando `api_errors.sales.isr_on_find` y `api_errors.iam.organizations.isr_on_find` respectivamente.
