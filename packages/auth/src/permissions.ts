import { z } from "zod";

export const actions = ["create", "read", "update", "delete"] as const;
export const actionsEs = ["crear", "leer", "actualizar", "borrar"] as const;

export const resources = ["team", "product", "ticket", "customer"] as const;
export const resourcesEs = ["equipo", "producto", "ticket", "cliente"] as const;

export type Actions = (typeof actions)[number];
export type ActionsEs = (typeof actionsEs)[number];

export type Resources = (typeof resources)[number];
export type ResourcesEs = (typeof resourcesEs)[number];

export type Permission = `${Actions}:${Resources}`;
export type PermissionEs = `${ActionsEs}:${ResourcesEs}`;

export const allPermissions = actions
  .map((action) => {
    return resources.map((resource) => `${action}:${resource}`);
  })
  .flatMap((a) => a) as Permission[];

export const allPermissionsEs = actionsEs
  .map((action) => {
    return resourcesEs.map((resource) => `${action}:${resource}`);
  })
  .flatMap((a) => a) as PermissionEs[];

export const permissionsSchema = z.array(z.enum(allPermissions)).min(1);
export type PermissionsSchema = z.infer<typeof permissionsSchema>;

export function hasAllPermissions(
  userPermissions: Permission[],
  permissionsToValidate: Permission[],
) {
  return permissionsToValidate.every((permission) =>
    userPermissions.includes(permission),
  );
}

export function hasSomePermissions(
  userPermissions: Permission[],
  permissionsToValidate: Permission[],
) {
  return permissionsToValidate.some((permission) =>
    userPermissions.includes(permission),
  );
}
