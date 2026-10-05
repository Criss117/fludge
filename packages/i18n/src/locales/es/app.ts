export const app = {
  title: "Fludge",

  loading: {
    organization: "Cargando organización...",
    fonts: "Cargando fuentes...",
    data: "Cargando datos...",
    session: "Cargando sesión...",
    database: "Cargando base de datos...",
    iam: "Obteniendo datos de la IAM...",
    catalog: "Cargando catálogo...",
    commerce: "Cargando comercio...",
    ticket: "Cargando ticket...",
    user_scope: "Cargando ámbito de usuario...",
  },

  errors: {
    fatal: {
      title: "¡Error fatal!",
      message: "Algo ha salido mal. Por favor, vuelva a intentarlo.",
      retry: "Intentar de nuevo",
    },
    db: {
      title: "Error de base de datos",
      message:
        "Algo salió mal al migrar la base de datos. Por favor, vuelva a intentarlo.",
    },
  },

  permissions: {
    camera: {
      required: "Necesitamos permisos para usar la cámara",
      request: "Permitir acceso a la cámara",
    },
  },
};
