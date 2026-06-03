export type RESOURCES = "groups" | "employees";

export const PERMISSIONS = {
  groups: {
    view: "view",
    create: "create",
    assignEmployee: "assign-employee",
    update: "update",
  },
  employees: {
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
    assignEmployee: "Permite asignar empleados a grupos",
    update: "Permite actualizar grupos",
  },
  employees: {
    view: "Permite ver empleados",
    create: "Permite crear empleados",
    assignGroup: "Permite asignar grupos a empleados",
  },
} as const satisfies PermissionDescriptions;
