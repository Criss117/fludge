# Migrate RegisterOrganizationCommand to api-new

Feature: Migrar el `RegisterOrganizationCommand` (y sus dependencias) desde `packages/api` hacia `packages/api-new`, adaptado al diseño nuevo plano (Organization sin agregación).

## Contexto

- Viejo: `Organization.create` creaba aggregate con owner member + groups; `organizationRepository.save(organization)` persistía todo en una transacción.
- Nuevo: `Organization` es plana; `Member` y `Group` se crean por separado. `Group` conserva agregación de members (vacía al crear).
- `OrganizationRepository` ya extiende `TransactionalRepository` (interfaz), pero `SQLiteOrganizationRepository` NO extiende la clase ni hace transacciones.
- `MemberRepository.insert` NO acepta `{tx}` — hay que agregarlo para participar en la transacción.
- `GroupRepository.insert` ya acepta `options?: Options` ({tx}).
- No existe uniqueness validator en api-new — hay que migrarlo.

## Tasks

1. [x] Migrar las 11 exceptions de `iam/organization/domain/exceptions/` a `packages/api-new/src/core/iam/domain/exceptions/` — copiar contenido, cambiar import de base-exception a `@core/shared/exceptions/base-exception`; en `organization-not-found` cambiar import de getI18nKey a `@fludge/utils/validators/shared`. Corregir typos de nombre de archivo: `member-not-found.exeption.ts` → `member-not-found.exception.ts`, `group-member-elready-exists.exception.ts` → `group-member-already-exists.exception.ts`.
2. [x] Migrar `OrganizationUniquenessValidator` a `packages/api-new/src/core/iam/application/services/organization-uniqueness-validator.service.ts` (copia directa, sin imports de @fludge/api).
3. [x] Modificar `MemberRepository` (interfaz): añadir `Options { tx? }` exportada y `options?: Options` en `insert`. Modificar `SQLiteMemberRepository.insert` para usar `options?.tx ?? this.db`.
4. [x] Modificar `OrganizationRepository` (interfaz): añadir `Options { tx? }`, `options?: Options` en `insert`, y método `save(values: SaveOrganizationValues)` con tipo `SaveOrganizationValues = { organization: Organization; members: Member[]; groups: Group[] }`.
5. [x] Modificar `SQLiteOrganizationRepository`: extender clase `TransactionalRepository`, inyectar `memberRepository` y `groupRepository` (con `super(db)`), `insert` con tx, y `save` transaccional que inserta organization + members + groups (throw dentro del callback de `this.transaction` para rollback).
6. [x] Migrar `RegisterOrganizationCommand` a `packages/api-new/src/core/iam/application/commands/register-organization.command.ts` (nombre corregido, sin typo "commad"): crea Organization, Member owner y Group "Administradores", valida unicidad, guarda con `save({ organization, members, groups })` en transacción, devuelve `organization.values`.
7. [x] Verificar typecheck de `packages/api-new` (`tsc -b`): sin errores nuevos en archivos tocados (los 12 errores pre-existentes de routers/db siguen igual — spot check del orquestador confirmó 12 líneas, cero en core/iam/**).
8. [x] REFACTOR (decisión del usuario): eliminar `save` de `SQLiteOrganizationRepository` y de la interfaz `OrganizationRepository` (junto con `SaveOrganizationValues`); cada repo vuelve a manejar SOLO su entidad (constructor de org repo vuelve a solo `db`, mantiene `extends TransactionalRepository`); el `RegisterOrganizationCommand` inicia la transacción con `this.organizationRepository.transaction(async (tx) => { 3 inserts con { tx } })`, inyectando además `memberRepository` y `groupRepository`.

## Decisiones

- El command recibe `rootUserId` y el payload validado, igual que el viejo.
- Owner member: `Member.create({ userId, organizationId: organization.id, role: "owner", assignedBy: null })`.
- Grupo inicial: `Group.create({ name: "Administradores", description: "Grupo de administradores", permissions: Permissions.fromRecord(PERMISSIONS), createdBy: ownerMember.id, organizationId: organization.id })`.
- La transacción la inicia el COMMAND vía `organizationRepository.transaction()` (interfaz ya extiende `TransactionalRepository`); cada repo inserta solo su entidad con `{ tx }`. NO hay `save` agregado en el repo de org.
- NO se tocan container ni routers (no pedidos en este paso).
- i18n keys y comportamiento de exceptions idénticos al viejo.