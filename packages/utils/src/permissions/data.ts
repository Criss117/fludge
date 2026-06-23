export const ALL_RESOURCES = ["groups", "members", "categories"] as const;
export type RESOURCES = (typeof ALL_RESOURCES)[number];

export const ES_RESOURCES: Record<RESOURCES, string> = {
  groups: "Grupos",
  members: "Miembros",
  categories: "Categorías",
} as const;

export const PERMISSIONS = {
  groups: {
    view: "view",
    create: "create",
    delete: "delete",
    assignMember: "assign-member",
    update: "update",
  },
  members: {
    view: "view",
    create: "create",
    assignGroup: "assign-group",
  },
  categories: {
    view: "view",
    create: "create",
    update: "update",
    delete: "delete",
  },
} as const;

export type Resource = keyof typeof PERMISSIONS;

export type ActionOf<R extends Resource> =
  (typeof PERMISSIONS)[R] extends Record<string, infer V>
    ? V extends string
      ? V
      : never
    : never;

export type Permission = {
  [R in Resource]: `${R}:${ActionOf<R>}`;
}[Resource];

export type PermissionDescriptions = {
  [R in Resource]: {
    [A in keyof (typeof PERMISSIONS)[R]]: {
      title: string;
      description: string;
    };
  };
};

export const RESOURCE_DESCRIPTIONS = {
  groups: "Grupos",
  members: "Miembros",
  categories: "Categorías",
} as const satisfies Record<Resource, string>;

export const PERMISSION_DESCRIPTIONS = {
  groups: {
    view: {
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
    assignMember: {
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
    view: {
      title: "Ver miembros",
      description:
        "Permite consultar la lista de miembros, sus perfiles y su estado actual.",
    },
    create: {
      title: "Crear miembros",
      description:
        "Permite registrar nuevos miembros en la plataforma e invitarlos a participar.",
    },
    assignGroup: {
      title: "Asignar grupos a miembros",
      description:
        "Permite vincular directamente a un miembro con uno o varios grupos disponibles.",
    },
  },
  categories: {
    view: {
      title: "Ver categorías",
      description:
        "Permite visualizar el listado de categorías y acceder a sus detalles básicos.",
    },
    create: {
      title: "Crear categorías",
      description:
        "Permite registrar nuevas categorías en el sistema y definir su configuración inicial.",
    },
    update: {
      title: "Editar categorías",
      description:
        "Permite modificar el nombre, el slug y los datos generales de las categorías existentes.",
    },
    delete: {
      title: "Eliminar categorías",
      description:
        "Permite borrar categorías permanentemente del sistema. Esta acción puede ser irreversible.",
    },
  },
} as const satisfies PermissionDescriptions;
