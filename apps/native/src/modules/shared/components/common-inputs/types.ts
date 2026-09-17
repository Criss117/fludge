import type { ComponentProps } from "react";
import type { Input } from "heroui-native/input";
import type { TextArea } from "heroui-native/text-area";
import type { TranslationKey } from "@fludge/i18n/index";

type MaterialIconName = ComponentProps<
  typeof import("../icons").MaterialIcons
>["name"];

export interface BaseInputProps {
  isRequired?: boolean;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  label: TranslationKey;
  icon?: MaterialIconName;
}

export interface TextInputProps extends BaseInputProps {
  inputProps: Omit<ComponentProps<typeof Input>, "placeholder"> & {
    placeholder: TranslationKey;
  };
}

export interface SwitchInputProps extends BaseInputProps {
  isSelected: boolean;
  onSelectedChange: (v: boolean) => void;
  description?: TranslationKey;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectInputProps extends BaseInputProps {
  options: Array<SelectOption>;
  onChange: (v: SelectOption) => void;
  value?: SelectOption;
}

export interface SearchableSelectProps extends BaseInputProps {
  onChange: (v: SelectOption) => void;
  value?: SelectOption;

  /** Search query controlled externally (e.g., passed to useSuspenseInfiniteQuery) */
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;

  /** Flat list of items (parent flattens from data.pages) */
  items: Array<SelectOption>;

  /** Infinite scroll support */
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage?: boolean;

  /** Custom empty message key (defaults to "screens.categories.not_found") */
  emptyMessageKey?: TranslationKey;
}

export interface NumberInputProps extends BaseInputProps {
  inputProps: Omit<
    ComponentProps<typeof Input>,
    "placeholder" | "value" | "onChangeText"
  > & {
    placeholder: TranslationKey;
    value: number;
    onChangeText: (v: number) => void;
  };
}

export interface TextAreaInputProps {
  isRequired?: boolean;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  label: TranslationKey;
  inputProps: Omit<ComponentProps<typeof TextArea>, "placeholder"> & {
    placeholder: TranslationKey;
  };
}
