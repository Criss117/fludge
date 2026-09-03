import { z } from "zod";
import {
  PERMISSIONS,
  type ActionFor,
  type Permission,
  type PermissionsRecord,
  type Resource,
} from "./data";

export class Permissions {
  private readonly permissions: Set<Permission>;

  private constructor(permissions: Permission[] = []) {
    this.permissions = new Set(permissions);
  }

  private static recordToList(permissions: PermissionsRecord): Permission[] {
    return (Object.keys(permissions) as Resource[]).flatMap((resource) => {
      const actions = permissions[resource] ?? [];
      return actions.map((action) => `${resource}:${action}` as Permission);
    });
  }

  private static normalize(list: Permission[]): Permission[] {
    const result = new Set(list);
    const actionsByResource = new Map<Resource, Set<string>>();

    for (const permission of result) {
      const [resource, action] = permission.split(":") as [Resource, string];
      if (!actionsByResource.has(resource)) {
        actionsByResource.set(resource, new Set());
      }
      actionsByResource.get(resource)!.add(action);
    }

    for (const [resource, actions] of actionsByResource) {
      const resourceHasReadAction = (
        PERMISSIONS[resource] as readonly string[]
      ).includes("read");

      if (resourceHasReadAction && !actions.has("read")) {
        result.add(`${resource}:read` as Permission);
      }
    }

    return [...result];
  }

  public static fromList(list: Permission[]): Permissions {
    return new Permissions(Permissions.normalize(list));
  }

  public static fromRecord(permissions: PermissionsRecord): Permissions {
    const list = Permissions.recordToList(permissions);
    return new Permissions(Permissions.normalize(list));
  }

  public toRecord(): PermissionsRecord {
    const result: PermissionsRecord = {};

    for (const permission of this.permissions) {
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

  public get values(): Permission[] {
    return [...this.permissions];
  }

  public static merge(permissionsList: Permissions[]): Permissions {
    const merged = new Set<Permission>();

    for (const permissions of permissionsList) {
      for (const permission of permissions.values) {
        merged.add(permission);
      }
    }

    return new Permissions([...merged]);
  }

  private static assertNonEmptyRequired(
    required: PermissionsRecord,
  ): Permission[] {
    const requiredList = Permissions.recordToList(required);

    if (requiredList.length === 0) {
      throw new Error(
        "Permissions: se llamó a hasAll/hasAny con un objeto de permisos requeridos vacío.",
      );
    }

    return requiredList;
  }

  public hasAll(required: PermissionsRecord): boolean {
    const requiredList = Permissions.assertNonEmptyRequired(required);
    return requiredList.every((permission) => this.permissions.has(permission));
  }

  public hasAny(required: PermissionsRecord): boolean {
    const requiredList = Permissions.assertNonEmptyRequired(required);
    return requiredList.some((permission) => this.permissions.has(permission));
  }

  public checkPermissions(
    required: PermissionsRecord,
    mode: "all" | "any" = "all",
  ): boolean {
    if (mode === "all") return this.hasAll(required);

    return this.hasAny(required);
  }
}

const allListPermissions = Permissions.fromRecord(PERMISSIONS).values;

export const permissionsValidator = z.array(z.enum(allListPermissions));
