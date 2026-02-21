import z from "zod";

export const emailValidator = z.email("El correo electrónico no es válido");
export const phoneValidator = z
  .string("El teléfono no es válido")
  .min(10, "El teléfono debe tener al menos 10 caracteres")
  .max(15, "El teléfono no puede exceder 15 caracteres")
  .refine(
    (values) => {
      if (isNaN(Number(values))) {
        return false;
      }
      return true;
    },
    {
      error: "El teléfono debe contener solo números",
    },
  );
