import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Button } from "heroui-native/button";
import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import type { Dispatch, SetStateAction } from "react";
import { type BlurEvent, View } from "react-native";

interface Props {
  isInvalid: boolean;
  id: string;
  value: string;
  onBlur: (e: BlurEvent) => void;
  onChangeText: (text: string) => void;
}

export function EmailInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
}: Props) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>Correo Electrónico</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder="natalia@fludge.dev"
          keyboardType="email-address"
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="mail-outline" />
        </View>
      </View>
    </TextField>
  );
}

export function PasswordInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  setShowPassword,
  showPassword,
}: Props & {
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  showPassword: boolean;
}) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>Contraseña</Label>
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
          <MaterialIcons size={20} name="lock-outline" />
        </View>
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setShowPassword((prev) => !prev)}
          className="absolute inset-e-0"
        >
          {showPassword ? (
            <MaterialIcons name="visibility-off" size={20} />
          ) : (
            <MaterialIcons name="visibility" size={20} />
          )}
        </Button>
      </View>
    </TextField>
  );
}

export function NameInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
}: Props) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>Nombre Completo</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder="Natalia Arturo"
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="person" />
        </View>
      </View>
    </TextField>
  );
}

export function PhoneInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
}: Props) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>Número de Teléfono</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder="321-234-5678"
          keyboardType="phone-pad"
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="phone" />
        </View>
      </View>
    </TextField>
  );
}
