# Migrate RemoveMembersFromGroupCommand to api-new (authContext)

Feature: Migrar la remoción de members de un group. Mismo input que assign: `{ groupId, memberIds[] }`.

## Contexto

- Viejo: `removeGroupMember` del aggregate validaba grupo (GroupNotFoundException), member (MemberNotFoundException), owner (MemberIsOwnerException), groupMember existente (GroupMemberNotFoundException); luego `groupMemberRepository.delete` batch. Error → `InternalServerError("api_errors.iam.groups.isr_on_unassign_member")`.
- Nuevo: mismo patrón de validación que assign (grupo + members + owner) con 2 queries; delete batch idempotente por ids (1 query) — NO se valida que el groupMember exista (diferencia vs viejo).
- `removeMembersFromGroupCommand` reusa `assignMembersToGroupValidator` (como el viejo).

## Tasks

1. [x] `GroupMemberRepository` + `SQLiteGroupMemberRepository`: agregar `deleteByGroupAndMemberIds(organizationId: string, groupId: string, memberIds: string[], options?: Options)` (where orgId + groupId + inArray memberId)
2. [x] Crear `RemoveMembersFromGroupCommand`: `execute(authContext, cmd)` — findById(groupId) → GroupNotFoundException si no existe o no es de la org; findByIds(memberIds, orgId) → MemberNotFoundException si falta alguno; MemberIsOwnerException si alguno es owner; `deleteByGroupAndMemberIds(orgId, groupId, memberIds)`; InternalServerError `isr_on_unassign_member` si err
3. [x] Container: wirear `commands.group.removeMembers` (groupRepository, memberRepository, groupMemberRepository)
4. [x] Router group: agregar `removeMembers` (hasPermissionProcedure groups:[assign_member], DELETE /organizations/groups/members, `removeMembers.execute(context.session.authContext, input)`)
5. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en tocados)

## Decisiones

- Delete idempotente (no valida existencia previa del groupMember) — menos queries.
- El command no devuelve entidad (undefined).