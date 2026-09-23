# Migrate AssignMembersToGroupCommand to api-new (authContext)

Feature: Migrar la asignación de members a un group. Recibe `groupId` + `memberIds[]`; valida que el grupo exista (org activa) y que los members existan.

## Contexto

- Viejo: `addGroupMember` del aggregate validaba grupo (GroupNotFoundException), member (MemberNotFoundException), owner (MemberIsOwnerException), duplicados (GroupMemberAlreadyExistsException); luego `groupMemberRepository.save` batch.
- Nuevo: sin aggregate. Queries: `groupRepository.findById(groupId)` (1) + `memberRepository.findByIds(memberIds, orgId)` NUEVO (1) — total 2.
- `GroupMemberRepository.insert` actual acepta UN entity → cambiar a `GroupMember | GroupMember[]` (batch, como el viejo save).
- `assignMembersToGroupValidator` = `{ groupId: uuid, memberIds: uuid[] min 1 }` (ya existe).
- `GroupMember.create` nuevo requiere `organizationId` además de groupId/memberId/createdBy (strings).

## Tasks

1. [x] `MemberRepository` + `SQLiteMemberRepository`: agregar `findByIds(memberIds: string[], organizationId: string): Promise<Result<Member[]>>` (where orgId + inArray id)
2. [x] `GroupMemberRepository` + `SQLiteGroupMemberRepository`: `insert` acepta `GroupMember | GroupMember[]` (batch con .values(map) + onConflictDoNothing)
3. [x] Crear `AssignMembersToGroupCommand`: `execute(authContext, cmd)` — findById(groupId) → GroupNotFoundException si no existe o no es de la org; findByIds(memberIds, orgId) → MemberNotFoundException si falta alguno; MemberIsOwnerException si alguno es owner; crear GroupMember[] con createdBy = authContext.member.id; `groupMemberRepository.insert(groupMembers)`; InternalServerError `isr_on_assign_member` si err
4. [x] Container: wirear `commands.group.assignMembers` (groupRepository, memberRepository, groupMemberRepository)
5. [x] Router group: agregar `assignMembers` (hasPermissionProcedure groups:[assign_member], PUT /organizations/groups/members, `assignMembers.execute(context.session.authContext, input)`)
6. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en tocados)

## Decisiones

- Duplicados de groupMember no se validan pre-insert: `onConflictDoNothing` los ignora (menos queries; diferencia vs viejo que lanzaba GroupMemberAlreadyExistsException).
- El command no devuelve entidad (undefined), como delete-groups.
- `MemberNotFoundException` si CUALQUIER memberId no existe (validación pedida explícitamente).