import type { OutlinedTextFieldProps } from "@expo/ui/jetpack-compose";
import { Column, OutlinedTextField, Shape, useNativeState } from "@expo/ui/jetpack-compose";
import type { TranslationKey } from "@fludge/i18n/index";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { scheduleOnRN } from "react-native-worklets";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { SPACING } from "@/lib/sp";

import { useDebouncedCallback } from "../hooks/use-debounce";
import { NativeFieldError } from "./field-error";
import { Icon, type IconName } from "./icon";
import { ThemedNativeText } from "./themed-text";

type TextModeProps = {
  type?: "text";
  value?: string | null;
  onValueChange?: (value: string) => void;
};

type NumberModeProps = {
  type: "number";
  value?: number | null;
  onValueChange?: (value: number) => void;
};

type Props = Omit<OutlinedTextFieldProps, "onValueChange" | "shape" | "value"> &
  (TextModeProps | NumberModeProps) & {
    placeholder: TranslationKey;
    label: TranslationKey;
    errors?: ({ message?: string } | undefined)[];
    iconName?: IconName;
    withDebounce?: number;
  };

export const FIELD_SHAPE = Shape.RoundedCorner({
  cornerRadii: {
    topStart: SPACING.md,
    topEnd: SPACING.md,
    bottomStart: SPACING.md,
    bottomEnd: SPACING.md,
  },
});

export const TEXT_INPUT_HEIGHT = 64;

/** "1,5" (teclado es-CO) -> 1.5. Vacío o inválido ("-", ".") -> 0. */
const parseNumber = (raw: string) => {
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

/** Texto a mostrar. En modo number, 0/null/undefined/NaN se muestran vacíos. */
const toText = (v: string | number | null | undefined, isNumber: boolean) => {
  if (v === null || v === undefined) return "";
  if (isNumber) {
    const n = Number(v);
    return Number.isNaN(n) || n === 0 ? "" : String(n);
  }
  return String(v);
};

export function TextInput({
  colors,
  placeholder,
  label,
  onValueChange,
  errors,
  value,
  type = "text",
  iconName,
  withDebounce,
  textStyle,
  modifiers,
  minLines,
  keyboardOptions,
  ...props
}: Props) {
  const { t } = useTranslation();
  const themeColors = useThemeColor();
  const isNumber = type === "number";
  const externalText = toText(value, isNumber);
  const text = useNativeState(externalText);

  // Sincroniza cuando el valor externo cambia (reset, setValue, carga async)
  // sin pisar lo que el usuario está escribiendo ("1.", "-", "0.", "1,5").
  useEffect(() => {
    const current = text.value;
    if (current === externalText) return;
    if (isNumber && parseNumber(current) === (Number(value) || 0)) return;
    text.set(externalText);
  }, [externalText, isNumber, text, value]);

  // Corre en el hilo JS: aquí se parsea y se entrega al consumidor.
  const emit = useCallback(
    (raw: string) => {
      if (!onValueChange) return;
      if (isNumber) {
        (onValueChange as (v: number) => void)(parseNumber(raw));
      } else {
        (onValueChange as (v: string) => void)(raw);
      }
    },
    [onValueChange, isNumber],
  );

  const debouncedEmit = useDebouncedCallback(emit, withDebounce ?? 400);

  const handleValueChange = useCallback(
    (next: string) => {
      "worklet";
      text.set(next);

      if (!onValueChange) return;

      if (withDebounce !== undefined) {
        scheduleOnRN(debouncedEmit, next);
        return;
      }

      scheduleOnRN(emit, next);
    },
    [text, onValueChange, withDebounce, debouncedEmit, emit],
  );

  const resolvedKeyboardOptions = isNumber
    ? {
        keyboardType: "decimal" as const,
        autoCorrectEnabled: false,
        ...keyboardOptions,
      }
    : keyboardOptions;

  return (
    <Column>
      <OutlinedTextField
        {...props}
        keyboardOptions={resolvedKeyboardOptions}
        minLines={minLines}
        modifiers={modifiers}
        textStyle={{
          ...textStyle,
          fontFamily: GeistFonts.Regular,
        }}
        value={text}
        onValueChange={handleValueChange}
        shape={FIELD_SHAPE}
        colors={{
          ...colors,
          cursorColor: themeColors.primary,
          focusedIndicatorColor: themeColors.primary,
        }}
      >
        <OutlinedTextField.Label>
          <ThemedNativeText>{t(label)}</ThemedNativeText>
        </OutlinedTextField.Label>
        <OutlinedTextField.Placeholder>
          <ThemedNativeText variant="muted">{t(placeholder)}</ThemedNativeText>
        </OutlinedTextField.Placeholder>
        {iconName !== undefined && (
          <OutlinedTextField.LeadingIcon>
            <Icon name={iconName} />
          </OutlinedTextField.LeadingIcon>
        )}
        <OutlinedTextField.Suffix>
          <Icon name="close" size={18} onPress={() => handleValueChange("")} />
        </OutlinedTextField.Suffix>
      </OutlinedTextField>
      {props.isError && <NativeFieldError errors={errors} />}
    </Column>
  );
}
