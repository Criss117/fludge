# Migrate UpdateGroupCommand to api-new (authContext pattern)

Feature: Migrar `UpdateGroupCommand` con el patrón nuevo `authContext: UserAuthContext` (de ahora en más, los commands reciben authContext). El update de group NO modifica groupMember.

## Contexto

- El usuario cambió `CreateGroupCommand` a `execute(authContext, cmd)` (usa `authContext.member.id` y `authContext.organizationId`; sin memberRepository).
- Eso rompe: container (le pasa memberRepository) y group.router (le pasa user.id + orgId) → TS2554.
- Viejo `UpdateGroupCommand`: validaba unicidad en memoria (`groups.updateGroup` con groupNameIsAvailable), actualizaba la entidad y `save()`.
- Nuevo: `updateGroupValidator` (id + name/description/permissions/status opcionales) ya existe en utils. `GroupUniquenessValidator` ya tiene `excludeId`. `GroupNotFoundException` ya migrada.
- `SQLiteGroupRepository.update` ya strippea `members` (solo toca tabla group) — se hace explícito con comentario.

## Tasks

1. [x] Crear `UpdateGroupCommand` en `packages/api-new/src/core/iam/application/commands/update-group.command.ts`: `execute(authContext: UserAuthContext, cmd)` — `findById(cmd.id)` (InternalServerError si err, GroupNotFoundException si null o si `values.organizationId !== authContext.organizationId.toString()`), si `cmd.name` validar unicidad `{ name, slug }` con excludeId=cmd.id (GroupAlreadyExistsException name_taken), `group.update({ name, description, permissions: fromList, status })`, `groupRepository.update(group)`, InternalServerError isr_on_save, return `group.values`
2. [x] Modificar `sqlite-group-repository.ts` `update`: mantener solo update a tabla group (members NO se persiste; comentario explícito de que groupMember se maneja aparte)
3. [x] Actualizar `container.ts`: quitar `memberRepository` del `CreateGroupCommand`; wirear `UpdateGroupCommand` (groupUniquenessValidator, groupRepository) en `commands.group.update` — (el usuario ya había quitado memberRepository y actualizado create antes del writer)
4. [x] Actualizar `group.router.ts`: `create` pasa `context.session.authContext`; agregar `update` (hasPermissionProcedure groups:[update,read], PUT /organizations/groups, `update.execute(context.session.authContext, input)`) — (create ya usaba authContext antes del writer)
5. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en archivos tocados)

## Decisiones

- El command verifica que el group pertenezca a la org activa (seguridad; el viejo lo garantizaba por el aggregate).
- El update del repo NO toca groupMember (nunca lo hizo; se documenta).
- Los call sites del create-group se actualizan al patrón authContext (necesario para compilar).