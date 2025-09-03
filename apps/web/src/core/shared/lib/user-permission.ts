import type { Permission } from "@repo/core/value-objects/permission";

export function userHasPermissions(
  userPermissions: Permission[],
  permission: Permission[]
) {
  return userPermissions.some((userPermission) =>
    permission.includes(userPermission)
  );
}
