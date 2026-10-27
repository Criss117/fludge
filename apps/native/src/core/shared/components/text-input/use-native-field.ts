import { useNativeState } from "@expo/ui";
import { useCallback, useEffect, useState } from "react";
import { KeyboardController } from "react-native-keyboard-controller";
import { scheduleOnRN } from "react-native-worklets";

type Options = {
  initialText: string;
  onChangeText?: (text: string) => void; // corre en JS
  dismissKeyboardOnClear: boolean;
};

export function useNativeField({ initialText, onChangeText, dismissKeyboardOnClear }: Options) {
  const value = useNativeState(initialText);
  // Reactivo (value.get() no re-renderiza): para mostrar/ocultar la "X".
  const [hasText, setHasText] = useState(initialText.length > 0);

  const setText = useCallback(
    (next: string) => {
      "worklet";
      value.set(next);
      scheduleOnRN(setHasText, next.length > 0);
      if (onChangeText) scheduleOnRN(onChangeText, next);
    },
    [value, onChangeText],
  );

  const clear = useCallback(() => {
    if (dismissKeyboardOnClear) KeyboardController.dismiss();
    setText("");
  }, [dismissKeyboardOnClear, setText]);

  useEffect(() => {
    if (initialText === value.get()) return;

    setText(initialText);
  }, [initialText, setText, value]);

  return { value, hasText, setText, clear };
}
