import { z } from "zod";

export const actions = ["create", "read", "update", "delete"] as const;
export const resources = ["team", "product", "ticket", "customer"] as const;

export type Action = (typeof actions)[number];
export type Resource = (typeof resources)[number];
export type Permission = `${Action}:${Resource}`;

export const allPermissions = actions
  .map((action) => {
    return resources.map((resource) => `${action}:${resource}`);
  })
  .flatMap((a) => a) as Permission[];

export const permissionSchema = z.enum(allPermissions, {
  error: "Permisos inválidos",
});
export const permissionsSchema = z
  .array(z.enum(allPermissions))
  .min(1, "Debe seleccionar al menos un permiso.");
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

export const actionsEs = new Map<Action, string>([
  ["create", "Crear"],
  ["read", "Leer"],
  ["update", "Actualizar"],
  ["delete", "Eliminar"],
]);

export const resourcesEs = new Map<Resource, string>([
  ["team", "Equipo"],
  ["product", "Producto"],
  ["ticket", "Ticket"],
  ["customer", "Cliente"],
]);

export const groupedPermissions = allPermissions.reduce(
  (acc, permission) => {
    const [action, resource] = permission.split(":") as [Action, Resource];
    if (!acc[resource]) {
      acc[resource] = {
        es: resourcesEs.get(resource) || resource,
        en: resource,
        values: [],
      };
    }

    acc[resource].values.push({
      es: actionsEs.get(action) || action,
      en: permission,
    });
    return acc;
  },
  {} as Record<
    Resource,
    { es: string; en: Resource; values: { es: string; en: Permission }[] }
  >,
);
