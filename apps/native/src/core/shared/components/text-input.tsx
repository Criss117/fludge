import {
  Column,
  OutlinedTextField,
  OutlinedTextFieldProps,
  Shape,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { ThemedNativeText } from "./themed-text";
import { useCallback } from "react";
import { scheduleOnRN } from "react-native-worklets";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import type { TranslationKey } from "@fludge/i18n/index";
import { useTranslation } from "react-i18next";
import { NativeFieldError } from "./field-error";

interface Props extends Omit<
  OutlinedTextFieldProps,
  "onValueChange" | "shape" | "value"
> {
  value?: string;
  placeholder: TranslationKey;
  onValueChange?: (value: string) => void;
  errors?: Array<{ message?: string } | undefined>;
}

const FIELD_SHAPE = Shape.RoundedCorner({
  cornerRadii: {
    topStart: SPACING.md,
    topEnd: SPACING.md,
    bottomStart: SPACING.md,
    bottomEnd: SPACING.md,
  },
});

export function TextInput({
  colors,
  placeholder,
  onValueChange,
  errors,
  value,
  ...props
}: Props) {
  const { t } = useTranslation();
  const themeColors = useThemeColor();
  const text = useNativeState(value ?? "");

  const handleValueChange = useCallback(
    (value: string) => {
      "worklet";
      text.set(value);

      if (onValueChange !== undefined) {
        scheduleOnRN(onValueChange, value);
      }
    },
    [text],
  );

  return (
    <Column>
      <OutlinedTextField
        {...props}
        value={text}
        onValueChange={handleValueChange}
        shape={FIELD_SHAPE}
        colors={
          colors ?? {
            cursorColor: themeColors.primary,
            focusedIndicatorColor: themeColors.primary,
            focusedLabelColor: themeColors.primary,
            errorLabelColor: themeColors.error,
          }
        }
      >
        <OutlinedTextField.Label>
          <ThemedNativeText>{t(placeholder)}</ThemedNativeText>
        </OutlinedTextField.Label>
      </OutlinedTextField>
      {props.isError && <NativeFieldError errors={errors} />}
    </Column>
  );
}
