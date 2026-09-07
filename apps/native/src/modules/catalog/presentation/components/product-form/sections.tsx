import type { useProductForm } from "@fludge/client/presentation/catalog/product.form";
import {
  CreatePresentationForm,
  UpdatePresentationForm,
} from "./presentation-form";
import { ProductFormSchema } from "@fludge/client/application/catalog/form/product-form";
import { Card } from "heroui-native/card";
import { Separator } from "heroui-native/separator";
import { ProductFormInputs } from "./shared";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { PresentationFormCard } from "./presentation-card";

type Form = ReturnType<typeof useProductForm>;
type Presentation = ProductFormSchema["presentations"][number];

interface PresentationFormsSectionProps {
  form: Form;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedPresentation: Presentation | null;
  setSelectedPresentation: (presentation: Presentation | null) => void;
}

interface PresentationsSectionProps {
  form: Form;
  action?: "create" | "update";
  onOpenChange: (isOpen: boolean) => void;
  setSelectedPresentation: (presentation: Presentation | null) => void;
}

export function PresentationFormsSection({
  form,
  isOpen,
  onOpenChange,
  selectedPresentation,
  setSelectedPresentation,
}: PresentationFormsSectionProps) {
  return (
    <>
      <form.AppField name="presentations">
        {(field) => (
          <field.Presentations>
            {({ add }) => (
              <CreatePresentationForm
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onSubmit={(value) => {
                  add({
                    ...value,
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
                  update(value.id, value);
                }}
              />
            )}
          </field.Presentations>
        )}
      </form.AppField>
    </>
  );
}

export function BasicInformationSection({ form }: { form: Form }) {
  const { t } = useTranslation();

  return (
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
          children={(field) => <ProductFormInputs.Description field={field} />}
        />
        <form.Field
          name="categoryId"
          children={(field) => (
            <ProductFormInputs.CategorySelect field={field} />
          )}
        />
      </Card.Body>
    </Card>
  );
}

export function StockSection({ form }: { form: Form }) {
  const { t } = useTranslation();
  return (
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
              children={(field) => <ProductFormInputs.Stock field={field} />}
            />
          </View>
          <View className="flex-1">
            <form.Field
              name="minStock"
              children={(field) => <ProductFormInputs.MinStock field={field} />}
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
  );
}

export function PresentationsSection({
  form,
  action,
  onOpenChange,
  setSelectedPresentation,
}: PresentationsSectionProps) {
  const { t } = useTranslation();
  return (
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

        <Button size="sm" onPressIn={() => onOpenChange(true)}>
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
              {({ field, remove, restore, markAsDeleted }) => {
                return field.state.value.map((presentation) => (
                  <PresentationFormCard
                    key={presentation.id}
                    presentation={presentation}
                    remove={(id) =>
                      action === "create" ? remove(id) : markAsDeleted(id)
                    }
                    showDelete={action === "update"}
                    restore={restore}
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
          onPressIn={() => onOpenChange(true)}
        >
          <MaterialIcons name="add" size={20} className="text-muted" />
          <Button.Label className="text-muted">
            {t("forms.product.sections.presentations.add")}
          </Button.Label>
        </Button>
      </Card.Footer>
    </Card>
  );
}
