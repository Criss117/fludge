import { z } from "zod";
import { allPermissions, type AppStatement } from "./data";

// 3. Generación DINÁMICA del esquema Zod
const buildSchema = () => {
  const shape = Object.entries(allPermissions).reduce(
    (acc, [resource, actions]) => {
      const [firstAction, ...restActions] = actions;
      // z.enum requiere al menos un elemento ([string, ...string[]])
      acc[resource as keyof typeof allPermissions] = z
        .array(z.enum([firstAction, ...restActions]))
        .transform((arr) => [...new Set(arr)])
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

  public static merge(permissionsList: readonly Permissions[]): Permissions {
    const merged = permissionsList.reduce<Record<string, string[]>>(
      (acc, perm) => {
        for (const [resource, actions] of Object.entries(perm.value)) {
          if (!actions) continue;
          const existing = acc[resource] ?? [];
          acc[resource] = [...new Set([...existing, ...actions])];
        }
        return acc;
      },
      {},
    );

    // Revalida para mantener las garantías de tipo/inmutabilidad del constructor
    return Permissions.create(merged as AppStatement);
  }

  public satisfies(required: AppStatement): boolean {
    return (
      Object.entries(required) as [
        keyof AppStatement,
        readonly string[] | undefined,
      ][]
    ).every(([resource, actions]) => {
      if (!actions || actions.length === 0) return true;
      return actions.every((action) => this.has(resource, action as never));
    });
  }

  public static hasAll(
    permissionsList: readonly Permissions[],
    required: AppStatement,
  ): boolean {
    return Permissions.merge(permissionsList).satisfies(required);
  }
}
