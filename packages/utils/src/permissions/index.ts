import { z } from "zod";
import {
  type AppStatement,
  type PermissionEnum,
  type RESOURCES,
  ALL_PERMISSIONS,
  PERMISSION_DESCRIPTIONS_ES,
  PERMISSIONS,
} from "./data";
export { appStatementSchema } from "./data";

export const permissionsSchema = z.enum(ALL_PERMISSIONS).array().min(1, {
  error: "Debe tener al menos una autorización",
});

type StatementEntry = [RESOURCES, NonNullable<AppStatement[RESOURCES]>];

export function permissionsFromObject(
  obj: AppStatement,
): [PermissionEnum, ...PermissionEnum[]] {
  const result = (Object.entries(obj) as [RESOURCES, AppStatement[RESOURCES]][])
    .filter(
      (entry): entry is StatementEntry =>
        entry[1] !== undefined && entry[1].length > 0,
    )
    .flatMap(([resource, actions]) =>
      actions.map((action) => `${resource}:${action}` as PermissionEnum),
    );

  if (result.length === 0) {
    throw new Error("permissionsFromObject: no hay permisos seleccionados");
  }

  return result as [PermissionEnum, ...PermissionEnum[]];
}

export function getPermissionDescription(permission: PermissionEnum) {
  const [resourse, action] = permission.split(":") as [RESOURCES, string];

  const { es, ...restDescriptions } = PERMISSION_DESCRIPTIONS_ES[resourse];

  const desc = restDescriptions[action as keyof typeof restDescriptions] as {
    es: string;
    title: string;
    description: string;
  };

  if (!desc)
    return {
      es,
      description: {
        es: "N/A",
        title: action,
        description: "N/A",
      },
    };

  return { es: es, description: desc };
}

export function getPermissionByResource(resource: RESOURCES) {
  const actions = PERMISSIONS[resource];

  return Object.values(actions).map(
    (action) => `${resource}:${action}`,
  ) as PermissionEnum[];
}

export class Permissions {
  private constructor(private readonly _statements: PermissionEnum[]) {}

  public static create(statements: PermissionEnum[]): Permissions {
    const resources = statements.reduce((acc, p) => {
      const [resource] = p.split(":") as [RESOURCES, string];

      if (!acc.includes(resource)) acc.push(resource);

      return acc;
    }, [] as RESOURCES[]);

    const complete = [...statements];

    for (const resource of resources) {
      if (resource === "organizations") continue;

      complete.push(`${resource}:read`);
    }

    return new Permissions(Array.from(new Set(complete)));
  }

  public static reconstitute(values: PermissionEnum[]) {
    return new Permissions(values);
  }

  public static merge(permissionsList: Permissions[]) {
    const merged = permissionsList.reduce<PermissionEnum[]>(
      (acc, perm) => [...new Set([...acc, ...perm.values])],
      [],
    );

    return new Permissions(merged);
  }

  public static fromJSON(jsonString: string) {
    const parsed = permissionsSchema.parse(JSON.parse(jsonString));

    return new Permissions(parsed);
  }

  public hasPermission(required: PermissionEnum) {
    return this._statements.includes(required);
  }

  public hasAllPermissions(required: PermissionEnum | PermissionEnum[]) {
    if (!Array.isArray(required)) required = [required];

    return required.every((p) => this.hasPermission(p));
  }

  public hasAnyPermission(
    required: PermissionEnum | PermissionEnum[],
  ): boolean {
    if (!Array.isArray(required)) required = [required];

    return required.some((p) => this.hasPermission(p));
  }

  public checkPermissions(
    required: PermissionEnum | PermissionEnum[],
    mode: "all" | "any" = "all",
  ): boolean {
    return mode === "all"
      ? this.hasAllPermissions(required)
      : this.hasAnyPermission(required);
  }

  public toJSON() {
    return JSON.stringify(this._statements);
  }

  public get values() {
    return this._statements;
  }
}
