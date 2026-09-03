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
};
