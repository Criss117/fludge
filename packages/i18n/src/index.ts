import { es } from "./locales/es";

// Utility para extraer rutas anidadas en notación de puntos
type LeafPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${LeafPaths<T[K]>}`
        : `${K}`;
    }[keyof T & string]
  : never;

// Exportas el tipo global para el monorrepo
export type TranslationKey = LeafPaths<typeof es>;

export { es } from "./locales/es";
