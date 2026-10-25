import type { TextFieldKeyboardOptions } from "@expo/ui/jetpack-compose";
import type { TranslationKey } from "@fludge/i18n/index";
import { useTranslation } from "react-i18next";

import type { IconName } from "../icon";
import type { useNativeField } from "./use-native-field";

type CopyProps = { label?: TranslationKey; placeholder?: TranslationKey; iconName?: IconName };

export function useInputCopy({ label, placeholder, iconName }: CopyProps) {
  const { t } = useTranslation();
  return {
    label: label ? t(label) : undefined,
    placeholder: placeholder ? t(placeholder) : undefined,
    iconName,
  };
}

export function buildInputModel(
  field: ReturnType<typeof useNativeField>,
  text: ReturnType<typeof useInputCopy>,
  resolvedKeyboardOptions?: TextFieldKeyboardOptions,
) {
  return {
    text,
    actions: { onValueChange: field.setText, clearInput: field.clear },
    state: { value: field.value, hasText: field.hasText, resolvedKeyboardOptions },
  };
}

export type InputModel = ReturnType<typeof buildInputModel>;
