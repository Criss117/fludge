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
import { Icon, type IconName } from "./icon";
import { useDebouncedCallback } from "../hooks/use-debounce";
import { GeistFonts } from "@/integrations/fonts";

interface Props extends Omit<
  OutlinedTextFieldProps,
  "onValueChange" | "shape" | "value"
> {
  value?: string;
  placeholder: TranslationKey;
  label: TranslationKey;
  onValueChange?: (value: string) => void;
  errors?: Array<{ message?: string } | undefined>;
  iconName?: IconName;
  withDebounce?: number;
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
  label,
  onValueChange,
  errors,
  value,
  iconName,
  withDebounce,
  textStyle,
  ...props
}: Props) {
  const { t } = useTranslation();
  const themeColors = useThemeColor();
  const text = useNativeState(value ?? "");

  const debouncedChange = useDebouncedCallback((v: string) => {
    onValueChange?.(v);
  }, withDebounce ?? 400);

  const handleValueChange = useCallback(
    (value: string) => {
      "worklet";
      text.set(value);

      if (onValueChange !== undefined) {
        if (withDebounce !== undefined) {
          scheduleOnRN(debouncedChange, value);
          return;
        }

        scheduleOnRN(onValueChange, value);
      }
    },
    [text],
  );

  return (
    <Column>
      <OutlinedTextField
        {...props}
        textStyle={{
          ...textStyle,
          fontFamily: GeistFonts.Regular,
        }}
        value={text}
        onValueChange={handleValueChange}
        shape={FIELD_SHAPE}
        colors={
          colors ?? {
            cursorColor: themeColors.primary,
            focusedIndicatorColor: themeColors.primary,
          }
        }
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
