import { z } from "zod";

export const PERMISSIONS = {
  organizations: ["update"],
  groups: ["create", "read", "update", "delete", "assign-member"],
  members: ["create", "read", "delete", "assign-group"],
} as const;

export type AppStatement = {
  -readonly [
    K in keyof typeof PERMISSIONS
  ]?: readonly (typeof PERMISSIONS)[K][number][];
};

export type RESOURCES = keyof typeof PERMISSIONS;

export type ActionOf<K extends keyof AppStatement> = NonNullable<
  AppStatement[K]
>[number];

export type PermissionEnum = {
  [R in RESOURCES]: `${R}:${ActionOf<R>}`;
}[RESOURCES];

export type PermissionDescriptions = {
  [R in RESOURCES]: {
    [A in (typeof PERMISSIONS)[R][number]]: {
      es: string;
      title: string;
      description: string;
    };
  } & {
    es: string;
  };
};

export const PERMISSION_DESCRIPTIONS_ES = {
  organizations: {
    es: "Organizaciones",
    update: {
      es: "Editar",
      title: "Editar organizaciones",
      description:
        "Permite modificar el nombre, la descripción y los datos generales de las organizaciones existentes.",
    },
  },
  groups: {
    es: "Grupos",
    read: {
      es: "Ver",
      title: "Ver grupos",
      description:
        "Permite visualizar el listado de grupos y acceder a sus detalles básicos.",
    },
    create: {
      es: "Crear",
      title: "Crear grupos",
      description:
        "Permite registrar nuevos grupos en el sistema y definir su configuración inicial.",
    },
    delete: {
      es: "Eliminar",
      title: "Eliminar grupos",
      description:
        "Permite borrar grupos permanentemente del sistema. Esta acción puede ser irreversible.",
    },
    "assign-member": {
      es: "Asignar miembros",
      title: "Asignar miembros a grupos",
      description:
        "Permite añadir o remover usuarios dentro de un grupo específico.",
    },
    update: {
      es: "Editar",
      title: "Editar grupos",
      description:
        "Permite modificar el nombre, la configuración y los datos generales de los grupos existentes.",
    },
  },
  members: {
    es: "Miembros",
    read: {
      es: "Ver",
      title: "Ver miembros",
      description:
        "Permite consultar la lista de miembros, sus perfiles y su estado actual.",
    },
    create: {
      es: "Crear",
      title: "Crear miembros",
      description:
        "Permite registrar nuevos miembros en la plataforma e invitarlos a participar.",
    },
    delete: {
      es: "Eliminar",
      title: "Eliminar miembros",
      description:
        "Permite borrar miembros permanentemente del sistema. Esta acción puede ser irreversible.",
    },
    "assign-group": {
      es: "Asignar grupos",
      title: "Asignar grupos a miembros",
      description:
        "Permite vincular directamente a un miembro con uno o varios grupos disponibles.",
    },
  },
} as const satisfies PermissionDescriptions;

export const ALL_PERMISSIONS = Object.entries(PERMISSIONS).flatMap(
  ([resource, actions]) =>
    Object.values(actions).map((action) => `${resource}:${action}`),
) as [PermissionEnum, ...PermissionEnum[]];

export const appStatementSchema = z
  .object(
    Object.fromEntries(
      Object.entries(PERMISSIONS).map(([resource, actions]) => [
        resource,
        z
          .enum(actions as unknown as [string, ...string[]])
          .array()
          .optional()
          .default([]),
      ]),
    ),
  )
  .refine(
    (statement) =>
      Object.values(statement).some((actions) => actions.length > 0),
    { error: "Debe tener al menos una autorización" },
  ) as z.ZodType<AppStatement, AppStatement>;
