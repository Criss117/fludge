import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { cn } from "heroui-native";
import { MaterialIcons } from "../icons";
import { FieldError } from "../field-error";
import type { TextInputProps } from "./types";

export function TextInput({
  isRequired,
  isInvalid,
  label,
  icon,
  errors,
  inputProps,
}: TextInputProps) {
  const { t } = useTranslation();

  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired}>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <View className="w-full flex-row items-center">
        <Input
          {...inputProps}
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
