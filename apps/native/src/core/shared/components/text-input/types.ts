import type { TextFieldKeyboardOptions } from "@expo/ui/jetpack-compose";
import type { ModifierConfig } from "@expo/ui/jetpack-compose/modifiers";
import type { ModifierConfig as SwiftUIModifierConfig } from "@expo/ui/swift-ui/modifiers";
import type { TranslationKey } from "@fludge/i18n/index";

import type { IconName } from "../icon";

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

export type TextInputProps = (TextModeProps | NumberModeProps) & {
  iconName?: IconName;
  label: TranslationKey;
  placeholder: TranslationKey;
  isError?: boolean;
  errors?: ({ message?: string } | undefined)[];
  minLines?: number;
  keyboardOptions?: TextFieldKeyboardOptions;
  modifiers?: SwiftUIModifierConfig[] | ModifierConfig[];
  withDebounce?: number;
  maxLines?: number;
};
