import {
  BottomSheet,
  Button,
  Group,
  HStack,
  List,
  Spacer,
  Toggle,
  VStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  controlSize,
  cornerRadius,
  frame,
  lineLimit,
  padding,
  presentationDetents,
  presentationDragIndicator,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useFindCategories } from "@fludge/client/catalog/queries/use-find-categories";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { TextInput } from "@/core/shared/components/text-input";
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
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function DescriptionInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.product.description.label"
      placeholder="forms.product.description.placeholder"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      minLines={5}
      modifiers={[
        lineLimit(5),
        frame({ height: SPACING["3xl"], alignment: "top" }),
        padding({ all: 8 }),
      ]}
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
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
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
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
    />
  );
}

function AllowNegativeStockInput({ field }: InputProps<boolean>) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <HStack
      modifiers={[
        padding({
          vertical: SPACING.md,
          horizontal: SPACING.md,
        }),
        frame({ maxWidth: Infinity }),
        background(colors.surfaceContainerHigh),
        cornerRadius(SPACING.xl),
      ]}
    >
      <Toggle
        isOn={field.state.value ?? false}
        onIsOnChange={field.handleChange}
        modifiers={[tint(colors.primary)]}
      >
        <ThemedNativeText>{t("forms.product.allow_negative_stock.label")}</ThemedNativeText>
        <ThemedNativeText variant="muted">
          {t("forms.product.allow_negative_stock.placeholder")}
        </ThemedNativeText>
      </Toggle>
    </HStack>
  );
}

export function CategorySelectInput({ field }: InputProps<string>) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [expanded, setExpanded] = useState(false);
  const { data } = useFindCategories();

  const categories = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const selected = useMemo(
    () => categories.find((c) => c.id === field.state.value) ?? null,
    [categories, field.state.value],
  );

  return (
    <VStack>
      <BottomSheet
        isPresented={expanded}
        onIsPresentedChange={setExpanded}
        anchor={
          <Button
            onPress={() => setExpanded(true)}
            modifiers={[
              buttonStyle("borderedProminent"),
              controlSize("large"),
              tint(colors.surfaceContainer),
            ]}
          >
            <HStack modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
              <ThemedNativeText variant={selected === null ? "muted" : "base"}>
                {selected?.name ?? t("forms.product.category.label")}
              </ThemedNativeText>
            </HStack>
          </Button>
        }
      >
        <Group
          modifiers={[
            presentationDetents(["medium", "large"]),
            presentationDragIndicator("visible"),
          ]}
        >
          <List>
            {categories.map((item) => (
              <Button
                key={item.id}
                onPress={() => {
                  field.handleChange(item.id);
                  setExpanded(false);
                }}
              >
                <HStack>
                  <ThemedNativeText>{item.name}</ThemedNativeText>
                  <Spacer />
                  {selected?.id === item.id && (
                    <Icon name="check" size={18} color={colors.primary} />
                  )}
                </HStack>
              </Button>
            ))}
          </List>
        </Group>
      </BottomSheet>
    </VStack>
  );
}

export const ProductFormInputs = {
  NameInput,
  DescriptionInput,
  StockInput,
  MinStockInput,
  AllowNegativeStockInput,
  CategorySelectInput,
  PresentationCards,
};
