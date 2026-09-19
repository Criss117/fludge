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
  notes: {
    invalid: "La nota debe ser un texto",
    min_length: "La nota es demasiado corta",
    max_length: "La nota es muy larga",
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
    presentations: {
      at_least_one: "Debes tener al menos una presentación",
      min_length: "La lista de presentaciones es muy corta",
      max_length: "La lista de presentaciones es muy larga",
    },
    sale_items: {
      at_least_one: "Debes tener al menos un producto",
      min_length: "La lista de productos es muy corta",
      max_length: "La lista de productos es muy larga",
    },
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
  price_sale: {
    invalid: "El precio de venta es inválido",
    integer: "El precio de venta debe ser un número entero",
    positive: "El precio de venta debe ser positivo",
  },
  price_purchase: {
    invalid: "El precio de compra es inválido",
    integer: "El precio de compra debe ser un número entero",
    positive: "El precio de compra debe ser positivo",
  },
  price_wholesale: {
    invalid: "El precio de venta completa es inválido",
    integer: "El precio de venta completa debe ser un número entero",
    positive: "El precio de venta completa debe ser positivo",
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
  payment_type: {
    invalid: "El tipo de pago es inválido",
  },
  quantity: {
    invalid: "La cantidad es inválida",
    positive: "La cantidad debe ser mayor a 0",
  },
  document_type: {
    invalid: "El tipo de documento es inválido",
  },
  document_number: {
    invalid: "El número de documento es inválido",
    min_length: "El número de documento es demasiado corto",
    max_length: "El número de documento es muy largo",
  },
  credit_limit: {
    invalid: "El límite de crédito es inválido",
    non_negative: "El límite de crédito debe ser mayor o igual a 0",
  },
  contact: {
    required: "Debe proporcionar al menos un teléfono o email",
  },
  document: {
    pair_required:
      "El tipo y número de documento deben estar ambos presentes o ambos vacíos",
  },
};
