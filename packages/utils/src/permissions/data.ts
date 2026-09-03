export const PERMISSIONS = {
  organizations: ["update"],
  groups: ["create", "read", "update", "delete", "assign_member"],
  members: ["create", "read", "delete", "assign_group"],
  categories: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
} as const;

export type PermissionsMap = typeof PERMISSIONS;
export type Resource = keyof PermissionsMap;
export type ActionFor<R extends Resource> = PermissionsMap[R][number];

export type Permission = {
  [R in Resource]: `${R}:${ActionFor<R>}`;
}[Resource];

export type PermissionsRecord = {
  [R in Resource]?: readonly ActionFor<R>[];
};

export function getPermissionsByResource(resource: Resource) {
  const actions = PERMISSIONS[resource];

  return actions.map((action) => `${resource}:${action}`) as Permission[];
}
