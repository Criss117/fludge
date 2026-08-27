export const allPermissions = {
  groups: ["create", "read", "update", "delete"],
  organizations: ["update"],
  members: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
  categories: ["create", "read", "update", "delete"],
  sales: ["create", "read", "update", "delete"],
  groupMembers: ["assign", "read", "remove"],
} as const;

export type PermissionsType = typeof allPermissions;

export type AppStatement = {
  -readonly [
    K in keyof typeof allPermissions
  ]?: readonly (typeof allPermissions)[K][number][];
};

// Objeto de traducciones, en el mismo "shape" que allPermissions
export const allPermissionsEs = {
  groups: {
    es: "grupos",
    values: {
      create: "crear",
      read: "leer",
      update: "actualizar",
      delete: "eliminar",
    },
  },
  organizations: {
    es: "organización",
    values: {
      update: "actualizar",
    },
  },
  members: {
    es: "miembros",
    values: {
      create: "crear",
      read: "leer",
      update: "actualizar",
      delete: "eliminar",
    },
  },
  products: {
    es: "productos",
    values: {
      create: "crear",
      read: "leer",
      update: "actualizar",
      delete: "eliminar",
    },
  },
  categories: {
    es: "categorías",
    values: {
      create: "crear",
      read: "leer",
      update: "actualizar",
      delete: "eliminar",
    },
  },
  sales: {
    es: "ventas",
    values: {
      create: "crear",
      read: "leer",
      update: "actualizar",
      delete: "eliminar",
    },
  },
  groupMembers: {
    es: "miembros de grupo",
    values: {
      assign: "asignar",
      read: "leer",
      remove: "remover",
    },
  },
} as const satisfies {
  [K in keyof typeof allPermissions]: {
    es: string;
    values: {
      [A in (typeof allPermissions)[K][number]]: string;
    };
  };
};
