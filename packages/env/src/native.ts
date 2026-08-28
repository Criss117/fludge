import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_SERVER_URL: z.url().default("http://192.168.0.102:3000"),
  },
  // Metro requiere la lectura explícita para inyectar el valor en el paquete final
  runtimeEnv: {
    EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
  },
  emptyStringAsUndefined: true,
});
