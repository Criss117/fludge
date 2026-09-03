export const PERMISSIONS = {
  organizations: ["update"],
  groups: ["create", "read", "update", "delete", "assign-member"],
  members: ["create", "read", "delete", "assign-group"],
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

export function permissionsToList(
  permissions: PermissionsRecord,
): Permission[] {
  return (Object.keys(permissions) as Resource[]).flatMap((resource) => {
    const actions = permissions[resource] ?? [];
    return actions.map((action) => `${resource}:${action}` as Permission);
  });
}

export function listToPermissions(list: Permission[]): PermissionsRecord {
  const result: PermissionsRecord = {};

  for (const permission of list) {
    const [resource, action] = permission.split(":") as [
      Resource,
      ActionFor<Resource>,
    ];

    if (!result[resource]) {
      result[resource] = [];
    }
    (result[resource] as ActionFor<typeof resource>[]).push(action);
  }

  return result;
}
