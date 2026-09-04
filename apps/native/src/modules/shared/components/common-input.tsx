import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { BlurEvent, View } from "react-native";
import { MaterialIcons } from "./icons";
import { FieldError } from "./field-error";
import { useState, type ComponentProps } from "react";
import { Button } from "heroui-native/button";
import { TextArea } from "heroui-native/text-area";
import { useTranslation } from "react-i18next";
import { TranslationKey } from "@fludge/i18n/index";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface TextInputProps {
  isRequired?: boolean;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  label: TranslationKey;
  icon: MaterialIconName;
  inputProps: Omit<ComponentProps<typeof Input>, "placeholder"> & {
    placeholder: TranslationKey;
  };
}

interface TextAreaInputProps {
  isRequired?: boolean;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  label: TranslationKey;
  icon: MaterialIconName;
  inputProps: Omit<ComponentProps<typeof TextArea>, "placeholder"> & {
    placeholder: TranslationKey;
  };
}

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
          className="flex-1 px-10"
          isInvalid={isInvalid}
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name={icon} className="text-muted" />
        </View>
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

export function TextAreaInput({
  isRequired,
  isInvalid,
  label,
  icon,
  errors,
  inputProps,
}: TextAreaInputProps) {
  const { t } = useTranslation();

  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired}>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <TextArea
        {...inputProps}
        placeholder={t(inputProps.placeholder)}
        className="flex-1 px-10"
        isInvalid={isInvalid}
      />
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

function PasswordInput({
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
          className="flex-1 px-10"
          {...inputProps}
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

export const CommonInputs = {
  TextInput,
  TextAreaInput,
  PasswordInput,
};
