import {
  Action,
  Permission,
  Resource,
} from "@repo/core/value-objects/permission";

const resourcesEs = new Map<Resource, string>([
  ["users", "Usuarios"],
  ["tickets", "Tickets"],
  ["products", "Productos"],
  ["clients", "Clientes"],
  ["businesses", "Negocios"],
  ["groups", "Grupos"],
]);

const actionsEs = new Map<Action, string>([
  ["create", "Crear"],
  ["read", "Leer"],
  ["update", "Actualizar"],
  ["delete", "Eliminar"],
]);

export function translatePermission(permission: Permission) {
  const [resource, action] = permission.split(":") as [Resource, Action];

  return {
    translate: `${actionsEs.get(action)} ${resourcesEs.get(resource)}`,
    resourceEs: resourcesEs.get(resource),
    actionEs: actionsEs.get(action),
    action,
    resource,
  };
}
