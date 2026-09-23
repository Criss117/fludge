# Migrate AddMemberCommand to api-new (authContext)

Feature: Migrar el alta de member. Input: `{ userId }` (`addMemberValidator`). Crea el member con rol "member", `assignedBy` = authContext.member.id.

## Contexto

- Viejo: `Member.create({ userId, role: "member", assignedBy: loggedMember.id })`; `addMember` del collection validaba duplicado (MemberAlreadyExistsException); `memberRepository.save`.
- Nuevo: `execute(authContext, cmd)`; validar que el user no sea ya member de la org con `findByUserId` (1 query) → MemberAlreadyExistsException; `memberRepository.insert` (ya existe).
- `Member.create` nuevo requiere `organizationId: UUID`.
- `addMemberValidator` en `@fludge/utils/validators/organization.validators`.

## Tasks

1. [x] Crear `AddMemberCommand`: `execute(authContext, cmd)` — `findByUserId(cmd.userId, orgId)` → InternalServerError isr_on_find si err, MemberAlreadyExistsException si ya existe; `Member.create({ userId: UUID.fromString(cmd.userId), role: "member", assignedBy: authContext.member.id, organizationId: authContext.organizationId })`; `memberRepository.insert(newMember)`; InternalServerError `isr_on_save` si err; return `newMember.values`
2. [x] Container: wirear `commands.member.add` (memberRepository)
3. [x] `member.router.ts`: agregar `add` (hasPermissionProcedure members:[create,read], POST /organizations/members, `add.execute(context.session.authContext, input)`)
4. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en tocados)

## Decisiones

- Validación explícita de duplicado pre-insert (fiel al viejo; el onConflictDoNothing del insert queda como respaldo).
- Devuelve `newMember.values` (consistente con los otros commands).