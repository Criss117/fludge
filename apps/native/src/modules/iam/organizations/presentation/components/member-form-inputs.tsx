import { FieldError } from "@/modules/shared/components/field-error";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { type BlurEvent, View } from "react-native";
import type { ComponentProps } from "react";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface Props {
  isInvalid: boolean;
  id: string;
  value: string;
  errors?: Array<{ message?: string } | undefined>;
  onBlur: (event: BlurEvent) => void;
  onChangeText: (text: string) => void;
}

function MemberInput({
  label,
  icon,
  placeholder,
  keyboardType,
  secureTextEntry,
  isInvalid,
  id,
  value,
  errors,
  onBlur,
  onChangeText,
}: Props & {
  label: string;
  icon: MaterialIconName;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
}) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>{label}</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name={icon} className="text-muted" />
        </View>
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

function EmailInput(props: Props) {
  return (
    <MemberInput
      {...props}
      label="Email"
      icon="mail-outline"
      keyboardType="email-address"
      placeholder="tu@correo.com"
    />
  );
}

function PasswordInput(props: Props) {
  return (
    <MemberInput
      {...props}
      label="Contraseña"
      icon="lock-outline"
      placeholder="Mínimo 6 caracteres"
      secureTextEntry
    />
  );
}

function PhoneInput(props: Props) {
  return (
    <MemberInput
      {...props}
      label="Número de Teléfono"
      icon="phone"
      keyboardType="phone-pad"
      placeholder="321-234-5678"
    />
  );
}

function NameInput(props: Props) {
  return (
    <MemberInput
      {...props}
      label="Nombre Completo"
      icon="person"
      placeholder="Ej. Juan Pérez"
    />
  );
}

export const MemberFormInputs = {
  EmailInput,
  PasswordInput,
  PhoneInput,
  NameInput,
};
