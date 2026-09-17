import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { TextArea } from "heroui-native/text-area";
import { useTranslation } from "react-i18next";
import { cn } from "heroui-native";
import { FieldError } from "../field-error";
import type { TextAreaInputProps } from "./types";

export function TextAreaInput({
  isRequired,
  isInvalid,
  label,
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
        className={cn("flex-1", inputProps.className)}
        isInvalid={isInvalid}
      />
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}
