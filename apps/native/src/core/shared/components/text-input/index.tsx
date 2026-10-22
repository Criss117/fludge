import type { ObservableState } from "@expo/ui/jetpack-compose";
import { Column, OutlinedTextField, Shape } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import { NativeFieldError } from "@/core/shared/components/field-error";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { SPACING } from "@/lib/sp";

import type { SearchInputProps, TextInputProps } from "./types";
import { useTextInput } from "./use-text-input";

export const FIELD_SHAPE = Shape.RoundedCorner({
  cornerRadii: {
    topStart: SPACING.md,
    topEnd: SPACING.md,
    bottomStart: SPACING.md,
    bottomEnd: SPACING.md,
  },
});

export const TEXT_INPUT_HEIGHT = 64;

export function TextInput(props: TextInputProps) {
  const themeColors = useThemeColor();
  const { actions, state, text } = useTextInput(props);

  const isSecure =
    state.resolvedKeyboardOptions?.keyboardType === "password" ||
    state.resolvedKeyboardOptions?.keyboardType === "numberPassword";

  return (
    <Column>
      <OutlinedTextField
        {...props}
        keyboardOptions={state.resolvedKeyboardOptions}
        minLines={props.minLines}
        modifiers={props.modifiers}
        textStyle={{
          fontFamily: GeistFonts.Regular,
        }}
        value={state.value as ObservableState<string>}
        onValueChange={actions.onValueChange}
        shape={FIELD_SHAPE}
        colors={{
          cursorColor: themeColors.primary,
          focusedIndicatorColor: themeColors.primary,
        }}
        visualTransformation={isSecure ? "password" : "none"}
      >
        <OutlinedTextField.Label>
          <ThemedNativeText>{text.label}</ThemedNativeText>
        </OutlinedTextField.Label>
        <OutlinedTextField.Placeholder>
          <ThemedNativeText variant="muted">{text.placeholder}</ThemedNativeText>
        </OutlinedTextField.Placeholder>
        {props.iconName !== undefined && (
          <OutlinedTextField.LeadingIcon>
            <Icon name={props.iconName} />
          </OutlinedTextField.LeadingIcon>
        )}
        <OutlinedTextField.Suffix>
          <Icon name="close" size={18} onPress={actions.clearInput} />
        </OutlinedTextField.Suffix>
      </OutlinedTextField>
      {props.isError && <NativeFieldError errors={props.errors} />}
    </Column>
  );
}

export function SearchInput({ label, onValueChange, placeholder }: SearchInputProps) {
  return (
    <TextInput
      onValueChange={onValueChange}
      modifiers={[fillMaxWidth()]}
      iconName="search"
      placeholder={placeholder}
      label={label}
    />
  );
}
