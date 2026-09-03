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

interface CommonInputProps {
  isRequired?: boolean;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  label: TranslationKey;
  icon: MaterialIconName;
  inputProps: ComponentProps<typeof Input>;
}

interface Props {
  isInvalid: boolean;
  id: string;
  value: string;
  onBlur: (e: BlurEvent) => void;
  onChangeText: (text: string) => void;
  errors?: Array<{ message?: string } | undefined>;
}

export function CommonInput({
  isRequired,
  isInvalid,
  label,
  icon,
  errors,
  inputProps,
}: CommonInputProps) {
  const { t } = useTranslation();

  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired}>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <View className="w-full flex-row items-center">
        <Input {...inputProps} className="flex-1 px-10" isInvalid={isInvalid} />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name={icon} className="text-muted" />
        </View>
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

export function DescriptionInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <TextField isInvalid={isInvalid}>
      <Label isInvalid={isInvalid}>Descripción (Opcional)</Label>
      <TextArea
        id={id}
        value={value}
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder="Describe el propósito de este grupo..."
        isInvalid={isInvalid}
      />
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

interface Props {
  isInvalid: boolean;
  id: string;
  value: string;
  onBlur: (e: BlurEvent) => void;
  onChangeText: (text: string) => void;
  errors?: Array<{ message?: string } | undefined>;
}

function EmailInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
      label="inputs.labels.user_email"
      icon="mail-outline"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder: "natalia@fludge.dev",
        keyboardType: "email-address",
      }}
    />
  );
}

function UserNameInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <CommonInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label="inputs.labels.user_name"
      icon="person"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder: "Natalia Arturo",
      }}
    />
  );
}

function PhoneInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
      label="inputs.labels.phone"
      icon="phone"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder: "3212345678",
        keyboardType: "phone-pad",
      }}
    />
  );
}

function PasswordInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>{t("inputs.labels.password")}</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          aria-invalid={isInvalid}
          placeholder="*********"
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

function AddressInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
      label="inputs.labels.address"
      icon="location-on"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder: "Ej. Calle de la casa, 123",
      }}
    />
  );
}

export const CommonInputs = {
  EmailInput,
  PasswordInput,
  UserNameInput,
  PhoneInput,
  AddressInput,
  DescriptionInput,
};
