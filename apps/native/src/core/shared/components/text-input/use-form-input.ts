import { useCallback } from "react";

import { parseNumber, resolveKeyboardOptions, toInitialText } from "./helpers";
import { buildInputModel, useInputCopy } from "./input-model";
import type { TextInputProps } from "./types";
import { useNativeField } from "./use-native-field";

export function useFormInput(props: TextInputProps) {
  const { type, onValueChange } = props;
  const isNumber = type === "number";

  const emit = useCallback(
    (raw: string) => {
      if (type === "number") onValueChange?.(parseNumber(raw));
      else onValueChange?.(raw);
    },
    [type, onValueChange],
  );

  const field = useNativeField({
    initialText: toInitialText(props.defaultValue, isNumber),
    onChangeText: onValueChange ? emit : undefined,
    dismissKeyboardOnClear: props.dismissKeyboardOnClear ?? true,
  });

  return buildInputModel(
    field,
    useInputCopy(props),
    resolveKeyboardOptions(isNumber, props.keyboardOptions),
  );
}
