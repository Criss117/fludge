import { z } from "zod";

// 1. Fuente única de verdad
export const allPermissions = {
  groups: ["create", "read", "update", "delete"],
  organizations: ["update"],
  members: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
  categories: ["create", "read", "update", "delete"],
  sales: ["create", "read", "update", "delete"],
} as const;

// 2. Tipo TS derivado dinámicamente de allPermissions
export type AppStatement = {
  [K in keyof typeof allPermissions]?: readonly (typeof allPermissions)[K][number][];
};

// 3. Generación DINÁMICA del esquema Zod
const buildSchema = () => {
  const shape = Object.entries(allPermissions).reduce(
    (acc, [resource, actions]) => {
      const [firstAction, ...restActions] = actions;
      // z.enum requiere al menos un elemento ([string, ...string[]])
      acc[resource as keyof typeof allPermissions] = z
        .array(z.enum([firstAction, ...restActions]))
        .optional();
      return acc;
    },
    {} as Record<keyof typeof allPermissions, z.ZodTypeAny>,
  );

  return z.object(shape).strict();
};

export const appStatementSchema = buildSchema() as z.ZodType<AppStatement>;

export class Permissions {
  private constructor(private readonly _statements: AppStatement) {
    Object.values(this._statements).forEach((actions) => {
      if (actions) Object.freeze(actions);
    });
    Object.freeze(this._statements);
    Object.freeze(this);
  }

  /**
   * Factoría fuertemente tipada. Te dará autocompletado y validación en tiempo de compilación.
   */
  public static create(statements: AppStatement): Permissions {
    const validated = appStatementSchema.parse(statements);
    return new Permissions(validated);
  }

  /**
   * Para payloads externos o datos sin tipar (ej. req.body de Express/Fastify).
   */
  public static fromUntyped(raw: unknown): Permissions {
    const validated = appStatementSchema.parse(raw);
    return new Permissions(validated);
  }

  public static fromJSON(jsonString: string): Permissions {
    const parsed = JSON.parse(jsonString);
    return Permissions.fromUntyped(parsed);
  }

  public static empty(): Permissions {
    return new Permissions({});
  }

  public has<K extends keyof typeof allPermissions>(
    resource: K,
    action: (typeof allPermissions)[K][number],
  ): boolean {
    const actions = this._statements[resource];
    if (!actions) return false;
    return (actions as readonly string[]).includes(action);
  }

  public get value(): AppStatement {
    return this._statements;
  }

  public toJSON(): AppStatement {
    return this._statements;
  }

  public equals(other: Permissions): boolean {
    if (!(other instanceof Permissions)) return false;
    return (
      JSON.stringify(this._statements) === JSON.stringify(other._statements)
    );
  }
}
