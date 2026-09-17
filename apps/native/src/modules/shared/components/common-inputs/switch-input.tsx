import { Label } from "heroui-native/label";
import { ControlField } from "heroui-native/control-field";
import { Description } from "heroui-native/description";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { FieldError } from "../field-error";
import type { SwitchInputProps } from "./types";

export function SwitchInput({
  isSelected,
  onSelectedChange,
  description,
  isInvalid,
  errors,
  label,
}: SwitchInputProps) {
  const { t } = useTranslation();

  return (
    <ControlField
      isSelected={isSelected}
      onSelectedChange={onSelectedChange}
      isInvalid={isInvalid}
    >
      <View className="flex-row items-center py-2">
        <View className="flex-1 gap-x-4">
          <Label>{t(label)}</Label>
          {description && <Description>{t(description)}</Description>}
        </View>
        <ControlField.Indicator />
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </ControlField>
  );
}
