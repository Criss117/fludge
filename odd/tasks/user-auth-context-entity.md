# UserAuthContext entity + service (api-new)

Feature: Entidad de autorización del usuario logueado, similar al `Organization` viejo pero acotada. SOLO entidad + service (NO repository, NO container).

## Contexto

- El `Organization` viejo tenía `memberHasPermission(memberId, required, mode)` y `getGroupsOfMember` (filtrando groupMembers). El nuevo diseño plano no carga el aggregate.
- Necesidad: entidad con `organizationId` (org activa), `member` (miembro loggeado), `groups` (grupos del miembro), y `hasPermission(required, mode)` — owner → true; sino, merge de permisos de grupos ACTIVOS + `checkPermissions`.
- `Role.isOwner()` y `Status.isActive()` ya existen en `@fludge/api/core/shared/value-objects`. `Permissions.merge` + `checkPermissions` en `@fludge/utils/permissions`.
- Se arma con un SERVICE (máx 3 queries): `memberRepository.findByUserId` (ya existe) + join `group`↔`groupMember` por memberId + organizationId.

## Tasks

1. [x] Crear entidad `UserAuthContext` en `packages/api-new/src/core/iam/domain/entities/user-auth-context.entity.ts`: `organizationId: UUID`, `member: Member`, `groups: Group[]`, getters + `hasPermission(required, mode = "all")`
2. [x] Crear `UserAuthContextService` en `packages/api-new/src/core/iam/application/services/user-auth-context.service.ts`: `build(loggedUserId, activeOrganizationId)` → `Result<UserAuthContext | null, Error>` — query 1: existe organización (select solo `id`); query 2: findByUserId; query 3: select `getColumns(group)` con innerJoin groupMember donde memberId + organizationId, reconstituir con `members: []`; null si la org no existe o el member no existe
3. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en core/iam)

## Decisiones

- Nombre: `UserAuthContext` (renombrable si el usuario prefiere otro).
- El service usa `DatabaseService` directo para el join (patrón de los UniquenessValidators) + `MemberRepository`.
- `Group.reconstitute` recibe `members: []` (no necesitamos los members embebidos para autorización).
- NO se toca el container (no pedido).
