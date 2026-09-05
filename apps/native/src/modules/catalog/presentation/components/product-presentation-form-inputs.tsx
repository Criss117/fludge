import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import { CommonInputs } from "@/modules/shared/components/common-input";
import { FieldError } from "@/modules/shared/components/field-error";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { CreateProductSchema } from "@fludge/client/application/catalog/form/product-form";
import type { MinimalField } from "@fludge/client/shared/field-api";
import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function Name({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isRequired
      isInvalid={isInvalid}
      icon="shopping-bag"
      errors={errors}
      label="forms.product_presentation.name.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product_presentation.name.placeholder",
      }}
    />
  );
}

function PriceSale({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.price_sale.label"
      icon="attach-money"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product_presentation.price_sale.placeholder",
      }}
    />
  );
}

function PriceWholesale({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.price_wholesale.label"
      icon="attach-money"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product_presentation.price_wholesale.placeholder",
      }}
    />
  );
}

function PricePurchase({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.price_purchase.label"
      icon="attach-money"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product_presentation.price_purchase.placeholder",
      }}
    />
  );
}

function ConversionFactor({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.conversion_factor.label"
      icon="storage"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product_presentation.conversion_factor.placeholder",
      }}
    />
  );
}

function Barcode({ field }: FieldProps<string>) {
  const { t } = useTranslation();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <TextField isInvalid={isInvalid}>
      <Label isInvalid={isInvalid}>
        {t("forms.product_presentation.barcode.label")}
      </Label>
      <View className="flex-row items-center gap-x-2">
        <View className="flex-1 flex-row items-center">
          <Input
            value={field.state.value}
            placeholder={t("forms.product_presentation.barcode.placeholder")}
            className="flex-1 px-10"
            isInvalid={isInvalid}
            onChangeText={field.handleChange}
          />
          <View className="absolute inset-s-3.5" pointerEvents="none">
            <MaterialIcons
              size={20}
              name="barcode-reader"
              className="text-muted"
            />
          </View>
        </View>
        <CameraDialog setBarcode={field.handleChange} />
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

export const ProductPresentationInputs = {
  Name,
  ConversionFactor,
  PriceSale,
  PriceWholesale,
  PricePurchase,
  Barcode,
};
