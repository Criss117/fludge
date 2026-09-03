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
  inputProps: Omit<ComponentProps<typeof Input>, "placeholder"> & {
    placeholder: TranslationKey;
  };
}

interface Props {
  isInvalid: boolean;
  id: string;
  value: string;
  errors?: Array<{ message?: string } | undefined>;
  placeholder: TranslationKey;
  label: TranslationKey;
  onBlur: (e: BlurEvent) => void;
  onChangeText: (text: string) => void;
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

export function DescriptionInput({
  isInvalid,
  id,
  value,
  placeholder,
  label,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  const { t } = useTranslation();

  return (
    <TextField isInvalid={isInvalid}>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <TextArea
        id={id}
        value={value}
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder={t(placeholder)}
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
  label,
  placeholder,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
      label={label}
      icon="mail-outline"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder,
        keyboardType: "email-address",
      }}
    />
  );
}

function NameInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
  label,
  placeholder,
}: Props) {
  return (
    <CommonInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label={label}
      icon="person"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder,
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
  label,
  placeholder,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
      label={label}
      icon="phone"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder,
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
  label,
  placeholder,
}: Props) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          aria-invalid={isInvalid}
          placeholder={t(placeholder)}
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
  label,
  placeholder,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
      label={label}
      icon="location-on"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder,
      }}
    />
  );
}

export const CommonInputs = {
  EmailInput,
  PasswordInput,
  NameInput,
  PhoneInput,
  AddressInput,
  DescriptionInput,
};
