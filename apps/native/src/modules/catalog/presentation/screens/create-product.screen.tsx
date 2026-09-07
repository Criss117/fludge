import { KeyboardScrollView } from "@/modules/shared/components/keyboard-scroll-view";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useState, useTransition } from "react";
import { useProductForm } from "@fludge/client/presentation/catalog/product.form";
import { useCreateProductMutation } from "@fludge/client/application/catalog/mutations/use-product.mutations";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { ProductFormSchema } from "@fludge/client/application/catalog/form/product-form";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import {
  BasicInformationSection,
  PresentationFormsSection,
  PresentationsSection,
  StockSection,
} from "../components/product-form/sections";

type Presentation = ProductFormSchema["presentations"][number];

export function CreateProductScreen() {
  const router = useRouter();
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null);
  const [isPresentationFormOpen, setIsPresentationFormOpen] = useState(false);
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const createProduct = useCreateProductMutation();
  const mutationToast = useMutationToast("create-product-form");
  const form = useProductForm({
    onSubmit: ({ value }) => {
      mutationToast.showIsPendingToast("mutations.products.create.is_pending");
      startTransition(async () => {
        const tx = createProduct(value);

        await tx.isPersisted.promise
          .then(() => {
            mutationToast.showSuccessToast(
              "mutations.products.create.success.title",
              "mutations.products.create.success.description"
            );
            router.back();
          })
          .catch((error) => {
            mutationToast.showErrorToast(
              "mutations.products.create.error",
              error.message as TranslationKey
            );
          });
      });
    },
  });

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
          setSelectedPresentation={setSelectedPresentation}
        />
      </KeyboardScrollView>
      <View className="bg-background absolute bottom-0 w-full gap-y-4 px-3 py-6">
        <Button onPress={form.handleSubmit} isDisabled={isPending}>
          <MaterialIcons name="add-box" size={20} className="text-background" />
          <Button.Label className="text-background">
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
