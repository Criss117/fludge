import { MaterialIcons } from "@/modules/shared/components/icons";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import {
  type PresentationsFieldChildrenProps,
  useCreateProductForm,
} from "@fludge/client/presentation/iam/product.form";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ProductFormInputs } from "../components/product-form-inputs";
import { ProductPresentationInputs } from "../components/product-presentation-form-inputs";
import { Chip } from "heroui-native/chip";
import { Separator } from "heroui-native/separator";
import { useRouter } from "expo-router";
import { useCreateProductMutation } from "@fludge/client/application/catalog/mutations/use-product.mutations";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import { TranslationKey } from "@fludge/i18n/index";

const PADDING_BOTTOM = 20;

function PresentationsSection({
  addPresentation,
  removePresentation,
  field,
  canRemovePresentation,
  form,
}: PresentationsFieldChildrenProps & {
  form: ReturnType<typeof useCreateProductForm>;
}) {
  const { t } = useTranslation();

  return (
    <View className="gap-y-2">
      <View className="flex-row items-start gap-x-1 gap-y-2">
        <View className="flex-1">
          <Card.Title>
            {t("forms.product.sections.presentations.title")}
          </Card.Title>
          <Card.Description>
            {t("forms.product.sections.presentations.description")}
          </Card.Description>
        </View>
        <View>
          <Button
            size="sm"
            onPress={() => {
              addPresentation();
            }}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              className="text-foreground"
            />
            <Button.Label>{t("helpers.add")}</Button.Label>
          </Button>
        </View>
      </View>
      {field.state.value.map((_, i) => (
        <Card key={i}>
          <Card.Header className="flex-row items-center gap-x-2">
            <View className="flex-1 flex-row items-center gap-x-1">
              <Chip>
                <Chip.Label>{i + 1}</Chip.Label>
              </Chip>
              <Card.Title>
                {t("resources.presentations.single")} #{i + 1}
              </Card.Title>
            </View>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={() => removePresentation(i)}
              isDisabled={!canRemovePresentation}
            >
              <MaterialIcons
                name="delete-outline"
                size={20}
                className="text-red-500"
              />
            </Button>
          </Card.Header>
          <Card.Body className="gap-y-2">
            <form.Field name={`presentations[${i}].name`}>
              {(subField) => (
                <ProductPresentationInputs.Name field={subField} />
              )}
            </form.Field>
            <form.Field name={`presentations[${i}].barcode`}>
              {(subField) => (
                <ProductPresentationInputs.Barcode field={subField} />
              )}
            </form.Field>
            <View className="gap-y-1">
              <View className="flex-row items-start gap-x-1">
                <View className="flex-1">
                  <form.Field name={`presentations[${i}].conversionFactor`}>
                    {(subField) => (
                      <ProductPresentationInputs.ConversionFactor
                        field={subField}
                      />
                    )}
                  </form.Field>
                </View>
                <View className="flex-1">
                  <form.Field name={`presentations[${i}].priceSale`}>
                    {(subField) => (
                      <ProductPresentationInputs.PriceSale field={subField} />
                    )}
                  </form.Field>
                </View>
              </View>
              <View className="flex-row items-start gap-x-1">
                <View className="flex-1">
                  <form.Field name={`presentations[${i}].priceWholesale`}>
                    {(subField) => (
                      <ProductPresentationInputs.PriceWholesale
                        field={subField}
                      />
                    )}
                  </form.Field>
                </View>
                <View className="flex-1">
                  <form.Field name={`presentations[${i}].pricePurchase`}>
                    {(subField) => (
                      <ProductPresentationInputs.PricePurchase
                        field={subField}
                      />
                    )}
                  </form.Field>
                </View>
              </View>
            </View>
          </Card.Body>
        </Card>
      ))}

      <Button
        className="border-muted border border-dashed"
        variant="ghost"
        onPress={() => addPresentation()}
      >
        <MaterialIcons
          name="add-circle-outline"
          size={20}
          className="text-muted"
        />
        <Button.Label className="text-muted">
          {t("forms.product_presentation.add_variant")}
        </Button.Label>
      </Button>
    </View>
  );
}

export function CreateProductScreen() {
  const mutationToast = useMutationToast("create_product");
  const router = useRouter();
  const createProductMutation = useCreateProductMutation();
  const { t } = useTranslation();
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const form = useCreateProductForm({
    onSubmit: ({ value, resetForm }) => {
      mutationToast.showIsPendingToast("mutations.products.create.is_pending");

      const tx = createProductMutation(value);

      tx.isPersisted.promise
        .then(() => {
          mutationToast.showSuccessToast(
            "mutations.products.create.success.title",
            "mutations.products.create.success.description"
          );
          resetForm();
          router.back();
        })
        .catch((err) => {
          mutationToast.showErrorToast(
            "mutations.products.create.error",
            err.message as TranslationKey
          );
        });
    },
  });

  const fakeView = useAnimatedStyle(() => {
    const h = height.get();

    return {
      height: Math.abs(h),
      marginBottom: h > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  return (
    <View className="relative flex-1">
      <ScrollView
        className="flex-1 px-3"
        contentContainerClassName="pb-32 gap-y-5"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Card.Header>
            <Card.Title>{t("forms.product.create")}</Card.Title>
          </Card.Header>
          <Card.Body className="gap-y-2">
            <form.Field name="name">
              {(field) => <ProductFormInputs.NameInput field={field} />}
            </form.Field>
            <form.Field name="description">
              {(field) => <ProductFormInputs.DescriptionInput field={field} />}
            </form.Field>
            <form.Field name="categoryId">
              {(field) => <ProductFormInputs.SelectCategories field={field} />}
            </form.Field>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>{t("forms.product.sections.stock")}</Card.Title>
          </Card.Header>
          <Card.Body className="mb-4 flex-row items-start gap-x-2">
            <View className="flex-1">
              <form.Field name="stock">
                {(field) => <ProductFormInputs.StockInput field={field} />}
              </form.Field>
            </View>
            <View className="flex-1">
              <form.Field name="minStock">
                {(field) => <ProductFormInputs.MinStockInput field={field} />}
              </form.Field>
            </View>
          </Card.Body>
          <Separator />
          <Card.Footer>
            <form.Field name="allowNegativeStock">
              {(field) => (
                <ProductFormInputs.AllowNegativeStockInput field={field} />
              )}
            </form.Field>
          </Card.Footer>
        </Card>

        <form.AppField name="presentations" mode="array">
          {(field) => (
            <field.Presentations>
              {(props) => <PresentationsSection {...props} form={form} />}
            </field.Presentations>
          )}
        </form.AppField>

        <Animated.View style={fakeView} />
      </ScrollView>
      <View className="bg-background absolute bottom-0 w-full gap-y-4 px-3 py-6">
        <Button onPress={form.handleSubmit}>
          <MaterialIcons
            name="check-circle-outline"
            size={20}
            className="text-eclipse"
          />
          <Button.Label className="text-eclipse">
            {t("forms.product.create")}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
