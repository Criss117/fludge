export const screens = {
  sign_in: {
    description: "Completa tus datos para iniciar sesión",
    button: "Iniciar sesión",
    no_account: "No tienes cuenta?",
    sign_up: "Regístrate",
  },
  sign_up: {
    description: "Completa tus datos para registrarte",
    button: "Registrarse",
    already_account: "¿Ya tienes una cuenta?",
    sign_in: "Iniciar sesión",
  },
  settings: {
    title: "Mi Cuenta",
    sign_out: "Cerrar Sesión",

    preferences: {
      title: "Preferencias",
      dark_mode: "Modo oscuro",
    },
    security_and_access: {
      title: "Seguridad y Accesos",
      change_password: "Cambiar contraseña",
      organizational_management: "Gestión de Organizaciones",
    },
    sync: {
      title: "Sincronización",
      iam: {
        title: "IAM",
        last_synced_at: "Última sincronización",
        refetching: "Sincronizando Iam...",
        on_success: {
          title: "Sincronización realizada con éxito",
          description: "Se han sincronizado todos los datos de IAM",
        },
        on_error: {
          title: "Error al sincronizar IAM",
          description: "Se ha producido un error al sincronizar IAM",
        },
      },
      catalog: {
        title: "Catálogo",
        last_synced_at: "Última sincronización",
        refetching: "Sincronizando Catálogo...",
        on_success: {
          title: "Sincronización realizada con éxito",
          description: "Se han sincronizado todos los datos de Catálogo",
        },
        on_error: {
          title: "Error al sincronizar Catálogo",
          description: "Se ha producido un error al sincronizar Catálogo",
        },
      },
      customer: {
        title: "Clientes",
        last_synced_at: "Última sincronización",
        refetching: "Sincronizando Clientes...",
        on_success: {
          title: "Sincronización realizada con éxito",
          description: "Se han sincronizado todos los datos de Clientes",
        },
        on_error: {
          title: "Error al sincronizar Clientes",
          description: "Se ha producido un error al sincronizar Clientes",
        },
      },
    },
  },
  members: {
    title: "Miembros",
    not_found: "No se encontraron miembros",
    no_available: "No hay miembros disponibles",
    register_member: {
      title: "Registrar un nuevo miembro",
      credentials: "Credenciales",
      personal_info: "Información Personal",
      submit: "Registrar Miembro",
    },
    assign_groups: {
      title: "Asignar grupo",
    },
  },
  groups: {
    title: "Grupos",
    not_found: "No se encontró el grupo",
    no_available: "No hay grupos disponibles",
    create_group: {
      title: "Crear grupo",
      sections: {
        details: "Detalles del Grupo",
      },
    },
    update_group: {
      title: "Editar grupo",
      submit: "Guardar Cambios",
    },
    assign_members: {
      title: "Asignar miembros",
    },
  },
  organizations: {
    register_organization: {
      commercial_data: "Datos Comerciales",
      location_contact: "Ubicación y Contacto",
      submit: "Registrar Organización",
      cancel: "Cancelar e ir a la Selección de Organizaciones",
    },
  },
  sales: {
    title: "Ventas",
    no_more: "No hay más productos",
    not_found: "No se encontraron productos",
    ticket: {
      select_label: "Seleccionar ticket",
      create: "Nuevo ticket",
      delete: "Eliminar ticket",
      empty: "No hay tickets",
    },
    summary: {
      title: "Venta en curso",
      total: "Total a cobrar",
      empty: "No hay productos en este ticket",
      clear: "Limpiar listado",
      charge: "Cobrar",
    },
    product: {
      no_price: "Sin precio",
      sections: {
        details: {
          stock: "Stock general: {{stock}}",
        },
      },
      presentations: {
        title: "Seleccionar presentación",
        description: "Elegí una presentación para {{product}}",
        empty: "No hay presentaciones disponibles",
        base_price: "Precio base: {{price}}",
        wholesale_price: "Precio al por mayor: {{price}}",
        errors: {
          insufficient_stock_label: "Stock insuficiente",
          try_again: "Intentá con otra presentación",
        },
      },
    },
  },
  charge: {
    title: "Procesar Pago",
    sections: {
      amount_received: {
        title: "Monto recibido",
        resubmitted: {
          title: "Vuelto a entregar",
          description: "Devolucion al cliente",
        },
      },
    },
  },
  catalog: {
    title: "Inventario",
  },
  clients: {
    title: "Clientes",
  },
  iam: {
    title: "IAM",
  },
  categories: {
    title: "Categorías",
    not_found: "No se encontraron categorías",
    no_more: "No hay más categorías",
    create: {
      title: "Crear categoría",
    },
  },
  products: {
    title: "Productos",
    not_found: "No se encontraron productos",
    no_more: "No hay más productos",
    create: {
      title: "Crear producto",
    },
    update: {
      title: "Editar producto",
    },
    filters: {
      title: "Filtros",
      status: {
        label: "Estado",
        all: "Todos",
        active: "Activo",
        inactive: "Inactivo",
        discontinued: "Descontinuado",
      },
      order_by: {
        created_at: {
          label: "Fecha de creación",
          desc: "Más recientes",
          asc: "Más antiguos",
        },
        stock: {
          label: "Stock",
          asc: "Menor stock",
          desc: "Mayor stock",
          none: "-",
        },
      },
      apply: "Aplicar",
    },
    product: {
      loading_details: "Cargando detalles del producto",
      sections: {
        details: {
          stock: "Stock total disponible",
          critical_stock: "Stock crítico",
          low_stock: "Stock bajo",
          negative_stock: "Stock negativo",
          min_stock: "Stock mínimo",
        },
        presentations: {
          title: "Presentaciones",
        },
        movements: {
          title: "Movimientos de stock",
        },
      },
    },
  },
};
