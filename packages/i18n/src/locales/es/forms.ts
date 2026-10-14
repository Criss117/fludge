export const forms = {
  auth: {
    title: "Iniciar sesión",
    description: "Ingresa tus credenciales para iniciar sesión",
    email: {
      label: "Correo electrónico",
      placeholder: "Ej: cristian@fludge.dev",
    },
    password: {
      label: "Contraseña",
      placeholder: "***********",
    },
    name: {
      label: "Nombre",
      placeholder: "Ej: Cristian Viveros",
    },
    phone: {
      label: "Teléfono",
      placeholder: "Ej: 382-123-4567",
    },
    sign_in: "Iniciar sesión",
    sign_up: "Registrarse",

    sign_in_toast: {
      pending: "Iniciando sesión",
      success: "Sesión iniciada con éxito",
      error: "Error al iniciar sesión",
    },

    sign_up_toast: {
      pending: "Registrando cuenta",
      success: "Cuenta registrada con éxito",
      error: "Error al registrar la cuenta",
    },
  },
  organization: {
    commercial_data: "Datos comerciales",
    location_and_contact: "Ubicación y contacto",
    name: {
      label: "Nombre Comercial",
      placeholder: "Ej: Tienda de ropa",
    },
    phone: {
      label: "Teléfono",
      placeholder: "Ej: 382-123-4567",
    },
    legal_name: {
      label: "Nombre legal",
      placeholder: "Ej: Tienda de ropa S.L.",
    },
    tax_id: {
      label: "NIT",
      placeholder: "Ej: 123456789",
    },
    address: {
      label: "Dirección",
      placeholder: "Ej: Calle 123, 123 123 C.A.",
    },
    submit: "Registrar",

    register_toast: {
      pending: "Registrando organización",
      success: "Organización registrada con éxito",
      error: "Error al registrar la organización",
    },

    switch_toast: {
      pending: "Cambiando de organización",
      success: "Organización cambiada con éxito",
      error: "Error al cambiar de organización",
    },
  },
  group: {
    create: {
      success: "Grupo creado con éxito",
      submit: "Crear Grupo",
      error: "Error al crear el grupo",
      pending: "Creando grupo",
    },

    update: {
      submit: "Editar Grupo",
      success: "Grupo actualizado con éxito",
      error: "Error al actualizar el grupo",
      pending: "Actualizando grupo",
    },

    unassign_members: {
      pending: "Desasignando miembros del grupo",
      success: "Miembros desasignados con éxito",
      error: "Error al desasignar miembros",
    },

    assign_members: {
      submit: "Asignar ({{quantity}}) Miembros",
      pending: "Asignando miembros al grupo",
      success: "Miembros asignados con éxito",
      error: "Error al asignar miembros",
    },

    details: {
      title: "Detalles del Grupo",
    },

    name: {
      label: "Nombre del Grupo",
      placeholder: "Ej: Caja",
    },

    description: {
      label: "Descripción del Grupo",
      placeholder: "Ej: Caja de Cajas",
    },

    permissions: {
      label: "Permisos del Grupo",
    },
  },
  member: {
    register: {
      success: "Miembro registrado con éxito",
      submit: "Registrar Miembro",
      error: "Error al registrar el miembro",
      pending: "Registrando miembro",
    },

    assing_groups: {
      submit: "Asignar ({{quantity}}) Grupos",
      pending: "Asignando grupos al miembro",
      success: "Grupos asignados con éxito",
      error: "Error al asignar grupos",
    },

    unassign_groups: {
      pending: "Desasignando grupos del miembro",
      success: "Grupos desasignados con éxito",
      error: "Error al desasignar grupos",
    },

    sections: {
      personal_data: "Datos personales",
      access_data: "Datos de acceso",
    },

    password: {
      label: "Contraseña",
      placeholder: "***********",
    },
    submit: "Registrar Miembro",
  },
  product: {
    sections: {
      basic_information: "Información básica",
      stock: "Stock",
      presentations: {
        empty: "No hay presentaciones",
        title: "Presentaciones",
      },
    },
    name: {
      label: "Nombre del Producto",
      placeholder: "Ej: Televisor",
    },
    description: {
      label: "Descripción del Producto",
      placeholder: "Ej: Televisor de 1080p",
    },
    category: {
      label: "Categoría del Producto",
      placeholder: "Ej: Televisores",
    },
    stock: {
      label: "Stock",
      placeholder: "Ej: 100",
    },
    min_stock: {
      label: "Min. Stock",
      placeholder: "Ej: 10",
    },
    allow_negative_stock: {
      label: "Stock negativo",
      placeholder: "Selecciona si el stock puede ser negativo",
    },
    submit: "Guardar Producto",

    create_toast: {
      pending: "Creando producto",
      success: "Producto creado con éxito",
      error: "Error al crear el producto",
    },

    update_toast: {
      pending: "Actualizando producto",
      success: "Producto actualizado con éxito",
      error: "Error al actualizar el producto",
    },
  },
  product_presentation: {
    title: "Crear Presentación",
    name: {
      label: "Nombre de la Presentación",
      placeholder: "Ej: Presentación de Televisor",
    },
    barcode: {
      label: "Código de Barras",
      placeholder: "Ej: 1234567890123",
    },
    conversion_factor: {
      label: "Factor de Conversión",
      placeholder: "Ej: 1",
    },
    price_sale: {
      label: "Precio de Venta",
      placeholder: "Ej: 100",
    },
    price_purchase: {
      label: "Precio de Compra",
      placeholder: "Ej: 200",
    },
    price_wholesale: {
      label: "Precio Mayoreo",
      placeholder: "Ej: 300",
    },
    submit: "Guardar Presentación",
  },
};
