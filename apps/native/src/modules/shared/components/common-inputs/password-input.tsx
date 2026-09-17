import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { View } from "react-native";
import { useState } from "react";
import { Button } from "heroui-native/button";
import { useTranslation } from "react-i18next";
import { cn } from "heroui-native";
import { MaterialIcons } from "../icons";
import { FieldError } from "../field-error";
import type { TextInputProps } from "./types";

export function PasswordInput({
  isInvalid,
  errors,
  label,
  inputProps,
}: Omit<TextInputProps, "icon" | "isRequired">) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <View className="w-full flex-row items-center">
        <Input
          {...inputProps}
          className={cn("flex-1 px-10", inputProps.className)}
          placeholder={t(inputProps.placeholder)}
          secureTextEntry={!showPassword}
          aria-invalid={isInvalid}
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="lock-outline" className="text-muted" />
        </View>
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setShowPassword((prev) => !prev)}
          className="absolute inset-e-0"
        >
          {showPassword ? (
            <MaterialIcons
              name="visibility-off"
              size={20}
              className="text-muted"
            />
          ) : (
            <MaterialIcons name="visibility" size={20} className="text-muted" />
          )}
        </Button>
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}
