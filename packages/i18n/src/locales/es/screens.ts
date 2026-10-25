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
  dashboard: {
    label: "Dashboard",
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
      no_more: "No hay más categorías disponibles",
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
  sales: {
    label: "Ventas",
    list: {
      empty: "No hay ventas disponibles",
      no_more: "No hay más ventas disponibles",
      new_sale: "Nueva venta",
      receipt: "Tirilla",
      detail: "Detalle",
      audit: "Ver Auditoría",
      see_products: "Ver productos",
      items_count: "{{count}} productos",
      cancellation_reason: "Motivo de Anulación",
      walk_in: "Consumidor Final (Mostrador)",
      due_info: "Vence en {{days}} días ({{date}})",
      available_credit: "Cupo disponible restante: {{amount}}",
      reissued: "Reemitida en ticket {{ticket}}",
    },
    status: {
      open: "Abierta",
      partial: "Parcial",
      completed: "Completada",
      cancelled: "Anulada",
    },
    payment_type: {
      cash: "Efectivo",
      credit: "Crédito / Fiado",
    },
  },
  settings: {
    label: "Ajustes",
    sections: {
      preferences: {
        title: "Preferencias",
        dark_mode: {
          label: "Modo oscuro",
          placeholder: "Cambia el tema de la aplicación",
        },
      },
      session: {
        title: "Sesión",
        sign_out: "Cerrar sesión",
        switch_organization: "Cambiar de organización",
      },
      sync: {
        title: "Sincronización",
        catalog: {
          title: "Catálogo",
          on_error: {
            title: "Error al sincronizar",
            description: "No se pudo sincronizar el catálogo",
          },
          refetching: "Sincronizando catálogo",
          on_success: "Catálogo sincronizado con éxito",
          last_synced_at: "Última sincronización: ",
        },
        commerce: {
          title: "Comercio",
          on_error: {
            title: "Error al sincronizar",
            description: "No se pudo sincronizar el comercio",
          },
          refetching: "Sincronizando comercio",
          on_success: "Comercio sincronizado con éxito",
          last_synced_at: "Última sincronización: ",
        },
        iam: {
          title: "IAM",
          on_error: {
            title: "Error al sincronizar",
            description: "No se pudo sincronizar la IAM",
          },
          refetching: "Sincronizando IAM",
          on_success: "IAM sincronizado con éxito",
          last_synced_at: "Última sincronización: ",
        },
      },
    },
  },
  pos: {
    label: "Nueva venta",
    see_cart: "Ver carrito / Cobrar",
    current_sale: "Venta actual",
    ticket_summary: {
      title: "Resumen de la Venta",
      items_count: "{{count}} productos",
      total: "Total a Cobrar",
      clear: "Limpiar",
      charge: "Cobrar",
    },
  },
  charge: {
    title: "Cobrar venta",
    sections: {
      amount_received: {
        title: "Monto recibido",
        label: "Monto recibido",
        placeholder: "0",
        resubmitted: {
          title: "Vuelto",
          description: "Dinero a devolver al cliente",
        },
      },
      payment_type: {
        title: "Forma de pago",
        cash: "Efectivo",
        credit: "Crédito",
      },
      customer_selector: {
        title: "Cliente",
        walk_in: "Mostrador",
        customer: "Cliente",
        walk_in_hint: "Venta de contado sin cliente asignado",
        select_customer: "Seleccionar cliente",
        select_title: "Seleccionar cliente",
      },
      summary: {
        title: "Resumen",
        see_details: "Ver detalles",
        items_count: "{{count}} productos",
      },
    },
  },
  customers: {
    label: "Clientes",
    not_found: "No se encontraron clientes",
    empty: "No hay clientes disponibles",
    no_more: "No hay más clientes disponibles",
    search: {
      label: "Buscar clientes",
      placeholder: "Ej: Camila Gómez",
    },
    create: {
      title: "Crear Cliente",
    },
    update: {
      title: "Editar Cliente",
    },
    card: {
      debt: "Deuda",
      credit_limit: "Límite de crédito",
      available_credit: "Cupo",
      used_credit: "cupo utilizado",
      pay: "Abonar",
      deselect: "Quitar cliente",
    },
  },
};
