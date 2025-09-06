import {
  Action,
  Permission,
  Resource,
} from "@repo/core/value-objects/permission";

const descriptions = new Map<Action, string>([
  ["create", "permite crear un recurso"],
  ["read", "permite leer un recurso"],
  ["update", "permite actualizar un recurso"],
  ["delete", "permite eliminar un recurso"],
]);

export function getPermissionDescription(permission: Permission) {
  const [resource, action] = permission.split(":") as [Resource, Action];

  return {
    resource,
    action,
    description: descriptions.get(action),
  };
}
