import { MaterialIcons } from "@/modules/shared/components/icons";
import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { type BlurEvent, View } from "react-native";

interface Props {
  isInvalid: boolean;
  id: string;
  value: string;
  onBlur: (e: BlurEvent) => void;
  onChangeText: (text: string) => void;
}

function NameInput({ isInvalid, id, value, onBlur, onChangeText }: Props) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>Nombre Comercial</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder="Ej. Tienda Andres"
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="add-business" />
        </View>
      </View>
    </TextField>
  );
}

function LegalNameInput({ isInvalid, id, value, onBlur, onChangeText }: Props) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>Razón Social</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder="Ej. Tienda Andres S.A.S."
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="apartment" />
        </View>
      </View>
    </TextField>
  );
}

function TaxIdInput({ isInvalid, id, value, onBlur, onChangeText }: Props) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>
        Identificación Fiscal (Tax ID / NIT / RFC)
      </Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder="Ingresa el código único"
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="badge" />
        </View>
      </View>
    </TextField>
  );
}

function AddressInput({ isInvalid, id, value, onBlur, onChangeText }: Props) {
  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>Dirección Comercial</Label>
      <View className="w-full flex-row items-center">
        <Input
          className="flex-1 px-10"
          isInvalid={isInvalid}
          id={id}
          value={value}
          onBlur={onBlur}
          onChangeText={onChangeText}
          aria-invalid={isInvalid}
          placeholder="Ej. Calle de la casa, 123"
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="location-on" />
        </View>
      </View>
    </TextField>
  );
}

function PhoneInput({ isInvalid, id, value, onBlur, onChangeText }: Props) {
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

export const OrganizationFormInputs = {
  NameInput,
  LegalNameInput,
  TaxIdInput,
  AddressInput,
  PhoneInput,
};
