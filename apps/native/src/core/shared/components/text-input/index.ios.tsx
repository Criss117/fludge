import type { TextFieldRef } from "@expo/ui/swift-ui";
import { Button, HStack, SecureField, TextField, VStack } from "@expo/ui/swift-ui";
import type { ModifierConfig, ObservableState } from "@expo/ui/swift-ui/modifiers";
import {
  background,
  cornerRadius,
  frame,
  keyboardType,
  labelStyle,
  onTapGesture,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useCallback, useState } from "react";

import { Icon } from "@/core/shared/components/icon";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { NativeFieldError } from "../field-error";
import type { TextInputProps } from "./types";
import { useTextInput } from "./use-text-input";

function keyboardTypeModifiers(type: TextInputProps["keyboardOptions"]): ModifierConfig[] {
  if (!type || !type.keyboardType) return [];

  switch (type.keyboardType) {
    case "text":
      return [keyboardType("default")];
    case "number":
      return [keyboardType("numeric")];
    case "email":
      return [keyboardType("email-address")];
    case "phone":
      return [keyboardType("phone-pad")];
    case "decimal":
      return [keyboardType("decimal-pad")];
    case "password":
      // En Compose, Password usa teclado de texto sin autocorrección.
      // En iOS ocultar el texto se maneja con SecureField, no con el teclado.
      return [keyboardType("default")];
    case "ascii":
      return [keyboardType("ascii-capable")];
    case "uri":
      return [keyboardType("url")];
    case "numberPassword":
      // Teclado numérico para PIN; en iOS el ocultamiento también es SecureField.
      return [keyboardType("numeric")];
    default:
      return [keyboardType("default")];
  }
}

export function TextInput(props: TextInputProps) {
  const themeColors = useThemeColor();
  const { actions, state, text } = useTextInput(props);

  const [textFieldNode, setTextFieldNode] = useState<TextFieldRef | null>(null);

  const isSecure =
    state.resolvedKeyboardOptions?.keyboardType === "password" ||
    state.resolvedKeyboardOptions?.keyboardType === "numberPassword";

  const refCallback = useCallback((node: TextFieldRef) => {
    if (node) {
      setTextFieldNode(node);
    }
  }, []);

  const onFocus = useCallback(() => {
    if (textFieldNode) {
      textFieldNode.focus();
    }
  }, [textFieldNode]);

  return (
    <VStack alignment="leading">
      <HStack
        modifiers={[
          padding({
            vertical: SPACING.md,
            horizontal: SPACING.md,
          }),
          frame({
            width: Infinity,
          }),
          background(themeColors.surfaceContainerHigh),
          cornerRadius(SPACING.md),
          onTapGesture(onFocus),
        ]}
      >
        {text.iconName !== undefined && (
          <Icon name={text.iconName} size={18} color={themeColors.outline} />
        )}
        {isSecure ? (
          <SecureField
            ref={refCallback}
            text={state.value as ObservableState<string>}
            onTextChange={actions.onValueChange}
            placeholder={text.label}
            modifiers={[
              ...keyboardTypeModifiers(state.resolvedKeyboardOptions),
              frame({
                width: Infinity,
              }),
            ]}
          />
        ) : (
          <TextField
            ref={refCallback}
            text={state.value as ObservableState<string>}
            onTextChange={actions.onValueChange}
            placeholder={text.label}
            modifiers={[
              ...keyboardTypeModifiers(state.resolvedKeyboardOptions),
              frame({
                width: Infinity,
              }),
            ]}
          />
        )}

        <Button modifiers={[labelStyle("iconOnly")]} onPress={actions.clearInput}>
          <Icon name="close" size={14} color={themeColors.outline} />
        </Button>
      </HStack>

      {props.isError && <NativeFieldError errors={props.errors} />}
    </VStack>
  );
}
