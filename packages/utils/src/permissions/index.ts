import { PERMISSIONS, type Permission } from "./data";

function hasPermission(
  userPermissions: Permission[],
  required: Permission,
): boolean {
  return userPermissions.includes(required);
}

export function hasAllPermissions(
  userPermissions: Permission[],
  required: Permission | Permission[],
): boolean {
  if (!Array.isArray(required)) required = [required];

  return required.every((p) => hasPermission(userPermissions, p));
}

export function hasAnyPermission(
  userPermissions: Permission[],
  required: Permission | Permission[],
): boolean {
  if (!Array.isArray(required)) required = [required];

  return required.some((p) => hasPermission(userPermissions, p));
}

export function checkPermissions(
  userPermissions: Permission[],
  required: Permission | Permission[],
  mode: "all" | "any" = "all",
): boolean {
  return mode === "all"
    ? hasAllPermissions(userPermissions, required)
    : hasAnyPermission(userPermissions, required);
}

export const ALL_PERMISSIONS = Object.entries(PERMISSIONS).flatMap(
  ([resource, actions]) =>
    Object.values(actions).map((action) => `${resource}:${action}`),
) as [Permission, ...Permission[]];
