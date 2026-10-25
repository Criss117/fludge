import type { TextFieldKeyboardOptions } from "@expo/ui/jetpack-compose";

export const parseNumber = (raw: string) => {
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

export const toInitialText = (v: string | number | null | undefined, isNumber: boolean) => {
  if (v == null) return "";
  if (!isNumber) return String(v);
  const n = Number(v);
  return Number.isNaN(n) || n === 0 ? "" : String(n);
};

export const resolveKeyboardOptions = (
  isNumber: boolean,
  options?: TextFieldKeyboardOptions,
): TextFieldKeyboardOptions | undefined =>
  isNumber ? { keyboardType: "decimal", autoCorrectEnabled: false, ...options } : options;
