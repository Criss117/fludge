# Migrate UpdateOrganizationCommand to api-new

Feature: Migrar el `UpdateOrganizationCommand` desde `packages/api` hacia `packages/api-new`. El update SOLO toca la entidad `Organization` (sin members/groups).

## Contexto

- Viejo: `execute(activeOrganization, cmd)` recibe la Organization activa del contexto; valida unicidad de name/slug con `excludeId`; `activeOrganization.update(cmd)`; persiste con `saveOnlyOrganization`.
- Nuevo: el repo de org ya tiene `update(org)` (con `org.values.id`, bug corregido). El validator de unicidad ya está migrado. El entity nuevo de Organization NO tiene método `update()` — hay que agregarlo.
- `updateOrganizationValidator` ya existe en `@fludge/utils/validators/organization.validators` (name/phone/address opcionales).
- El nuevo entity ignora logo/metadata (no existen en el entity ni en la tabla) — el `update()` nuevo no los toca, consistente con `create`.

## Tasks

1. [x] Agregar método `update(values: UpdateOrganization)` al entity `Organization` en `packages/api-new/src/core/iam/domain/entities/organization.entity.ts` (name→slug regenerado, legalName, address, phone con truthy checks + `touch()`; `UpdateOrganization` type ya existe en el archivo) — además hubo que agregar `touch()` que no existía en el entity nuevo
2. [x] Crear `UpdateOrganizationCommand` en `packages/api-new/src/core/iam/application/commands/update-organization.command.ts`: valida unicidad `{ name, slug }` con excludeId = `activeOrganization.id.toString()`, lanza `OrganizationAlreadyExistsException` si name/slug tomados, `activeOrganization.update(cmd)`, persiste con `organizationRepository.update(activeOrganization)`, `InternalServerError` en errores de find/save, devuelve `activeOrganization.values`
3. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos en archivos tocados (12 errores pre-existentes, cero en core/iam)

## Decisiones

- El command recibe la entidad `Organization` activa (no un id), igual que el viejo (el router le pasa `context.session.activeOrganization`).
- Se usan los mismos i18n keys: `api_errors.iam.organizations.isr_on_find`, `name_taken`, `isr_on_save`.
- NO se tocan container ni routers (no pedidos).
- Solo se modifica la entidad Organization y se crea el command — ningún repo/validator se toca (ya migrados).