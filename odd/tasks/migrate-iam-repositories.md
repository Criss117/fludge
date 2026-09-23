# Migrate IAM repositories to api-new

Feature: Completar la migración de los repositories de IAM desde `packages/api` (source of truth) hacia `packages/api-new` (target). Solo repositories — NO container, servicios, commands, queries ni routers.

## Contexto

- `api-new` ya tiene interfaces de dominio para `Group`, `Member`, `Organization` y las implementaciones `SQLiteGroupRepository` y `SQLiteOrganizationRepository`.
- Faltan: implementación de `MemberRepository`, e interfaz + implementación de `GroupMemberRepository`.
- Patrón nuevo (estilo `sqlite-group-repository.ts`): clases `implements`, constructor con `DatabaseService`, `tryCatch`/`err`/`ok` de `@fludge/utils/trycatch`, `.values` de la entidad como payload, `reconstitute` en lecturas, `onConflictDoNothing` en inserts, `eq` de drizzle-orm.
- La entidad nueva `Member`/`GroupMember` ya contiene `organizationId` (a diferencia de la vieja que lo recibía por parámetro).

## Tasks

1. [x] Crear interfaz de dominio `GroupMemberRepository` en `packages/api-new/src/core/iam/domain/repositories/group-member.repository.ts` (insert + delete, con `Options { tx? }`)
2. [x] Crear `SQLiteMemberRepository` en `packages/api-new/src/core/iam/infrastructure/repositories/sqlite-member-repository.ts` (findById / insert / update, según interfaz `MemberRepository` existente)
3. [x] Crear `SQLiteGroupMemberRepository` en `packages/api-new/src/core/iam/infrastructure/repositories/sqlite-group-member-repository.ts` (insert / delete, según nueva interfaz)
4. [x] Verificar typecheck de `packages/api-new`: `tsc -b`: falla con 12 errores PRE-EXISTENTES ajenos (10 en `src/routers/index.ts` importando routers viejos de @fludge/api que aún no existen; 2 en `@fludge/db/src/schema/index.ts` por schemas customer-payment faltantes). Ninguno de los 3 archivos nuevos aparece en errores — compilan limpio.

## Decisiones

- Nuevo nombre de archivo: estilo `sqlite-<name>-repository.ts` (como `sqlite-group-repository.ts`, el más reciente).
- La interfaz nueva de group-member usa estilo plano por entidad (no batch), siguiendo el patrón nuevo de `MemberRepository`/`GroupRepository`.
- `insert`/`delete` de group-member aceptan `Options { tx? }` porque las operaciones de asignación/remoción históricamente participan en transacciones (el nuevo `GroupRepository.insert` ya expone `Options`).
- NO tocar bugs preexistentes de los repos ya migrados (reportados aparte): `innerJoin` en `sqlite-group-repository.findById` y tautología `eq(organization.id, organization.id)` en `sqlite-organization.repository.update`.