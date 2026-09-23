# Migrate CreateGroupCommand to api-new

Feature: Migrar la creación de grupo desde `packages/api` hacia `packages/api-new`, con service nuevo de validación de unicidad contra DB (el diseño plano ya no carga todos los grupos en la Organization).

## Contexto

- Viejo: validaba unicidad en memoria (`activeOrganization.groups.addGroup` → `GroupAlreadyExistsException(name_taken)`), porque el aggregate cargaba todos los grupos. `createdBy` salía de `activeOrganization.members.getMemberByUserId(loggedUserId)`.
- Nuevo: Organization es plana → validar contra DB con UNA query (uniqueIndex compuestos `(organizationId, name)` y `(organizationId, slug)`); el member del usuario logueado se resuelve con `findByUserId` (nuevo en MemberRepository).
- `createGroupValidator` ya existe en `@fludge/utils` (name, description, permissions). `GroupAlreadyExistsException` ya migrada.
- `Group.create` nuevo requiere `organizationId` además de `createdBy`.

## Tasks

1. [x] Crear `GroupUniquenessValidator` en `packages/api-new/src/core/iam/application/services/group-uniqueness-validator.service.ts`: `validateUniqueFields(organizationId, { name?, slug? }, excludeId?)` con UNA query (or + eq organizationId + ne excludeId), retorna `Result<{ nameTaken, slugTaken }>` — patrón del OrganizationUniquenessValidator
2. [x] Agregar `findByUserId(userId, organizationId): Promise<Result<Member | null>>` a la interfaz `MemberRepository` e implementarla en `SQLiteMemberRepository` (and de userId + organizationId)
3. [x] Crear `CreateGroupCommand` en `packages/api-new/src/core/iam/application/commands/create-group.command.ts`: resuelve loggedMember con `findByUserId`, crea Group con `Permissions.fromList(cmd.permissions)` y `organizationId: activeOrganization.id`, valida unicidad name/slug (lanzar `GroupAlreadyExistsException("api_errors.iam.groups.name_taken")` si tomados), `groupRepository.insert(newGroup)`, `InternalServerError` en errores, devuelve `newGroup.values`
4. [x] Actualizar `container.ts`: wirear `GroupUniquenessValidator` y `CreateGroupCommand` (validator, groupRepository, memberRepository) en `commands.group.create`
5. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en core/iam)

## Decisiones

- El command recibe `(loggedUserId, activeOrganization: Organization, cmd)` — consistente con el viejo y con UpdateOrganizationCommand (router futuro pasa `context.session.user.id` y `context.session.activeOrganization`).
- Si el member no existe: `MemberNotFoundException` (default key).
- Devuelve `newGroup.values` (el grupo creado), no el aggregate.
- Máximo 2 queries en el command: findByUserId + validateUniqueFields.