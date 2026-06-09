# Delta for Group Overview Section

## ADDED Requirements

### Requirement: Display Group Metadata Summary

The system SHALL display the group's name, description, creation date, and last update date in a summary card layout.

#### Scenario: Display all metadata fields

- GIVEN a group with name, description, createdAt, and updatedAt
- WHEN the overview section renders
- THEN the name, description, creation date (formatted "dd MMM yyyy"), and relative last update are visible

#### Scenario: Handle missing description

- GIVEN a group with no description (null or empty string)
- WHEN the overview section renders
- THEN a placeholder "-" is displayed for the description field

### Requirement: Display Member Count

The system SHALL display the total number of members in the group using a summary card.

#### Scenario: Display member count

- GIVEN a group with N members in its members collection
- WHEN the overview section renders
- THEN a card shows "Miembros Totales" with the value N

#### Scenario: Display zero members

- GIVEN a group with an empty members collection
- WHEN the overview section renders
- THEN a card shows "Miembros Totales" with the value 0

### Requirement: Display Permission Count

The system SHALL display the total number of permissions assigned to the group using a summary card.

#### Scenario: Display permission count

- GIVEN a group with N permissions in its permissions array
- WHEN the overview section renders
- THEN a card shows "Permisos Asignados" with the value N

#### Scenario: Display zero permissions

- GIVEN a group with an empty permissions array
- WHEN the overview section renders
- THEN a card shows "Permisos Asignados" with the value 0

### Requirement: Locale and Date Formatting

The system SHALL format all dates using the Spanish (`es`) locale from `date-fns`.

#### Scenario: Format creation date

- GIVEN a group.createdAt timestamp
- WHEN displayed in the overview
- THEN it uses `format(date, "dd MMM yyyy", { locale: es })`

#### Scenario: Format relative update time

- GIVEN a group.updatedAt timestamp
- WHEN displayed in the overview
- THEN it uses `formatDistance(date, new Date(), { locale: es })`

---

# Delta for Group Members Section

## ADDED Requirements

### Requirement: Display Members Table

The system SHALL render a table listing all group members with their name, email, and assignment source.

#### Scenario: Display all members

- GIVEN a group with N members in its members collection
- WHEN the members section renders
- THEN a table with N rows is displayed, one per member

#### Scenario: Table columns

- GIVEN the members table renders
- WHEN viewing the table headers
- THEN columns "Nombre", "Email" are visible

### Requirement: Handle Empty Members State

The system SHALL display a meaningful empty state when the group has no members.

#### Scenario: Empty members list

- GIVEN a group with zero members
- WHEN the members section renders
- THEN a message "Este grupo no tiene miembros asignados" is displayed
- AND no table is rendered

### Requirement: Member Data Rendering

The system SHALL display each member's name and email from the joined member data.

#### Scenario: Render member name and email

- GIVEN a member with name "Juan Pérez" and email "juan@example.com"
- WHEN the members table renders
- THEN a row shows "Juan Pérez" in the name column and "juan@example.com" in the email column

---

# Delta for Group Permissions Section

## ADDED Requirements

### Requirement: Display Permissions Grouped by Resource

The system SHALL render permissions grouped by resource using an Accordion component, with one panel per resource.

#### Scenario: Group permissions by resource

- GIVEN a group with permissions ["groups:view", "groups:create", "members:view"]
- WHEN the permissions section renders
- THEN an Accordion with panels "Grupos" and "Miembros" is displayed
- AND "Grupos" panel contains "Ver grupos" and "Crear grupos"
- AND "Miembros" panel contains "Ver miembros"

#### Scenario: Display permission title and description

- GIVEN a permission "groups:view"
- WHEN its entry renders in the accordion
- THEN the title "Ver grupos" and its description are visible

### Requirement: Handle Empty Permissions State

The system SHALL display a meaningful empty state when the group has no permissions.

#### Scenario: Empty permissions list

- GIVEN a group with an empty permissions array
- WHEN the permissions section renders
- THEN a message "Este grupo no tiene permisos asignados" is displayed
- AND no accordion is rendered

### Requirement: Use Permission Utilities for Display

The system SHALL use `getPermissionDescription()` to resolve each permission's title and description.

#### Scenario: Resolve permission description

- GIVEN a permission string "groups:delete"
- WHEN rendering that permission
- THEN `getPermissionDescription("groups:delete")` returns title "Eliminar grupos" with its description

#### Scenario: Handle unknown permission format

- GIVEN a permission string not matching known format
- WHEN rendering that permission
- THEN a fallback title is displayed without crashing

### Requirement: Resource Labels

The system SHALL use `RESOURCE_DESCRIPTIONS` for accordion panel labels.

#### Scenario: Display resource label

- GIVEN permissions for the "groups" resource
- WHEN the accordion panel renders
- THEN the panel label is "Grupos" (from RESOURCE_DESCRIPTIONS.groups)
