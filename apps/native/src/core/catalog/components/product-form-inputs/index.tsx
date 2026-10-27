import {
  Column,
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  OutlinedTextField,
  Row,
  Switch,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  menuAnchor,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useFindCategories } from "@fludge/client/catalog/queries/use-find-categories";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { FIELD_SHAPE, TextInput } from "@/core/shared/components/text-input";
import type { InputProps } from "@/core/shared/components/text-input/types";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { PresentationCards } from "./shared";

function NameInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.product.name.label"
      placeholder="forms.product.name.placeholder"
      iconName="badge"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function DescriptionInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.product.description.label"
      placeholder="forms.product.description.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      minLines={5}
      defaultValue={field.state.value}
    />
  );
}

function StockInput({ field }: InputProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.product.stock.label"
      placeholder="forms.product.stock.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
      defaultValue={field.state.value}
    />
  );
}

function MinStockInput({ field }: InputProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.product.min_stock.label"
      placeholder="forms.product.min_stock.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
      defaultValue={field.state.value}
    />
  );
}

function AllowNegativeStockInput({ field }: InputProps<boolean>) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <Row
      modifiers={[
        fillMaxWidth(),
        clickable(() => field.handleChange(!field.state.value)),
        padding(SPACING.sm, 0, SPACING.sm, 0),
      ]}
    >
      <Column modifiers={[weight(1)]}>
        <ThemedNativeText>{t("forms.product.allow_negative_stock.label")}</ThemedNativeText>
        <ThemedNativeText variant="muted">
          {t("forms.product.allow_negative_stock.placeholder")}
        </ThemedNativeText>
      </Column>
      <Switch
        value={field.state.value ?? false}
        onCheckedChange={field.handleChange}
        colors={{
          checkedTrackColor: colors.primary,
          uncheckedTrackColor: colors.surface,
          checkedBorderColor: colors.primary,
          uncheckedBorderColor: colors.primary,
          uncheckedThumbColor: colors.secondary,
        }}
      />
    </Row>
  );
}

export function CategorySelectInput({ field }: InputProps<string>) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [expanded, setExpanded] = useState(false);
  const { data } = useFindCategories();

  const categories = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const selectedLabel = useNativeState("");

  useEffect(() => {
    const selected = categories.find((c) => c.id === field.state.value);
    selectedLabel.set(selected?.name ?? "");
  }, [categories, field.state.value, selectedLabel]);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <ExposedDropdownMenuBox
      expanded={expanded}
      onExpandedChange={setExpanded}
      modifiers={[fillMaxWidth()]}
    >
      <OutlinedTextField
        value={selectedLabel}
        readOnly
        modifiers={[menuAnchor(), fillMaxWidth()]}
        isError={isInvalid}
        shape={FIELD_SHAPE}
        colors={{
          focusedIndicatorColor: colors.primary,
          unfocusedIndicatorColor: colors.outline,
          cursorColor: colors.primary,
          focusedLabelColor: colors.primary,
          unfocusedLabelColor: colors.outline,
        }}
      >
        <OutlinedTextField.Label>
          <ThemedNativeText>{t("forms.product.category.label")}</ThemedNativeText>
        </OutlinedTextField.Label>
        <OutlinedTextField.Placeholder>
          <ThemedNativeText variant="muted">
            {t("forms.product.category.placeholder")}
          </ThemedNativeText>
        </OutlinedTextField.Placeholder>
      </OutlinedTextField>

      <ExposedDropdownMenu
        expanded={expanded}
        onDismissRequest={() => setExpanded(false)}
        containerColor={colors.surface}
      >
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => {
              field.handleChange(category.id);
              selectedLabel.set(category.name);
              setExpanded(false);
            }}
          >
            <DropdownMenuItem.Text>
              <ThemedNativeText color={colors.onSurface}>{category.name}</ThemedNativeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </ExposedDropdownMenu>
    </ExposedDropdownMenuBox>
  );
}

export const ProductFormInputs = {
  CategorySelectInput,
  NameInput,
  DescriptionInput,
  StockInput,
  MinStockInput,
  AllowNegativeStockInput,
  PresentationCards,
};
