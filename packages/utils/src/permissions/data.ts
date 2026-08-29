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

export const RESOURCES_ES: Record<RESOURCES, string> = {
  groups: "Grupos",
  members: "Miembros",
  organizations: "Organizaciones",
} as const;

export type ActionOf<R extends RESOURCES> = (typeof PERMISSIONS)[R][number];

export type PermissionEnum = {
  [R in RESOURCES]: `${R}:${ActionOf<R>}`;
}[RESOURCES];

export type PermissionDescriptions = {
  [R in RESOURCES]: {
    [A in (typeof PERMISSIONS)[R][number]]: {
      title: string;
      description: string;
    };
  };
};

export const PERMISSION_DESCRIPTIONS_ES = {
  organizations: {
    update: {
      title: "Editar organizaciones",
      description:
        "Permite modificar el nombre, la descripción y los datos generales de las organizaciones existentes.",
    },
  },
  groups: {
    read: {
      title: "Ver grupos",
      description:
        "Permite visualizar el listado de grupos y acceder a sus detalles básicos.",
    },
    create: {
      title: "Crear grupos",
      description:
        "Permite registrar nuevos grupos en el sistema y definir su configuración inicial.",
    },
    delete: {
      title: "Eliminar grupos",
      description:
        "Permite borrar grupos permanentemente del sistema. Esta acción puede ser irreversible.",
    },
    "assign-member": {
      title: "Asignar miembros a grupos",
      description:
        "Permite añadir o remover usuarios dentro de un grupo específico.",
    },
    update: {
      title: "Editar grupos",
      description:
        "Permite modificar el nombre, la configuración y los datos generales de los grupos existentes.",
    },
  },
  members: {
    read: {
      title: "Ver miembros",
      description:
        "Permite consultar la lista de miembros, sus perfiles y su estado actual.",
    },
    create: {
      title: "Crear miembros",
      description:
        "Permite registrar nuevos miembros en la plataforma e invitarlos a participar.",
    },
    delete: {
      title: "Eliminar miembros",
      description:
        "Permite borrar miembros permanentemente del sistema. Esta acción puede ser irreversible.",
    },
    "assign-group": {
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
