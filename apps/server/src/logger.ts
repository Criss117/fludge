import pino from "pino";
import { env } from "@fludge/env/server";

const isDevelopment = env.NODE_ENV === "development";
const isProduction = env.NODE_ENV === "production";

export const logger = pino({
  level: env.LOG_LEVEL || (isProduction ? "info" : "debug"),

  // Configuración base
  messageKey: "message",

  // Formateo condicional: pretty en desarrollo, JSON en producción
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        messageKey: "message",
        singleLine: false,
      },
    },
  }),

  // Información adicional útil
  base: {
    env: env.NODE_ENV,
    ...(isProduction && {
      revision: env.GIT_COMMIT || undefined,
    }),
  },

  // Serializers para objetos comunes
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },

  // Redactar información sensible
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.secret",
      "*.apiKey",
    ],
    remove: true,
  },

  // Timestamp en formato ISO
  timestamp: pino.stdTimeFunctions.isoTime,
});
