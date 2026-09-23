# Migrate SignUpMemberCommand to api-new (authContext)

Feature: Migrar el sign-up de member en el módulo auth (está comentado en auth.container y auth.router de api-new).

## Contexto

- Viejo: `execute(headers, loggedUserId, activeOrganization, cmd)` — `authService.api.signUpEmail({ body: { email, password, isRoot: false, phone, name }, headers })` → `addMemberCommand.execute(loggedUserId, activeOrganization, { userId: newUser.user.id })`.
- Nuevo: `execute(headers, authContext, cmd)` — delega en `organizationContainer.commands.member.add` (AddMemberCommand ya migrado con authContext).
- `signUpValidator` = `{ name, email, password, phone }` (ya existe en utils).
- auth.container y auth.router de api-new tienen el command/route comentados → descomentar adaptando a authContext.

## Tasks

1. [x] Crear `SignUpMemberCommand` en `packages/api-new/src/core/auth/application/commands/sign-up-member.command.ts`: `execute(headers, authContext, cmd)` — signUpEmail (isRoot: false), InternalServerError `api_errors.auth.users.isr_on_find` si err (key del viejo), delega en `addMemberCommand.execute(authContext, { userId: newUser.user.id })`
2. [x] `auth.container.ts`: descomentar/wirear `signUpMemberCommand` con `(auth, organizationContainer.commands.member.add)`; export `commands.signUpMember`
3. [x] `auth.router.ts`: descomentar/wirear `signUpMember` (hasPermissionProcedure members:[create], POST /auth/sign-up-member, `execute(context.headers, context.session.authContext, input)`) — importar `hasPermissionProcedure`
4. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en auth/iam)

## Decisiones

- El command recibe `authContext` del contexto (como los demás commands IAM).
- Se mantiene la key i18n del viejo (`isr_on_find`) aunque sea poco semántica para signup.