import type { Permission } from "@repo/core/value-objects/permission";
import { z } from "zod";

export const allPermissions: Permission[] = [
  "users:create",
  "users:read",
  "users:update",
  "users:delete",

  "tickets:create",
  "tickets:read",
  "tickets:update",
  "tickets:delete",

  "products:create",
  "products:read",
  "products:update",
  "products:delete",

  "clients:create",
  "clients:read",
  "clients:update",
  "clients:delete",

  "businesses:create",
  "businesses:update",

  "groups:create",
  "groups:read",
  "groups:update",
  "groups:delete",
];

export const createGroupDto = z.object({
  name: z
    .string({
      error: "El nombre del grupo es obligatorio",
    })
    .min(1, {
      message: "El nombre del grupo es obligatorio",
    })
    .max(100, {
      message: "El nombre del grupo debe tener un máximo de 100 caracteres",
    }),

  description: z
    .string({
      error: "La descripción del grupo debe ser una cadena de texto",
    })
    .max(255, {
      message:
        "La descripción del grupo debe tener un máximo de 255 caracteres",
    })
    .optional(),

  permissions: z
    .array(
      z.enum(allPermissions, {
        error: "Cada permiso debe ser un valor válido",
      })
    )
    .min(1, {
      message: "El grupo debe tener al menos un permiso",
    }),
});

export type CreateGroupDto = z.infer<typeof createGroupDto>;
