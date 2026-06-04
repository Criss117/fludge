export const ALL_RESOURCES = ["groups", "members"] as const;
export type RESOURCES = (typeof ALL_RESOURCES)[number];

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
    [A in keyof (typeof PERMISSIONS)[R]]: string;
  };
};

export const PERMISSION_DESCRIPTIONS = {
  groups: {
    view: "Permite ver grupos",
    create: "Permite crear grupos",
    delete: "Permite eliminar grupos",
    assignMember: "Permite asignar miembros a grupos",
    update: "Permite actualizar grupos",
  },
  members: {
    view: "Permite ver los miembros",
    create: "Permite crear miembros",
    assignGroup: "Permite asignar grupos a miembros",
  },
} as const satisfies PermissionDescriptions;
