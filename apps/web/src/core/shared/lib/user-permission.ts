import type { Permission } from "@repo/core/value-objects/permission";

export function checkUserPermissions(
  userPermissions: Permission[],
  permission: Permission[]
) {
  return userPermissions.some((userPermission) =>
    permission.includes(userPermission)
  );
}
