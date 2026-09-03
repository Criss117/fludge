import { es } from "./locales/es";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

const resources = {
  es: { translation: es },
} as const;

export function buildI18n() {
  return i18n.use(initReactI18next).init({
    resources,
    lng: "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
    supportedLngs: ["es"],
  });
}
