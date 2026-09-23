# Migrate AssignGroupsToMember + RemoveGroupsFromMember (api-new, authContext)

Feature: Migrar la asignación/remoción de grupos a un member. Input común: `{ memberId, groupIds[] }` (`assignGroupsToMemberValidator`).

## Contexto

- Viejo: ambos validaban en el aggregate (grupo existe, member existe, member no owner, duplicados/existencia de groupMember); save/delete batch; errores `isr_on_assign_group` / `isr_on_unassign_group` (members).
- Nuevo: patrón authContext. Validaciones: grupos existen y pertenecen a la org (`GroupRepository.findByIds` NUEVO), member existe y no es owner (`findByIds`), insert/delete batch.
- `SQLiteGroupRepository.findByIds` usa `getColumns(group)` + reconstitute con `members: []` (no necesita members embebidos).

## Tasks

1. [x] `GroupRepository` + `SQLiteGroupRepository`: agregar `findByIds(groupIds: string[], organizationId: string): Promise<Result<Group[]>>` (where orgId + inArray id; reconstitute con members: [])
2. [x] `GroupMemberRepository` + `SQLiteGroupMemberRepository`: agregar `deleteByMemberAndGroupIds(organizationId: string, memberId: string, groupIds: string[], options?: Options)` (where orgId + memberId + inArray groupId)
3. [x] Crear `AssignGroupsToMemberCommand`: `execute(authContext, cmd)` — findByIds(grupos) → GroupNotFoundException si falta alguno; findByIds(member) → MemberNotFoundException, MemberIsOwnerException si owner; crear GroupMember[] (createdBy = authContext.member.id); `insert(groupMembers)` batch; InternalServerError `api_errors.iam.members.isr_on_assign_group`
4. [x] Crear `RemoveGroupsFromMemberCommand`: `execute(authContext, cmd)` — misma validación de grupos/member/owner; `deleteByMemberAndGroupIds`; InternalServerError `api_errors.iam.members.isr_on_unassign_group`
5. [x] Container: wirear `commands.member.assignGroups` y `commands.member.removeGroups`
6. [x] `member.router.ts`: agregar `assignGroups` (hasPermissionProcedure members:[assign_group], PUT /organizations/members/groups) y `removeGroups` (DELETE /organizations/members/groups), ambos pasando `authContext`
7. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en tocados)

## Decisiones

- Mismos validators viejos (assignGroupsToMemberValidator).
- El remove es idempotente (no valida que el groupMember exista).
- `add` del member.router no se migra (add-member no está migrado todavía).