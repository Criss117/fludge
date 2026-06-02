import z from "zod";

import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/client";

export const signUpEmailCommand = z.object({
  email: z.email({
    error: "El email es requerido",
  }),
  password: z
    .string({
      error: "La contraseña es requerida",
    })
    .min(8, {
      error: "La contraseña es muy corta",
    })
    .max(50, {
      error: "La contraseña es muy larga",
    }),
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(50, {
      error: "El nombre es muy largo",
    }),
  phone: z
    .string({
      error: "El teléfono es requerido",
    })
    .min(9, {
      error: "El teléfono es muy corto",
    })
    .max(15, {
      error: "El teléfono es muy largo",
    }),
});

type CMD = z.infer<typeof signUpEmailCommand>;

export class SignUpCommand {
  constructor() {}

  public async execute(cmd: CMD, headers: Headers) {
    const [data, error] = await tryCatch(
      auth.api.signUpEmail({
        headers: headers,
        body: {
          email: cmd.email,
          password: cmd.password,
          name: cmd.name,
          phone: cmd.phone,
          isRoot: true,
        },
      }),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return data;
  }
}
