# Migrate IAM container to api-new

Feature: Llenar el container de IAM en `packages/api-new` (actualmente vacío) wireando SOLO lo que ya está migrado.

## Contexto

- Migrados hasta hoy: 4 repos (SQLiteOrganization, SQLiteGroup, SQLiteMember, SQLiteGroupMember), 1 service (OrganizationUniquenessValidator), 2 commands (Register, Update).
- NO migrados todavía: queries (findAllOrganizations, findAllMembers), commands de group/member, EnsureOrganizationExistsService → NO se wirean.
- Patrón: `authContainer` en api-new (export `as const`); `databaseService` de `@fludge/db`.
- `RegisterOrganizationCommand` constructor: (validator, orgRepo, memberRepo, groupRepo). `UpdateOrganizationCommand`: (validator, orgRepo).

## Tasks

1. [x] Crear wiring en `packages/api-new/src/core/iam/container.ts`: instanciar repos, validator y commands; exportar `organizationContainer` con repositories/services/commands (register, update) — solo lo migrado, sin dead code (groupMemberRepository no se instancia hasta que haya un command que lo use)
2. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos (12 pre-existentes, cero en core/iam)

## Decisiones

- Mismo nombre de export que el viejo: `organizationContainer`.
- No se crean queries ni commands inexistentes.