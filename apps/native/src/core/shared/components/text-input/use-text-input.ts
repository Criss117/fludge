import { useNativeState } from "@expo/ui";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardController } from "react-native-keyboard-controller";
import { scheduleOnRN } from "react-native-worklets";

import { useDebouncedCallback } from "@/core/shared/hooks/use-debounce";

// useDebouncedCallback: el mismo import que ya usas
import type { TextInputProps } from "./types";

const parseNumber = (raw: string) => {
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

const toText = (v: string | number | null | undefined, isNumber: boolean) => {
  if (v === null || v === undefined) return "";
  if (isNumber) {
    const n = Number(v);
    return Number.isNaN(n) || n === 0 ? "" : String(n);
  }
  return String(v);
};

export function useTextInput(props: TextInputProps) {
  const { t } = useTranslation();
  const isNumber = props.type === "number";
  const externalText = toText(props.value, isNumber);
  const text = useNativeState(externalText);

  // Reactivo (text.get() no re-renderiza): sirve para mostrar/ocultar la "X".
  const [hasText, setHasText] = useState(externalText.length > 0);
  const [prevExternalText, setPrevExternalText] = useState(externalText);

  // Cambio externo (reset, setValue, carga async): se ajusta durante el render,
  // sin setState dentro de un efecto.
  if (externalText !== prevExternalText) {
    setPrevExternalText(externalText);
    setHasText(externalText.length > 0);
  }

  // Sincroniza el campo nativo cuando el valor externo cambia
  // sin pisar lo que el usuario está escribiendo ("1.", "-", "0.", "1,5").
  useEffect(() => {
    const current = text.get();
    if (current === externalText) return;
    if (isNumber && parseNumber(current) === (Number(props.value) || 0)) return;
    text.set(externalText);
  }, [externalText, isNumber, text, props.value]);

  // Corre en el hilo JS: aquí se parsea y se entrega al consumidor.
  const emit = useCallback(
    (raw: string) => {
      if (!props.onValueChange) return;
      if (isNumber) {
        (props.onValueChange as (v: number) => void)(parseNumber(raw));
      } else {
        (props.onValueChange as (v: string) => void)(raw);
      }
    },
    [props.onValueChange, isNumber],
  );

  const debouncedEmit = useDebouncedCallback(emit, props.withDebounce ?? 400);

  const onValueChange = useCallback(
    (next: string) => {
      "worklet";
      text.set(next);
      // Solo re-renderiza al pasar de vacío a con texto (o al revés).
      scheduleOnRN(setHasText, next.length > 0);

      if (!props.onValueChange) return;

      if (props.withDebounce !== undefined) {
        scheduleOnRN(debouncedEmit, next);
        return;
      }

      scheduleOnRN(emit, next);
    },
    [text, props.onValueChange, props.withDebounce, debouncedEmit, emit],
  );

  const clearInput = useCallback(() => {
    // En formularios cierra el teclado; en buscadores se desactiva con la prop.
    if (props.dismissKeyboardOnClear ?? true) KeyboardController.dismiss();

    onValueChange("");
  }, [onValueChange, props.dismissKeyboardOnClear]);

  const resolvedKeyboardOptions = isNumber
    ? {
        keyboardType: "decimal" as const,
        autoCorrectEnabled: false,
        ...props.keyboardOptions,
      }
    : props.keyboardOptions;

  return {
    text: {
      placeholder: props.placeholder ? t(props.placeholder) : undefined,
      label: props.label ? t(props.label) : undefined,
      iconName: props.iconName,
    },
    actions: {
      onValueChange,
      clearInput,
    },
    state: {
      resolvedKeyboardOptions,
      value: text,
      hasText,
    },
  };
}
