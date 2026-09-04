export const forms = {
  user: {
    name: {
      label: "Nombre Completo",
      placeholder: "Natalia Arturo",
    },
    email: {
      label: "Correo Electrónico",
      placeholder: "natalia@fludge.dev",
    },
    password: {
      label: "Contraseña",
      placeholder: "*********",
    },
    phone: {
      label: "Número de Teléfono",
      placeholder: "3212345678",
    },
  },
  organization: {
    address: {
      label: "Dirección Comercial",
      placeholder: "Ej. Calle de la casa, 123",
    },
    name: {
      label: "Nombre de la organización",
      placeholder: "Ej. Tienda Andres",
    },
    legal_name: {
      label: "Nombre legal",
      placeholder: "Ej. Tienda Andres S.A.S.",
    },
    tax_id: {
      label: "Identificación Fiscal (Tax ID / NIT / RFC)",
      placeholder: "Ingresa el código único",
    },
    phone: {
      label: "Número de Teléfono de la Organización",
      placeholder: "3212345678",
    },
  },
  group: {
    name: {
      label: "Nombre del grupo",
      placeholder: "Ej. Tienda Andres",
    },
    description: {
      label: "Descripción del grupo",
      placeholder: "Ej. Tienda Andres S.A.S.",
    },
    permissions: {
      label: "Matriz de permisos",
    },
    create: "Crear Grupo",
    submit: "Crear",
  },
  member: {
    create: "Crear Miembro",
    assign_groups: "Asignar Grupos",
  },
  category: {
    name: {
      label: "Nombre de la categoría",
      placeholder: "Ej. Lacteos",
    },
    description: {
      label: "Descripción de la categoría",
      placeholder: "Ej. Lacteos de la mano",
    },
    create: "Crear Categoría",
    update: "Actualizar Categoría",
  },
};
