import { buildI18n, es } from "@fludge/i18n/index";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof es;
    };
  }
}

const i18n = buildI18n();

export default i18n;
