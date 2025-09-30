import type { LogedUser } from "@repo/core/entities/user";
import type { Permission } from "@repo/core/value-objects/permission";

export function checkUserPermissions(
  user: LogedUser,
  requiredPermissions: Permission[]
) {
  if (user.isRoot) return true;

  const userPermissions = new Set(user.isEmployeeIn[0].permissions);

  return requiredPermissions.every((permission) =>
    userPermissions.has(permission)
  );
}
