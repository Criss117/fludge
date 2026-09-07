import { KeyboardScrollView } from "@/modules/shared/components/keyboard-scroll-view";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useState, useTransition } from "react";
import { useProductForm } from "@fludge/client/presentation/catalog/product.form";
import { useUpdateProductMutation } from "@fludge/client/application/catalog/mutations/use-product.mutations";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import { useRouter } from "expo-router";
import type { ProductFormSchema } from "@fludge/client/application/catalog/form/product-form";
import type { TranslationKey } from "@fludge/i18n/index";
import type { ProductDetail } from "@fludge/client/application/catalog/queries/use-find-products";
import {
  BasicInformationSection,
  PresentationFormsSection,
  PresentationsSection,
  StockSection,
} from "../components/product-form/sections";

interface Props {
  product: ProductDetail;
}

type Presentation = ProductFormSchema["presentations"][number];

export function UpdateProductScreen({ product }: Props) {
  const router = useRouter();
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null);
  const [isPresentationFormOpen, setIsPresentationFormOpen] = useState(false);
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const updateProduct = useUpdateProductMutation();
  const mutationToast = useMutationToast("update-product-form");
  const form = useProductForm(
    {
      onSubmit: ({ value }) => {
        mutationToast.showIsPendingToast(
          "mutations.products.update.is_pending"
        );

        // console.log(value);
        // return;

        startTransition(async () => {
          const tx = updateProduct(value);

          await tx.isPersisted.promise
            .then(() => {
              mutationToast.showSuccessToast(
                "mutations.products.update.success.title",
                "mutations.products.update.success.description"
              );
              router.back();
            })
            .catch((error) => {
              mutationToast.showErrorToast(
                "mutations.products.update.error",
                error.message as TranslationKey
              );
            });
        });
      },
    },
    {
      name: product.name,
      description: product.description,
      categoryId: product.categoryId ?? "",
      stock: product.stock,
      allowNegativeStock: product.allowNegativeStock,
      minStock: product.minStock,
      status: product.status,
      id: product.id,
      presentations: product.presentations.map((p) => ({
        barcode: p.barcode ?? "",
        conversionFactor: p.conversionFactor,
        id: p.id,
        name: p.name,
        pricePurchase: p.pricePurchase ?? 0,
        priceSale: p.priceSale,
        priceWholesale: p.priceWholesale ?? 0,
        delete: false,
        status: p.status,
      })),
    }
  );

  return (
    <View className="relative flex-1">
      <KeyboardScrollView
        contentContainerClassName="gap-y-4"
        className="px-3"
        paddingBottom={128}
        showsVerticalScrollIndicator={false}
      >
        <BasicInformationSection form={form} />

        <StockSection form={form} />

        <PresentationsSection
          form={form}
          onOpenChange={setIsPresentationFormOpen}
          action="update"
          setSelectedPresentation={setSelectedPresentation}
        />
      </KeyboardScrollView>
      <View className="bg-background absolute bottom-0 w-full gap-y-4 px-3 py-6">
        <Button onPress={form.handleSubmit} isDisabled={isPending}>
          <MaterialIcons name="add-box" size={20} className="text-eclipse" />
          <Button.Label className="text-eclipse">
            {t("forms.product.update")}
          </Button.Label>
        </Button>
      </View>
      <PresentationFormsSection
        form={form}
        isOpen={isPresentationFormOpen}
        onOpenChange={setIsPresentationFormOpen}
        selectedPresentation={selectedPresentation}
        setSelectedPresentation={setSelectedPresentation}
      />
    </View>
  );
}
