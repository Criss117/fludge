import {
  Card,
  Column,
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  HorizontalDivider,
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
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import type { ProductFormSchema } from "@fludge/client/catalog/forms/product.form";
import { useFindCategories } from "@fludge/client/catalog/queries/use-find-categories";
import type { MinimalField } from "@fludge/client/shared/field-api";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { MenuOptions } from "@/core/shared/components/menu-options";
import { FIELD_SHAPE, TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.product.name.label"
      placeholder="forms.product.name.placeholder"
      iconName="badge"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function DescriptionInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.product.description.label"
      placeholder="forms.product.description.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      minLines={5}
    />
  );
}

function StockInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      value={field.state.value}
      label="forms.product.stock.label"
      placeholder="forms.product.stock.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
    />
  );
}

function MinStockInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      value={field.state.value}
      label="forms.product.min_stock.label"
      placeholder="forms.product.min_stock.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
    />
  );
}

function AllowNegativeStockInput({ field }: FieldProps<boolean>) {
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
        value={field.state.value}
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

function PresentationCards({
  field,
  remove,
  restore,
  onSelect,
}: FieldProps<ProductFormSchema["presentations"]> & {
  remove: (id: string) => void;
  restore: (id: string) => void;
  onSelect: (p: ProductFormSchema["presentations"][number] | null) => void;
}) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <Column verticalArrangement={{ spacedBy: SPACING.md }} modifiers={[fillMaxWidth()]}>
      {field.state.value.map((p) => (
        <Card key={p.id} colors={{ containerColor: colors.surface }} modifiers={[fillMaxWidth()]}>
          <Column
            modifiers={[paddingAll(SPACING.md)]}
            verticalArrangement={{
              spacedBy: SPACING.md,
            }}
          >
            <Column>
              <Row verticalAlignment="center">
                <Row
                  horizontalAlignment="center"
                  verticalAlignment="bottom"
                  horizontalArrangement={{
                    spacedBy: SPACING.sm,
                  }}
                  modifiers={[weight(1)]}
                >
                  <ThemedNativeText variant="h5">{p.name}</ThemedNativeText>
                  <ThemedNativeText variant="muted">Factor x {p.conversionFactor}</ThemedNativeText>
                </Row>

                <MenuOptions
                  items={[
                    {
                      label: "helpers.navigation.update",
                      icon: "edit",
                      action: () => {
                        onSelect(p);
                      },
                    },
                    {
                      label: "helpers.navigation.delete",
                      icon: "delete",
                      action: () => {
                        remove(p.id);
                      },
                      color: "error",
                    },
                  ]}
                />
              </Row>

              <Row
                horizontalArrangement={{
                  spacedBy: SPACING.sm,
                }}
              >
                <Icon name="barcode" size={18} color={colors.outline} />
                <ThemedNativeText variant="muted">{p.barcode || "-"}</ThemedNativeText>
              </Row>
            </Column>

            <HorizontalDivider color={colors.outline} />
            <Column
              verticalArrangement={{
                spacedBy: SPACING.sm,
              }}
            >
              <Column>
                <ThemedNativeText variant="h6" color={colors.outline}>
                  {t("forms.product_presentation.price_sale.label")}
                </ThemedNativeText>
                <ThemedNativeText variant="h4" color={colors.tertiary}>
                  {formatCurrency(p.priceSale)}
                </ThemedNativeText>
              </Column>

              <Row horizontalArrangement="spaceBetween" modifiers={[fillMaxWidth()]}>
                <Column>
                  <ThemedNativeText variant="muted">
                    {t("forms.product_presentation.price_purchase.label")}
                  </ThemedNativeText>
                  <ThemedNativeText variant="h6">
                    {p.pricePurchase === 0 ? "-" : formatCurrency(p.pricePurchase)}
                  </ThemedNativeText>
                </Column>
                <Column>
                  <ThemedNativeText variant="muted">
                    {t("forms.product_presentation.price_wholesale.label")}
                  </ThemedNativeText>
                  <ThemedNativeText variant="h6">
                    {p.priceWholesale === 0 ? "-" : formatCurrency(p.priceWholesale)}
                  </ThemedNativeText>
                </Column>
              </Row>
            </Column>
          </Column>
        </Card>
      ))}
    </Column>
  );
}

export function CategorySelectInput({ field }: FieldProps<string>) {
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
