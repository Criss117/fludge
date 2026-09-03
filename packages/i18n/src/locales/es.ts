export const es = {
  shared: {
    errors: {
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
  },
  auth: {
    sessions: {
      errors: {
        isr_on_update: "Error al actualizar la sesión",
        invalid_credentials: "Credenciales inválidas",
        unauthorized: "No estás autorizado",
        no_active_organization: "No tienes una organización activa",
      },
    },
    users: {
      errors: {
        isr_on_find: "Error al obtener el usuario",
        isr_on_update: "Error al actualizar la información del usuario",
        not_root: "Solo el usuario root puede acceder a este recurso.",
        only_dev: "Solo para desarrollo",
      },
    },
  },
  catalog: {
    products: {
      errors: {
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
    },
    products_presentations: {
      errors: {
        isr_on_find: "Error al obtener la presentación",
        already_exists: "La presentación ya existe",
        not_found: "No se encontró la presentación",
        barcodes_taken: "Alguno de los barcodes ya está en uso",
        duplicated_barcode: "El barcode ya existe",
      },
    },
    categories: {
      errors: {
        isr_on_find: "Error al obtener la categoría",
        isr_on_update: "Error al actualizar la categoría",
        isr_on_save: "Error al guardar la categoría",
        isr_on_delete: "Error al eliminar la categoría",
        already_exists: "La categoría ya existe",
        not_found: "No se encontró la categoría",
        name_taken: "El nombre de la categoría ya está en uso",
      },
    },
  },
  iam: {
    organizations: {
      errors: {
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
    },
    group_members: {
      errors: {
        already_exists: "El miembro ya está en el grupo",
        not_found: "El grupo no tiene miembros asignados",
      },
    },
    members: {
      errors: {
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
    },
    groups: {
      errors: {
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
} as const;
