import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { View } from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "heroui-native";
import { MaterialIcons } from "../icons";
import { FieldError } from "../field-error";
import type { NumberInputProps } from "./types";

export function NumberInput({
  isRequired,
  isInvalid,
  label,
  icon,
  errors,
  inputProps,
}: Omit<NumberInputProps, "label"> & {
  label?: NumberInputProps["label"];
}) {
  const { t } = useTranslation();

  // Buffer local de texto, independiente del número parseado
  const [text, setText] = useState(
    inputProps.value != null ? String(inputProps.value) : ""
  );

  // Sincroniza si el valor cambia desde afuera (ej. reset del form)
  useEffect(() => {
    const external = inputProps.value != null ? String(inputProps.value) : "";
    // Solo pisamos el texto si el número que representa es distinto
    // al que ya tenemos, para no interrumpir mientras el usuario escribe.
    if (Number(text) !== inputProps.value) {
      setText(external);
    }
  }, [inputProps.value]);

  const onChangeText = (v: string) => {
    // Permite estados intermedios válidos mientras se escribe
    if (v === "" || v === "-" || v === "." || v === "-.") {
      setText(v);
      return;
    }

    // Solo dígitos, un signo negativo opcional y un punto decimal opcional
    if (!/^-?\d*\.?\d*$/.test(v)) return;

    setText(v);

    const n = Number(v);
    if (!isNaN(n)) {
      inputProps.onChangeText?.(n);
    }
  };

  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired}>
      {label && <Label isInvalid={isInvalid}>{t(label)}</Label>}
      <View className="w-full flex-row items-center">
        <Input
          {...inputProps}
          value={text}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={t(inputProps.placeholder)}
          className={cn("flex-1 px-10", inputProps.className)}
          isInvalid={isInvalid}
        />
        {icon && (
          <View className="absolute inset-s-3.5" pointerEvents="none">
            <MaterialIcons size={20} name={icon} className="text-muted" />
          </View>
        )}
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}
