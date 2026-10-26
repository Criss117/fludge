import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import type { ProductFormSchema } from "@fludge/client/catalog/forms/product.form";
import { useProductForm } from "@fludge/client/catalog/forms/product.form";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@fludge/client/catalog/mutations/use-product.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { useState } from "react";

import { useMutationToast } from "@/integrations/toast";

import type { ProductFormScreenProps } from "./types";

export function useProductFormScreen({ action }: ProductFormScreenProps) {
  const router = useRouter();
  const createProduct = useCreateProductMutation();
  const updateProduct = useUpdateProductMutation();
  const createToast = useMutationToast();
  const updateToast = useMutationToast();

  const [selectedPresentation, setSelectedPresentation] = useState<
    ProductFormSchema["presentations"][number] | null
  >(null);

  const form = useProductForm(
    {
      onSubmit: ({ value }) => {
        if (action.type === "create") {
          createToast.showPending("forms.product.create_toast.pending");
          createProduct.mutate(
            {
              name: value.name,
              description: value.description,
              categoryId: value.categoryId,
              stock: value.stock,
              allowNegativeStock: value.allowNegativeStock,
              minStock: value.minStock,
              presentations: value.presentations.map((p) => ({
                barcode: p.barcode,
                conversionFactor: p.conversionFactor,
                name: p.name,
                pricePurchase: p.pricePurchase,
                priceSale: p.priceSale,
                priceWholesale: p.priceWholesale,
                status: p.status,
              })),
            },
            {
              onSuccess: () => {
                router.back();
                createToast.showSuccess("forms.product.create_toast.success");
              },
              onError: (e) => {
                createToast.showError(
                  "forms.product.create_toast.error",
                  e.message as TranslationKey,
                );
              },
            },
          );

          return;
        }

        updateToast.showPending("forms.product.update_toast.pending");
        updateProduct.mutate(
          {
            id: action.product.id,
            name: value.name,
            description: value.description,
            categoryId: value.categoryId,
            stock: value.stock,
            allowNegativeStock: value.allowNegativeStock,
            minStock: value.minStock,
            status: value.status,
            presentations: value.presentations.map((p) => ({
              barcode: p.barcode,
              conversionFactor: p.conversionFactor,
              id: p.id,
              name: p.name,
              pricePurchase: p.pricePurchase,
              priceSale: p.priceSale,
              priceWholesale: p.priceWholesale,
              status: p.status,
            })),
          },
          {
            onSuccess: () => {
              router.back();
              updateToast.showSuccess("forms.product.update_toast.success");
            },
            onError: (e) => {
              updateToast.showError(
                "forms.product.update_toast.error",
                e.message as TranslationKey,
              );
            },
          },
        );
      },
    },
    action.type === "update"
      ? {
          allowNegativeStock: action.product.allowNegativeStock,
          categoryId: action.product.categoryId ?? "",
          description: action.product.description,
          name: action.product.name,
          stock: action.product.stock,
          status: action.product.status,
          minStock: action.product.minStock,
          presentations: action.product.presentations.map((p) => ({
            barcode: p.barcode ?? "",
            conversionFactor: p.conversionFactor,
            id: p.id,
            name: p.name,
            pricePurchase: p.pricePurchase ?? 0,
            priceSale: p.priceSale,
            priceWholesale: p.priceWholesale ?? 0,
            status: p.status,
          })),
        }
      : undefined,
  );

  return {
    state: {
      form,
      selectedPresentation,
    },
    actions: {
      setSelectedPresentation,
      submit: form.handleSubmit,
    },
    texts: {
      sections: {
        basic_information: getI18nKey("forms.product.sections.basic_information"),
        stock: getI18nKey("forms.product.sections.stock"),
        presentations: {
          title: getI18nKey("forms.product.sections.presentations.title"),
          empty: getI18nKey("forms.product.sections.presentations.empty"),
        },
      },
      submit: getI18nKey("forms.product.submit"),
    },
  };
}
