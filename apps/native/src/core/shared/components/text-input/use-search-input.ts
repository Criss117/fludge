import { useDebouncedCallback } from "@/core/shared/hooks/use-debounce";

import { buildInputModel, useInputCopy } from "./input-model";
import type { SearchInputProps } from "./types";
import { useNativeField } from "./use-native-field";

export function useSearchInput(props: SearchInputProps) {
  const { onValueChange, debounce = 400 } = props;
  const debounced = useDebouncedCallback(onValueChange, debounce);

  const field = useNativeField({
    initialText: props.defaultValue ?? "",
    onChangeText: debounced,
    dismissKeyboardOnClear: props.dismissKeyboardOnClear ?? false,
  });

  return buildInputModel(field, useInputCopy(props), props.keyboardOptions);
}
