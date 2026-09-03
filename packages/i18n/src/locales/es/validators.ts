export const validators = {
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
};
