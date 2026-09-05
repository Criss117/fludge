export const validators = {
  uuid: {
    invalid: "El id no es válido",
  },
  name: {
    required: "El nombre es requerido",
    min_length: "El nombre es demasiado corto",
    max_length: "El nombre es muy largo",
  },
  description: {
    invalid: "La descripción debe ser un texto",
    min_length: "La descripción es demasiado corta",
    max_length: "La descripción es muy larga",
  },
  phone: {
    invalid: "El teléfono es inválido",
    min_length: "Ingresa un número de teléfono válido",
    max_length: "El teléfono es muy largo",
  },
  email: {
    invalid: "El email es inválido",
  },
  status: {
    invalid: "El estado es inválido",
  },
  password: {
    invalid: "La contraseña es inválida",
    min_length: "La contraseña es muy corta",
    max_length: "La contraseña es muy larga",
  },
  array: {
    at_least_one: "Debes seleccionar al menos una opción",
    min_length: "La lista es muy corta",
    max_length: "La lista es muy larga",
  },
  legal_name: {
    required: "El nombre legal es requerido",
    min_length: "El nombre legal es demasiado corto",
    max_length: "El nombre legal es muy largo",
  },
  tax_id: {
    required: "El identificador fiscal es requerido",
    min_length: "El identificador fiscal es demasiado corto",
    max_length: "El identificador fiscal es muy largo",
  },
  address: {
    required: "La dirección es requerida",
    min_length: "La dirección es demasiado corta",
    max_length: "La dirección es muy larga",
  },
  barcode: {
    invalid: "El código de barras es inválido",
    min_length: "El código de barras es demasiado corto",
    max_length: "El código de barras es muy largo",
  },
  conversion_factor: {
    invalid: "El factor de conversión es inválido",
    positive: "El factor de conversión debe ser positivo",
    integer: "El factor de conversión debe ser un número entero",
  },
  price: {
    invalid: "El precio de venta es inválido",
    integer: "El precio de venta debe ser un número entero",
    positive: "El precio de venta debe ser positivo",
  },
  product_status: {
    invalid: "El estado del producto es inválido",
  },
  stock: {
    invalid: "El stock es inválido",
    integer: "El stock debe ser un número entero",
    positive: "El stock debe ser positivo",
  },
  min_stock: {
    invalid: "El stock mínimo es inválido",
    integer: "El stock mínimo debe ser un número entero",
    positive: "El stock mínimo debe ser positivo",
  },
};
