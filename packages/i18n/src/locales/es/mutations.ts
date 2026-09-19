export const mutations = {
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
  categories: {
    create: {
      is_pending: "Creando categoría",
      success: {
        title: "Categoría Creada",
        description: "La categoría se ha creado correctamente.",
      },
      error: "Algo salió mal al crear la categoría",
    },
    update: {
      is_pending: "Actualizando Categoría",
      success: {
        title: "Categoría actualizada",
        description: "La categoría se actualizó correctamente.",
      },
      error: "Algo salió mal al actualizar la categoría",
    },
    delete: {
      is_pending: "Eliminando Categoría",
      success: {
        title: "Categoría Eliminada",
        description: "La categoría se eliminó correctamente.",
      },
      error: "Algo salió mal al eliminar la categoría",
      dialog: {
        title: "Eliminar Categoría",
        description:
          "¿Estás seguro de que deseas eliminar la categoría {{name}}?",
      },
    },
  },
  products: {
    create: {
      is_pending: "Creando Producto",
      success: {
        title: "Producto Creado",
        description: "El producto se ha creado correctamente.",
      },
      error: "Algo salió mal al crear el producto",
    },
    update: {
      is_pending: "Actualizando Producto",
      success: {
        title: "Producto Actualizado",
        description: "El producto se actualizó correctamente.",
      },
      error: "Algo salió mal al actualizar el producto",
    },
    delete: {
      ask: "¿Estás seguro de que deseas eliminar {{name}}?",
      description: "El producto se eliminará de forma permanente.",
      is_pending: "Eliminando Producto",
      success: {
        title: "Producto Eliminado",
        description: "El producto se eliminó correctamente.",
      },
      error: "Algo salió mal al eliminar el producto",
      dialog: {
        title: "Eliminar Producto",
        description:
          "¿Estás seguro de que deseas eliminar el producto {{name}}?",
      },
    },
  },
  sale: {
    create: {
      is_pending: "Creando Venta",
      success: {
        title: "Venta Creada",
        description: "La venta se ha creado correctamente.",
      },
      error: "Algo salió mal al crear la venta",
    },
  },
  customers: {
    create: {
      is_pending: "Creando Cliente",
      success: {
        title: "Cliente Creado",
        description: "El cliente se ha creado correctamente.",
      },
      error: "Algo salió mal al crear el cliente",
    },
    update: {
      is_pending: "Actualizando Cliente",
      success: {
        title: "Cliente Actualizado",
        description: "El cliente se actualizó correctamente.",
      },
      error: "Algo salió mal al actualizar el cliente",
    },
  },
  tickets: {
    error: "Error en el ticket",
    errors: {
      ticket_not_found: "No se encontró el ticket activo",
      product_not_found: "No se encontró el producto en el ticket",
      presentation_not_found:
        "No se encontró la presentación del producto",
      insufficient_stock: "Stock insuficiente para el producto",
    },
  },
};
