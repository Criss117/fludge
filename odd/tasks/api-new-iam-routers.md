# Create IAM routers in api-new (organization, group, member)

Feature: Crear los routers HTTP de IAM para los commands migrados, divididos en organization.router, group.router y member.router. El contexto usa `UserAuthContext` (authContext) en vez del aggregate.

## Contexto

- Commands migrados: register, update (organization), create (group). NO hay commands de member aún.
- El contexto de sesión ahora tiene `authContext: UserAuthContext` (con `organizationId: UUID`) — los commands que recibían la entidad `Organization` deben adaptarse:
  - `UpdateOrganizationCommand`: recibe `activeOrganizationId: string` y resuelve la org con `organizationRepository.findById` (OrganizationNotFoundException si null)
  - `CreateGroupCommand`: recibe `activeOrganizationId: string` (solo usaba el id) — `UUID.fromString(activeOrganizationId)` para Group.create
- Procedures nuevos en `@fludge/api/index`: `rootOnlyProcedure`, `hasPermissionProcedure`, `requireOrganizationProcedure`.

## Tasks

1. [x] Adaptar `UpdateOrganizationCommand.execute(activeOrganizationId: string, cmd)`: findById + OrganizationNotFoundException
2. [x] Adaptar `CreateGroupCommand.execute(loggedUserId: string, activeOrganizationId: string, cmd)`: usar id directo (import UUID)
3. [x] Crear `organization.router.ts`: register (rootOnlyProcedure, POST /organizations, user.id), update (hasPermissionProcedure organizations:update, PUT /organizations, authContext.organizationId)
4. [x] Crear `group.router.ts`: create (hasPermissionProcedure groups:[create,read], POST /organizations/groups, user.id + authContext.organizationId)
5. [x] Crear `member.router.ts`: vacío (sin commands migrados), `export const memberRouter = { commands: {} } as const;`
6. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en archivos nuevos)

## Decisiones

- Routers importan procedures de `@fludge/api/index` (patrón del auth.router) y commands de `@fludge/api/core/iam/...`.
- El update usa `hasPermissionProcedure({ organizations: ["update"] })` (como el viejo); register rootOnly; create groups create+read.
- NO se toca `routers/index.ts` (no pedido) — sigue con los imports viejos.
