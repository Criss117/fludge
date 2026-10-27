import type { TextFieldRef } from "@expo/ui/swift-ui";
import { Button, HStack, SecureField, TextField, VStack } from "@expo/ui/swift-ui";
import type { ModifierConfig, ObservableState } from "@expo/ui/swift-ui/modifiers";
import {
  Animation,
  animation,
  background,
  buttonStyle,
  clipShape,
  cornerRadius,
  foregroundStyle,
  frame,
  glassEffect,
  keyboardType,
  labelStyle,
  offset,
  onTapGesture,
  opacity,
  padding,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useCallback, useMemo, useState } from "react";
import { KeyboardController } from "react-native-keyboard-controller";

import { Icon } from "@/core/shared/components/icon";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { NativeFieldError } from "../field-error";
import { ThemedNativeText } from "../themed-text";
import type { SearchInputProps, TextInputProps } from "./types";
import { useFormInput } from "./use-form-input";
import { useSearchInput } from "./use-search-input";

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
  const { actions, state, text } = useFormInput(props);

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

  const modifiers = useMemo(() => {
    const keyboardModifiers = keyboardTypeModifiers(state.resolvedKeyboardOptions);
    const extraModifiers = props.modifiers as ModifierConfig[] | undefined;

    if (!extraModifiers) return keyboardModifiers;

    return [...keyboardModifiers, ...extraModifiers];
  }, [state.resolvedKeyboardOptions, props.modifiers]);

  return (
    <VStack alignment="leading" spacing={0}>
      <HStack
        modifiers={[
          padding({
            horizontal: SPACING.sm,
          }),
        ]}
      >
        <ThemedNativeText variant="muted">{text.label}</ThemedNativeText>
      </HStack>
      <HStack
        modifiers={[
          padding({
            vertical: SPACING.md,
            horizontal: SPACING.md,
          }),
          frame({ maxWidth: Infinity }),
          background(themeColors.surfaceContainerHigh),
          cornerRadius(SPACING.xl),
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
            placeholder={text.placeholder}
            modifiers={modifiers}
          />
        ) : (
          <TextField
            axis={props.axis}
            ref={refCallback}
            text={state.value as ObservableState<string>}
            onTextChange={actions.onValueChange}
            placeholder={text.placeholder}
            modifiers={modifiers}
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

export function SearchInput(props: SearchInputProps) {
  const colors = useThemeColor();
  const [isFocused, setIsFocused] = useState(false);
  const { actions, state, text } = useSearchInput(props);

  const onCancel = useCallback(() => {
    KeyboardController.dismiss();
    actions.onValueChange("");
    setIsFocused(false);
  }, [actions]);

  const showCancelButton = isFocused || state.hasText;

  return (
    <HStack
      spacing={0}
      modifiers={[
        frame({ width: Infinity }),
        // anima todo lo que cambie dentro de este HStack cuando cambia isFocused
        animation(Animation.spring({ duration: 0.35, bounce: 0.1 }), showCancelButton),
      ]}
    >
      <HStack
        modifiers={[
          frame({
            width: Infinity,
          }),
          background(colors.surfaceContainerHigh),
          cornerRadius(SPACING.xl),
          glassEffect({
            glass: {
              variant: showCancelButton ? "clear" : "identity",
            },
          }),
        ]}
      >
        <HStack
          modifiers={[
            padding({
              vertical: SPACING.sm,
              horizontal: SPACING.md,
            }),
          ]}
        >
          <Icon name="search" size={18} color={colors.outline} />
          <TextField
            onFocusChange={setIsFocused}
            text={state.value as ObservableState<string>}

            onTextChange={actions.onValueChange}
            placeholder={text.label}
            modifiers={[
              frame({
                width: Infinity,
              }),
              foregroundStyle(colors.onSurface),
              tint(colors.primary),
            ]}
          >
            <TextField.Placeholder>
              <ThemedNativeText nested variant="muted">
                {text.placeholder}
              </ThemedNativeText>
            </TextField.Placeholder>
          </TextField>
        </HStack>
      </HStack>
      <Button
        onPress={onCancel}
        modifiers={[
          buttonStyle("glass"),
          clipShape("circle"),
          background("transparent"),
          // 0 de ancho cuando no hay foco: el search bar ocupa todo
          frame({ width: showCancelButton ? SPACING.xl : 0, height: SPACING.xl }),
          padding({ leading: showCancelButton ? SPACING.sm : 0 }),
          opacity(showCancelButton ? 1 : 0),
          offset({ x: showCancelButton ? 0 : SPACING.xl }), // entra desde la derecha
        ]}
      >
        <Icon name="close" size={22} color={colors.onPrimaryContainer} />
      </Button>
    </HStack>
  );
}
