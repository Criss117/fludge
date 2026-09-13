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
    create: {
      title: "Crear Categoría",
      description: "Llena los campos para crear una nueva categoría",
      submit: "Crear",
    },
    update: {
      title: "Actualizar Categoría",
      description: "Actualiza la categoría seleccionada",
      submit: "Actualizar",
    },
  },
  product: {
    name: {
      label: "Nombre del producto",
      placeholder: "Ej. Tequila",
    },
    description: {
      label: "Descripción del producto",
      placeholder: "Ej. Tequila de la mano",
    },
    stock: {
      label: "Stock Inicial",
      placeholder: "stock",
    },
    min_stock: {
      label: "Stock mínimo",
      placeholder: "Stock mínimo",
    },
    allow_negative_stock: {
      label: "Permitir Stock Negativo",
      description: "Permite que el stock sea negativo",
    },
    sections: {
      basic: "Información básica",
      stock: "Reglas de inventario y stock",
      presentations: {
        title: "Presentaciones y Precios",
        description: "Configura unidades, paquetes o cajas con sus tarifas",
        add: "Añadir Presentación",
      },
      update_presentations: {
        title: "Actualizar Presentaciones",
        description: "Actualizar las presentaciones existentes",
        add: "Añadir Presentación",
      },
    },
    categories: {
      label: "Categorías",
      placeholder: "Selecciona una o más categorías",
      description: "Selecciona las categorías que pertenecen al producto",
      add: "Añadir Categoría",
    },
    create: "Crear Producto",
    update: "Actualizar Producto",
  },
  product_presentation: {
    name: {
      label: "Nombre de la presentación",
      placeholder: "Ej. Paquete de Tequila",
    },
    conversion_factor: {
      label: "Factor conversión",
      placeholder: "Ej. 1",
    },
    price_sale: {
      label: "Venta",
      placeholder: "Precio de venta",
    },
    price_wholesale: {
      label: "Mayorista",
      placeholder: "Precio de al por mayor",
    },
    price_purchase: {
      label: "Compra",
      placeholder: "Precio de compra",
    },
    barcode: {
      label: "Código de barras",
      placeholder: "Código de barras",
    },
    add_variant: "Añadir otra Variante o Presentación",
  },
  ticket: {
    err_on_add: "Error al añadir al Ticket",
    err_on_update: "Error al actualizar el Ticket",
    not_found: "No se encontró el ticket",
    name_required: "El nombre no puede estar vacío",
    name_taken: "Ya existe un ticket con ese nombre",
    no_active_ticket: "No hay un ticket activo",
    item: {
      not_found: "El item no existe en el ticket",
      quantity_required: "La cantidad debe ser mayor a 0",
      price_sale_required: "El precio debe ser mayor a 0",
    },
    product: {
      not_found: "El producto ya no existe en el ticket",
      insufficient_stock: "El stock es insuficiente.",
    },
  },
};
