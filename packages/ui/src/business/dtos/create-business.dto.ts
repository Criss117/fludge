import { z } from "zod";

export const createBusinessDto = z.object({
  name: z
    .string({
      error: "El nombre de la empresa es obligatorio",
    })
    .min(3, {
      message: "El nombre de la empresa debe tener un mínimo de 3 caracteres",
    })
    .max(100, {
      message: "El nombre de la empresa debe tener un máximo de 100 caracteres",
    }),
  nit: z
    .string({
      error: "El NIT es obligatorio",
    })
    .min(3, { message: "El NIT debe tener un mínimo de 3 caracteres" })
    .max(20, { message: "El NIT debe tener un máximo de 20 caracteres" }),
  address: z
    .string({
      error: "La dirección es obligatoria",
    })
    .min(3, { message: "La dirección debe tener un mínimo de 3 caracteres" })
    .max(255, {
      message: "La dirección debe tener un máximo de 255 caracteres",
    }),
  city: z
    .string({
      error: "La ciudad es obligatoria",
    })
    .min(3, { message: "La ciudad debe tener un mínimo de 3 caracteres" })
    .max(255, { message: "La ciudad debe tener un máximo de 255 caracteres" }),
  state: z
    .string({
      error: "El estado es obligatorio",
    })
    .min(3, { message: "El estado debe tener un mínimo de 3 caracteres" })
    .max(255, { message: "El estado debe tener un máximo de 255 caracteres" })
    .nullable()
    .optional(),
});

export type CreateBusinessDto = z.infer<typeof createBusinessDto>;
