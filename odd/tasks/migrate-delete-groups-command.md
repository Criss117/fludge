# Migrate DeleteGroupsCommand to api-new (authContext)

Feature: Migrar `DeleteGroupsCommand` al patrón authContext. Borra groupMembers y groups en una transacción (cada repo su entidad; el group repo gana transacción vía TransactionalRepository como el viejo).

## Contexto

- Viejo: `execute(activeOrganization, cmd)` → `deleteGroup` del aggregate → `groupRepository.transaction(tx => { groupMemberRepository.delete + groupRepository.delete })` → `InternalServerError("api_errors.iam.groups.isr_on_delete")`.
- Nuevo: sin aggregate; el command recibe `authContext` y borra por `cmd.groupIds` con scoping por organización.
- `SQLiteGroupRepository` nuevo NO extiende TransactionalRepository (el viejo sí) → hay que agregarlo para que el command inicie la tx como en register.
- `SQLiteGroupMemberRepository` no existe en container aún → instanciarlo.
- `deleteGroupsValidator` = `{ groupIds: array(uuidSchema).min(1) }` (ya existe en utils).
- La tabla groupMember tiene FK onDelete cascade hacia group; el delete explícito de groupMembers es por control (fiel al viejo).

## Tasks

1. [x] Interfaz `GroupRepository` + `SQLiteGroupRepository`: agregar `delete(organizationId: string, groupIds: string[], options?: Options)` (where orgId + inArray ids); SQLiteGroupRepository extiende `TransactionalRepository` (super(db)) — además la INTERFAZ GroupRepository pasó a extender `TransactionalRepository` (como OrganizationRepository) para exponer `transaction()` al command
2. [x] Interfaz `GroupMemberRepository` + `SQLiteGroupMemberRepository`: agregar `deleteByGroupIds(organizationId: string, groupIds: string[], options?: Options)` (where orgId + inArray groupId)
3. [x] Crear `DeleteGroupsCommand`: `execute(authContext, cmd)` — `groupRepository.transaction(tx => { deleteByGroupIds + delete })`, errores crudos → throw en callback, `InternalServerError("api_errors.iam.groups.isr_on_delete")` si errTransaction; no devuelve nada
4. [x] Container: instanciar `groupMemberRepository` y `DeleteGroupsCommand`; `commands.group.delete`
5. [x] Router group: agregar `delete` (hasPermissionProcedure groups:[delete,read], DELETE /organizations/groups, `delete.execute(context.session.authContext, input)`)
6. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en tocados)

## Decisiones

- Delete por ids sin validar existencia (idempotente; scoping por org protege). El viejo lanzaba GroupNotFoundException si el group no existía en el aggregate — comportamiento nuevo: delete silencioso.
- El command no devuelve entidad (undefined), a diferencia del viejo que devolvía el aggregate.
- La tx la inicia el command vía `groupRepository.transaction()` (el repo de group vuelve a ser transaccional, como en el viejo).