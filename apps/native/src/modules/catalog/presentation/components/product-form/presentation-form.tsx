import { BottomSheet } from "heroui-native/bottom-sheet";
import { Separator } from "heroui-native/separator";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ProductPresentationFormInputs } from "./shared";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useCallback, useEffect, useMemo } from "react";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { KeyboardController } from "react-native-keyboard-controller";
import { useBottomSheetAwareHandlers } from "heroui-native";
import {
  useProductPresentationForm,
  type ProductFormSchema,
} from "@fludge/client/application/catalog/form/product-form";

type Presentation = ProductFormSchema["presentations"][number];

interface CreatePresentationFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: Presentation) => void;
}

interface UpdatePresentationFormProps {
  selectedPresentation: Presentation | null;
  clearSelectedPresentation: () => void;
  onSubmit: (values: Presentation) => void;
}

interface SheetContentProps {
  form: ReturnType<typeof useProductPresentationForm>;
}

interface SheetFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  handleSubmit: () => void;
  children: React.ReactNode;
}

function SheetContent({ form }: SheetContentProps) {
  const { onFocus } = useBottomSheetAwareHandlers();

  return (
    <View className="mb-4 gap-y-2 px-3">
      <form.Field name="name">
        {(field) => (
          <ProductPresentationFormInputs.Name field={field} onFocus={onFocus} />
        )}
      </form.Field>
      <form.Field name="barcode">
        {(field) => (
          <ProductPresentationFormInputs.Barcode
            field={field}
            onFocus={onFocus}
          />
        )}
      </form.Field>
      <View className="gap-y-2">
        <View className="flex-1 flex-row gap-x-2">
          <View className="flex-1">
            <form.Field name="conversionFactor">
              {(field) => (
                <ProductPresentationFormInputs.ConversionFactor
                  field={field}
                  onFocus={onFocus}
                />
              )}
            </form.Field>
          </View>
          <View className="flex-1">
            <form.Field name="priceSale">
              {(field) => (
                <ProductPresentationFormInputs.PriceSale
                  field={field}
                  onFocus={onFocus}
                />
              )}
            </form.Field>
          </View>
        </View>

        <View className="flex-1 flex-row gap-x-2">
          <View className="flex-1">
            <form.Field name="pricePurchase">
              {(field) => (
                <ProductPresentationFormInputs.PricePurchase
                  field={field}
                  onFocus={onFocus}
                />
              )}
            </form.Field>
          </View>

          <View className="flex-1">
            <form.Field name="priceWholesale">
              {(field) => (
                <ProductPresentationFormInputs.PriceWholesale
                  field={field}
                  onFocus={onFocus}
                />
              )}
            </form.Field>
          </View>
        </View>
      </View>
    </View>
  );
}

function SheetForm({
  isOpen,
  onOpenChange,
  handleSubmit,
  children,
}: SheetFormProps) {
  const { t } = useTranslation();
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  const closeSheet = () => onOpenChange(false);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <View className="pb-safe-offset-8 bg-overlay px-4">
          <Separator className="-mx-4 mb-3" />
          <View className="flex-row gap-x-2">
            <Button variant="outline" className="flex-1" onPress={closeSheet}>
              <MaterialIcons
                name="close"
                size={20}
                className="text-foreground"
              />
              <Button.Label className="text-foreground">
                {t("helpers.cancel")}
              </Button.Label>
            </Button>
            <Button className="flex-1" onPress={handleSubmit}>
              <MaterialIcons name="add" size={20} className="text-background" />
              <Button.Label className="text-background">
                {t("helpers.add")}
              </Button.Label>
            </Button>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [t, handleSubmit, closeSheet]
  );

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={snapPoints}
          enableOverDrag={false}
          enableDynamicSizing={false}
          className="gap-y-4"
          footerComponent={renderFooter}
          contentContainerClassName="px-0 h-full"
          onClose={() => {
            KeyboardController.dismiss();
          }}
          keyboardBehavior="extend"
        >
          <View className="flex-row items-center justify-between gap-4 px-3 pb-3">
            <BottomSheet.Title maxFontSizeMultiplier={1.2} numberOfLines={1}>
              {t("forms.product.sections.presentations.add")}
            </BottomSheet.Title>
            <BottomSheet.Close />
          </View>

          <Separator className="pb-safe-offset -mx-5" />

          <BottomSheetScrollView
            contentContainerClassName="pb-safe-offset-32"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

export function CreatePresentationForm({
  isOpen,
  onOpenChange,
  onSubmit,
}: CreatePresentationFormProps) {
  const form = useProductPresentationForm({
    onSubmit: ({ value, resetForm }) => {
      onSubmit(value);
      resetForm();
      onOpenChange(false);
    },
  });

  return (
    <SheetForm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      handleSubmit={form.handleSubmit}
    >
      <SheetContent form={form} />
    </SheetForm>
  );
}

export function UpdatePresentationForm({
  clearSelectedPresentation,
  selectedPresentation,
  onSubmit,
}: UpdatePresentationFormProps) {
  const form = useProductPresentationForm({
    onSubmit: ({ value, resetForm }) => {
      onSubmit(value);
      resetForm();
      clearSelectedPresentation();
    },
  });

  useEffect(() => {
    if (!selectedPresentation) return;

    form.setFieldValue("id", selectedPresentation.id);
    form.setFieldValue("name", selectedPresentation.name);
    form.setFieldValue("barcode", selectedPresentation.barcode);
    form.setFieldValue(
      "conversionFactor",
      selectedPresentation.conversionFactor
    );
    form.setFieldValue("priceSale", selectedPresentation.priceSale);
    form.setFieldValue("pricePurchase", selectedPresentation.pricePurchase);
    form.setFieldValue("priceWholesale", selectedPresentation.priceWholesale);
  }, [selectedPresentation]);

  return (
    <SheetForm
      isOpen={selectedPresentation !== null}
      onOpenChange={(v) => {
        if (!v) clearSelectedPresentation();
      }}
      handleSubmit={form.handleSubmit}
    >
      <SheetContent form={form} />
    </SheetForm>
  );
}
