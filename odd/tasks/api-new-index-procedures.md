# Complete api-new index procedures with UserAuthContext

Feature: Completar los middleware/procedures faltantes del index de `packages/api-new`, reemplazando el aggregate `Organization` por `UserAuthContext`.

## Contexto

- api-new tiene: `publicProcedure`, `protectedProcedure`, `rootOnlyProcedure`.
- Faltan (vs index viejo): `requireOrganizationProcedure`, `hasPermissionProcedure(permission)`, `devOnlyProcedure`.
- El viejo `requireOrganization` usaba `organizationRepository.findOneById` (aggregate completo), chequeaba member existente + activo, y ponía `activeOrganization` en la sesión.
- El nuevo usará `UserAuthContextService.build(userId, activeOrganizationId)` (ya creado, con validación de org) y pondrá `authContext` en la sesión.
- `UserAuthContextService` necesita `databaseService` + `memberRepository` → wirearlo en el container de IAM (services).

## Tasks

1. [x] Wirear `UserAuthContextService` en `packages/api-new/src/core/iam/container.ts` (services.userAuthContextService, con databaseService + memberRepository local)
2. [x] Completar `packages/api-new/src/index.ts`:
   - `requireOrganization`: requiere `activeOrganizationId`, `build()` el authContext (InternalServerError si err, Forbidden `not_member` si null, Forbidden `without_permissions` si member inactivo), pone `authContext` en la sesión
   - `hasPermission(required)`: concat sobre requireOrganization, usa `session.authContext.hasPermission(required)`, Forbidden si no
   - `devOnly`: requiere NODE_ENV development (env de @fludge/env/server)
   - Exportar `requireOrganizationProcedure`, `devOnlyProcedure`, `hasPermissionProcedure(permission)`
3. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en index/core)

## Decisiones

- Si `build()` retorna null (org inexistente o member inexistente) → `ForbiddenError("api_errors.iam.members.not_member")` (el service no distingue ambos casos; 404 de org filtraría existencia).
- El member inactivo se chequea en requireOrganization, igual que el viejo.
- El contexto de sesión gana `authContext: UserAuthContext` (en vez de `activeOrganization`).