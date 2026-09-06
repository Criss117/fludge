import { KeyboardScrollView } from "@/modules/shared/components/keyboard-scroll-view";
import { useCreateProductForm } from "@fludge/client/presentation/iam/product.form";
import { Card } from "heroui-native/card";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ProductFormInputs } from "../components/product-form/shared";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Separator } from "heroui-native/separator";
import { useState } from "react";
import { PresentationCard } from "../components/product-form/presentation-card";
import type { CreateProductSchema } from "@fludge/client/application/catalog/form/product-form";
import {
  CreatePresentationForm,
  UpdatePresentationForm,
} from "../components/product-form/presentation-form";

type Presentation = CreateProductSchema["presentations"][number];

export function CreateProductScreen() {
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null);
  const [isPresentationFormOpen, setIsPresentationFormOpen] = useState(false);
  const { t } = useTranslation();
  const form = useCreateProductForm({
    onSubmit: ({ value }) => {
      console.log(value);
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
        <Card className="gap-y-2">
          <Card.Header>
            <Card.Title>{t("forms.product.sections.basic")}</Card.Title>
          </Card.Header>
          <Separator />
          <Card.Body className="gap-y-2">
            <form.Field
              name="name"
              children={(field) => <ProductFormInputs.Name field={field} />}
            />
            <form.Field
              name="description"
              children={(field) => (
                <ProductFormInputs.Description field={field} />
              )}
            />
            <form.Field
              name="categoryId"
              children={(field) => (
                <ProductFormInputs.CategorySelect field={field} />
              )}
            />
          </Card.Body>
        </Card>

        <Card className="gap-y-2">
          <Card.Header>
            <Card.Title>{t("forms.product.sections.stock")}</Card.Title>
          </Card.Header>
          <Separator />

          <Card.Body className="gap-y-2">
            <View className="flex-row items-start gap-x-2">
              <View className="flex-1">
                <form.Field
                  name="stock"
                  children={(field) => (
                    <ProductFormInputs.Stock field={field} />
                  )}
                />
              </View>
              <View className="flex-1">
                <form.Field
                  name="minStock"
                  children={(field) => (
                    <ProductFormInputs.MinStock field={field} />
                  )}
                />
              </View>
            </View>
            <form.Field
              name="allowNegativeStock"
              children={(field) => (
                <ProductFormInputs.AllowNegativeStock field={field} />
              )}
            />
          </Card.Body>
        </Card>

        <Card className="gap-y-2">
          <Card.Header className="flex-row items-start">
            <View className="flex-1">
              <Card.Title>
                {t("forms.product.sections.presentations.title")}
              </Card.Title>
              <Card.Description>
                {t("forms.product.sections.presentations.description")}
              </Card.Description>
            </View>

            <Button size="sm" onPressIn={() => setIsPresentationFormOpen(true)}>
              <MaterialIcons name="add" size={20} className="text-background" />
              <Button.Label className="text-background">
                {t("helpers.add")}
              </Button.Label>
            </Button>
          </Card.Header>
          <Card.Body className="gap-y-2">
            <form.AppField name="presentations">
              {(field) => (
                <field.Presentations>
                  {({ field, remove }) => {
                    return field.state.value.map((presentation) => (
                      <PresentationCard
                        key={presentation.id}
                        presentation={presentation}
                        remove={remove}
                        setSelectedPresentation={setSelectedPresentation}
                      />
                    ));
                  }}
                </field.Presentations>
              )}
            </form.AppField>
          </Card.Body>
          <Card.Footer className="mt-5">
            <Button
              variant="outline"
              className="border-muted border-dashed"
              onPressIn={() => setIsPresentationFormOpen(true)}
            >
              <MaterialIcons name="add" size={20} className="text-muted" />
              <Button.Label className="text-muted">
                {t("forms.product.sections.presentations.add")}
              </Button.Label>
            </Button>
          </Card.Footer>
        </Card>
      </KeyboardScrollView>
      <View className="bg-background absolute bottom-0 w-full gap-y-4 px-3 py-6">
        <Button onPress={form.handleSubmit}>
          <MaterialIcons name="add-box" size={20} className="text-background" />
          <Button.Label className="text-background">
            {t("forms.product.create")}
          </Button.Label>
        </Button>
      </View>
      <form.AppField name="presentations">
        {(field) => (
          <field.Presentations>
            {({ add }) => (
              <CreatePresentationForm
                isOpen={isPresentationFormOpen}
                onOpenChange={setIsPresentationFormOpen}
                onSubmit={(value) => {
                  add({
                    name: value.name,
                    barcode: value.barcode,
                    conversionFactor: value.conversionFactor,
                    priceSale: value.priceSale,
                    pricePurchase: value.pricePurchase,
                    priceWholesale: value.priceWholesale,
                    id: crypto.randomUUID(),
                  });
                }}
              />
            )}
          </field.Presentations>
        )}
      </form.AppField>
      <form.AppField name="presentations">
        {(field) => (
          <field.Presentations>
            {({ update }) => (
              <UpdatePresentationForm
                selectedPresentation={selectedPresentation}
                clearSelectedPresentation={() => setSelectedPresentation(null)}
                onSubmit={(value) => {
                  update(value.id, {
                    name: value.name,
                    barcode: value.barcode,
                    conversionFactor: value.conversionFactor,
                    priceSale: value.priceSale,
                    pricePurchase: value.pricePurchase,
                    priceWholesale: value.priceWholesale,
                    id: crypto.randomUUID(),
                  });
                }}
              />
            )}
          </field.Presentations>
        )}
      </form.AppField>
    </View>
  );
}
