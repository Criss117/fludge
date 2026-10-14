export const screens = {
  sign_in: {
    description: "Completa tus datos para iniciar sesión",
    no_account: "No tienes cuenta?",
    sign_up: "Regístrate",
  },
  sign_up: {
    description: "Completa tus datos para registrarte",
    button: "Registrarse",
    already_account: "¿Ya tienes una cuenta?",
    sign_in: "Inicia sesión",
  },
  organization: {
    select: {
      title: "Selecciona una organización",
      to_register: "Registra una organización",
      search: {
        label: "Buscar organizaciones",
        placeholder: "Ej: Empresa, S.A., etc",
      },
      no_organizations: "No hay organizaciones disponibles",
    },
    register: {
      title: "Registra una organización",
      to_select: "Cancelar e ir a la Selección de Organizaciones",
    },
  },
  iam: {
    label: "IAM",
    groups: {
      label: "Grupos",
      search: {
        placeholder: "Ej: Caja",
        label: "Buscar grupos",
      },
      empty: "No hay grupos disponibles",
    },
    members: {
      label: "Miembros",
      search: {
        placeholder: "Ej: Juan Perez",
        label: "Buscar miembros",
      },
      empty: "No hay miembros disponibles",
    },
  },
  catalog: {
    label: "Catálogo",
    products: {
      label: "Productos",
      search: {
        placeholder: "Ej: Televisor",
        label: "Buscar productos",
      },
      empty: "No hay productos disponibles",
      no_more: "No hay más productos disponibles",
      total_presentations: "{{quantity}} Presentaciones",
      stock: "Stock: {{quantity}}",
      min_stock: "Stock mínimo: {{quantity}}",
      allow_negative_stock: "Permite stock negativo",
      not_allow_negative_stock: "No permite stock negativo",
    },
    categories: {
      label: "Categorías",
      search: {
        placeholder: "Ej: Lacteos",
        label: "Buscar categorías",
      },
      empty: "No hay categorías disponibles",
    },
  },
  products: {
    create: {
      title: "Crear Producto",
    },
    update: {
      title: "Editar Producto",
    },
    detail: {
      loading: "Cargando producto",
    },
  },
  groups: {
    create: {
      title: "Crear Grupo",
    },
    update: {
      title: "Editar Grupo",
    },
    detail: {
      loading: "Cargando grupo",
      unassign: "Desasignar Miembro",
    },
    assign_members: {
      title: "Asignar Miembros",
    },
  },
  members: {
    register: {
      label: "Registrar Miembro",
    },
    detail: {
      loading: "Cargando miembro",
      unassign: "Desasignar Grupo",
    },
    assign_groups: {
      title: "Asignar Grupos",
    },
  },
  customer: {
    label: "Cliente",
  },
  sales: {
    label: "Ventas",
  },
};
