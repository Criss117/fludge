import type { LogedUser } from "@repo/core/entities/user";
import type { Permission } from "@repo/core/value-objects/permission";

export function checkUserPermissions(
  user: LogedUser,
  permission: Permission[]
) {
  if (user.isRoot) return true;

  const userPermissions = user.isEmployeeIn[0].permissions;

  return userPermissions.some((userPermission) =>
    permission.includes(userPermission)
  );
}
