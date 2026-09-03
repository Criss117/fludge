export const es = {
  app: {
    title: "Fludge",
    loading_data: "Cargando datos...",
    loading_session: "Cargando sesión...",
    permissions: {
      camera: {
        required: "Necesitamos permisos para usar la cámara",
        request: "Permitir acceso a la cámara",
      },
    },
  },

  api_errors: {
    shared: {
      internal_server_error: "Error interno del servidor",
      not_found: "No se encontró",
      unauthorized: "No estás autorizado",
      forbidden: "No tienes permisos para realizar esta operación",
      conflict: "El recurso ya existe",
      bad_request: "La petición es incorrecta",
      validation_error: "La petición es incorrecta",
      internal_error: "Error interno del servidor",
      timeout_error: "La petición ha tardado demasiado en responderse",
    },
    auth: {
      sessions: {
        isr_on_update: "Error al actualizar la sesión",
        invalid_credentials: "Credenciales inválidas",
        unauthorized: "No estás autorizado",
        no_active_organization: "No tienes una organización activa",
      },
      users: {
        isr_on_find: "Error al obtener el usuario",
        isr_on_update: "Error al actualizar la información del usuario",
        not_root: "Solo el usuario root puede acceder a este recurso.",
        only_dev: "Solo para desarrollo",
      },
    },
    catalog: {
      products: {
        isr_on_find: "Error al obtener el producto",
        isr_on_save: "Error al guardar el producto",
        isr_on_delete: "Error al eliminar el producto",
        already_exists: "El producto ya existe",
        not_found: "No se encontró el producto",
        name_taken: "El nombre del producto ya está en uso",
        insufficient_stock: "El stock es insuficiente",
        invalid_amount: "La cantidad no es válida",
        invalid_min_stock: "El stock mínimo no es válido",
        min_stock_must_be_lower_than_stock:
          "El stock mínimo debe ser menor que el stock",
        no_has_barcode: "Debe tener al menos una presentación con barcode",
        stock_must_be_positive: "El stock debe ser positivo",
        amount_must_be_positive: "La cantidad debe ser positiva",
      },
      products_presentations: {
        isr_on_find: "Error al obtener la presentación",
        already_exists: "La presentación ya existe",
        not_found: "No se encontró la presentación",
        barcodes_taken: "Alguno de los barcodes ya está en uso",
        duplicated_barcode: "El barcode ya existe",
      },
      categories: {
        isr_on_find: "Error al obtener la categoría",
        isr_on_update: "Error al actualizar la categoría",
        isr_on_save: "Error al guardar la categoría",
        isr_on_delete: "Error al eliminar la categoría",
        already_exists: "La categoría ya existe",
        not_found: "No se encontró la categoría",
        name_taken: "El nombre de la categoría ya está en uso",
      },
    },
    iam: {
      organizations: {
        isr_on_find: "Error al obtener la organización",
        isr_on_update: "Error al actualizar la organización",
        isr_on_save: "Error al guardar la organización",
        isr_on_delete: "Error al eliminar la organización",
        not_found: "No se encontró la organización",
        already_exists: "La organización ya existe",
        name_taken: "El nombre o slug ya está en uso",
        legal_name_taken: "El nombre legal ya está en uso",
        tax_id_taken: "El TAX ID ya está en uso",
        phone_taken: "El teléfono ya está en uso",
        cant_remove_owner: "No se puede eliminar el propietario",
        owner_not_found: "No se encontró el propietario de la organización",
        has_owner: "La organización ya tiene un propietario",
      },
      group_members: {
        already_exists: "El miembro ya está en el grupo",
        not_found: "El grupo no tiene miembros asignados",
      },
      members: {
        isr_on_find: "Error al obtener el miembro",
        isr_on_update: "Error al actualizar el miembro",
        isr_on_save: "Error al guardar el miembro",
        isr_on_delete: "Error al eliminar el miembro",
        isr_on_assign_group: "Error al asignar el grupo",
        isr_on_unassign_group: "Error al desasignar el grupo",
        already_exists: "El miembro ya existe",
        not_found: "No se encontró el miembro",
        is_owner: "El miembro es el propietario de la organización",
        not_member: "El usuario no es miembro de la organización",
        without_permissions: "No tiene permisos para realizar esta operación",
      },
      groups: {
        isr_on_find: "Error al obtener el grupo",
        isr_on_update: "Error al actualizar el grupo",
        isr_on_save: "Error al guardar el grupo",
        isr_on_delete: "Error al eliminar el grupo",
        isr_on_assign_member: "Error al asignar el miembro",
        isr_on_unassign_member: "Error al desasignar el miembro",
        name_taken: "El nombre del grupo ya está en uso",
        already_exists: "El grupo ya existe",
        not_found: "No se encontró el grupo",
      },
    },
  },

  validators: {
    shared: {
      uuid: {
        invalid: "El id no es válido",
      },
      name: {
        required: "El nombre es requerido",
        min_length: "El nombre es demasiado corto",
      },
      description: {
        invalid: "La descripción debe ser un texto",
      },
      phone: {
        invalid: "El teléfono es inválido",
        min_length: "Ingresa un número de teléfono válido",
        max_length: "El teléfono es muy largo",
      },
    },
    auth: {
      name: {
        required: "El nombre es requerido",
        min_length: "El nombre es demasiado corto",
      },
      email: {
        invalid: "El email es inválido",
      },
      phone: {
        invalid: "El teléfono es inválido",
        min_length: "Ingresa un número de teléfono válido",
      },
      password: {
        required: "La contraseña es requerida",
        min_length: "La contraseña debe tener al menos 6 caracteres",
      },
    },
    groups: {
      member_ids: {
        required: "Debe especificar al menos un miembro",
      },
    },
    members: {
      group_ids: {
        required: "Debe especificar al menos un grupo",
      },
    },
    organizations: {
      name: {
        required: "El nombre de la organización es requerido",
        min_length: "El nombre de la organización es demasiado corto",
        max_length: "El nombre de la organización es demasiado largo",
      },
      legal_name: {
        required: "La razón social es requerida",
        min_length: "La razón social es muy corta",
        max_length: "La razón social es muy larga",
      },
      tax_id: {
        required: "El NIT es requerido",
        min_length: "El NIT es muy corto",
        max_length: "El NIT es muy largo",
      },
      address: {
        required: "La dirección es requerida",
        min_length: "La dirección es muy corta",
        max_length: "La dirección es muy larga",
      },
    },
  },

  forms: {
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
  },

  screens: {
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
      preferences: "Preferencias",
      dark_mode: "Modo oscuro",
      security_and_access: "Seguridad y Accesos",
      change_password: "Cambiar contraseña",
      organizational_management: "Gestión de Organizaciones",
      sign_out: "Cerrar Sesión",
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
    },
    products: {
      title: "Productos",
      not_found: "No se encontraron productos",
      no_more: "No hay más productos",
    },
  },

  permissions: {
    organizations: {
      update: {
        name: "Actualizar organización",
        description: "Puede actualizar la organización",
      },
    },
    groups: {
      create: {
        name: "Crear grupo",
        description: "Puede crear grupos",
      },
      read: {
        name: "Leer grupo",
        description: "Puede leer grupos",
      },
      update: {
        name: "Actualizar grupo",
        description: "Puede actualizar grupos",
      },
      delete: {
        name: "Eliminar grupo",
        description: "Puede eliminar grupos",
      },
      assign_member: {
        name: "Asignar miembro",
        description: "Puede asignar miembros a grupos",
      },
    },
    members: {
      create: {
        name: "Crear miembro",
        description: "Puede crear miembros",
      },
      read: {
        name: "Leer miembro",
        description: "Puede leer miembros",
      },
      delete: {
        name: "Eliminar miembro",
        description: "Puede eliminar miembros",
      },
      assign_group: {
        name: "Asignar grupo",
        description: "Puede asignar grupos a miembros",
      },
    },
    categories: {
      create: {
        name: "Crear categoría",
        description: "Puede crear categorías",
      },
      read: {
        name: "Leer categoría",
        description: "Puede leer categorías",
      },
      update: {
        name: "Actualizar categoría",
        description: "Puede actualizar categorías",
      },
      delete: {
        name: "Eliminar categoría",
        description: "Puede eliminar categorías",
      },
    },
    products: {
      create: {
        name: "Crear producto",
        description: "Puede crear productos",
      },
      read: {
        name: "Leer producto",
        description: "Puede leer productos",
      },
      update: {
        name: "Actualizar producto",
        description: "Puede actualizar productos",
      },
      delete: {
        name: "Eliminar producto",
        description: "Puede eliminar productos",
      },
    },
  },

  resources: {
    products: {
      name: "Productos",
      allow_negative_stock: "Permite Stock Negativo",
    },
    presentations: {
      name: "Presentaciones",
    },
    categories: {
      name: "Categorías",
    },
    suppliers: {
      name: "Proveedores",
    },
    movements: {
      name: "Movimientos",
    },
    members: {
      name: "Miembros",
    },
    permissions: {
      name: "Permisos",
    },
    groups: {
      name: "Grupos",
    },
  },

  helpers: {
    status: {
      active: "Activo",
      inactive: "Inactivo",
      discontinued: "Descontinuado",
      activate: "Activar",
      deactivate: "Desactivar",
    },

    placeholder: {
      search_products: "Buscar productos por nombre, codigo, descripción...",
      search_categories: "Buscar categorias por nombre, descripción...",
      search_movements: "Buscar movimientos por nombre, descripción...",
      search_suppliers: "Buscar proveedores por nombre, descripción...",
      search_members: "Buscar miembros por nombre, descripción...",
      search_groups: "Buscar grupos por nombre, descripción...",
    },

    assign: "Asignar",
    please_wait: "Por favor, espere...",
    close: "Cerrar",
    created_at: "Creado el:",
    joined_at: "Unido el:",
    view_details: "Ver Detalles",
    edit: "Editar",
    unassign_group: "Desasignar Grupo",
    unassign_member: "Desasignar Miembro",
    owner: "Propietario",
    member: "Miembro",
    cancel: "Cancelar",
    continue: "Continuar",
    all_of: "Todos de {{resource}}",
    search_organizations: "Buscar por nombre o Tax ID / NIT",
    register_organization: "Registrar Nueva Organización",
    switch_organization_hint:
      "Puedes cambiar de organización en cualquier momento desde los ajustes",
    no_groups: "No hay grupos",
    no_members: "No hay miembros",
    inherited_roles_permissions: "Roles y permisos heredados",
    more: "más",
    options: "Opciones",
  },

  mutations: {
    members: {
      assign_groups: {
        is_pending: "Asignando grupos",
        success: {
          title: "Grupos Asignados",
          description: "Los grupos se han asignado correctamente.",
        },
        error: "Algo salió mal al asignar grupos",
      },
    },
    groups: {
      create: {
        is_pending: "Creando grupo",
        success: {
          title: "Grupo Creado",
          description: "El grupo se ha creado correctamente.",
        },
        error: "Algo salió mal al crear el grupo",
      },
      update: {
        is_pending: "Actualizando Grupo",
        success: {
          title: "Grupo actualizado",
          description: "El grupo se actualizó correctamente.",
        },
        error: "Algo salió mal al actualizar el grupo",
      },
      assign_members: {
        is_pending: "Asignando miembros",
        success: {
          title: "Miembros Asignados",
          description: "Los miembros se han asignado correctamente.",
        },
        error: "Algo salió mal al asignar miembros",
      },
    },
  },
} as const;
