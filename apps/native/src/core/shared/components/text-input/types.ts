import type { TextFieldKeyboardOptions } from "@expo/ui/jetpack-compose";
import type { ModifierConfig } from "@expo/ui/jetpack-compose/modifiers";
import type { ModifierConfig as SwiftUIModifierConfig } from "@expo/ui/swift-ui/modifiers";
import type { TranslationKey } from "@fludge/i18n/index";

import type { IconName } from "../icon";

type TextMode = {
  type?: "text";
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
};

type NumberMode = {
  type: "number";
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
};

export type TextInputProps = (TextMode | NumberMode) & {
  iconName?: IconName;
  label: TranslationKey;
  placeholder: TranslationKey;
  isError?: boolean;
  errors?: ({ message?: string } | undefined)[];
  minLines?: number;
  maxLines?: number;
  keyboardOptions?: TextFieldKeyboardOptions;
  axis?: "horizontal" | "vertical";
  modifiers?: SwiftUIModifierConfig[] | ModifierConfig[];
  dismissKeyboardOnClear?: boolean;
};

export interface SearchInputProps {
  onValueChange: (text: string) => void;
  label: TranslationKey;
  placeholder: TranslationKey;
  defaultValue?: string;
  /** ms. Por defecto 400. */
  debounce?: number;
  keyboardOptions?: TextFieldKeyboardOptions;
  dismissKeyboardOnClear?: boolean;
}
