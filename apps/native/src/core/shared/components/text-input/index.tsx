import type { ObservableState } from "@expo/ui/jetpack-compose";
import { Column, OutlinedTextField, Shape } from "@expo/ui/jetpack-compose";
import type { ModifierConfig } from "@expo/ui/jetpack-compose/modifiers";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import { NativeFieldError } from "@/core/shared/components/field-error";
import type { iconName } from "@/core/shared/components/icon";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { SPACING } from "@/lib/sp";

import type { InputModel } from "./input-model";
import type { SearchInputProps, TextInputProps } from "./types";
import { useFormInput } from "./use-form-input";

export const FIELD_SHAPE = Shape.RoundedCorner({
  cornerRadii: {
    topStart: SPACING.md,
    topEnd: SPACING.md,
    bottomStart: SPACING.md,
    bottomEnd: SPACING.md,
  },
});

export const TEXT_INPUT_HEIGHT = 64;

type FieldProps = {
  model: InputModel;
  iconName?: iconName;
  minLines?: number;
  maxLines?: number;
  modifiers?: ModifierConfig[];
  isError?: boolean;
  errors?: TextInputProps["errors"];
};

function OutlinedField({
  model,
  iconName,
  minLines,
  maxLines,
  modifiers,
  isError,
  errors,
}: FieldProps) {
  const themeColors = useThemeColor();
  const { actions, state, text } = model;

  const isSecure =
    state.resolvedKeyboardOptions?.keyboardType === "password" ||
    state.resolvedKeyboardOptions?.keyboardType === "numberPassword";

  return (
    <Column>
      <OutlinedTextField
        keyboardOptions={state.resolvedKeyboardOptions}
        minLines={minLines}
        maxLines={maxLines}
        modifiers={modifiers}
        textStyle={{ fontFamily: GeistFonts.Regular }}
        value={state.value as ObservableState<string>}
        onValueChange={actions.onValueChange}
        shape={FIELD_SHAPE}
        colors={{ cursorColor: themeColors.primary, focusedIndicatorColor: themeColors.primary }}
        visualTransformation={isSecure ? "password" : "none"}
      >
        <OutlinedTextField.Label>
          <ThemedNativeText>{text.label}</ThemedNativeText>
        </OutlinedTextField.Label>
        <OutlinedTextField.Placeholder>
          <ThemedNativeText variant="muted">{text.placeholder}</ThemedNativeText>
        </OutlinedTextField.Placeholder>
        {iconName !== undefined && (
          <OutlinedTextField.LeadingIcon>
            <Icon name={iconName} />
          </OutlinedTextField.LeadingIcon>
        )}
        {state.hasText && (
          <OutlinedTextField.Suffix>
            <Icon name="close" size={18} onPress={actions.clearInput} />
          </OutlinedTextField.Suffix>
        )}
      </OutlinedTextField>
      {isError && <NativeFieldError errors={errors} />}
    </Column>
  );
}

export function TextInput(props: TextInputProps) {
  return (
    <OutlinedField
      model={useFormInput(props)}
      iconName={props.iconName}
      minLines={props.minLines}
      maxLines={props.maxLines}
      modifiers={props.modifiers as ModifierConfig[] | undefined}
      isError={props.isError}
      errors={props.errors}
    />
  );
}

export function SearchInput({ label, onValueChange, placeholder, defaultValue }: SearchInputProps) {
  return (
    <TextInput
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      modifiers={[fillMaxWidth()]}
      iconName="search"
      placeholder={placeholder}
      label={label}
      keyboardOptions={{
        imeAction: "search",
        capitalization: "none",
        autoCorrectEnabled: false,
      }}
    />
  );
}
