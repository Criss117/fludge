import { MaterialIcons } from "@/modules/shared/components/icons";
import { useCategoryForm } from "@fludge/client/application/catalog/form/category-form";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { CategoryFormInputs } from "./category-form-input";

function CategoryForm() {
  const { t } = useTranslation();

  const form = useCategoryForm({
    onSubmit: ({ value, resetForm }) => {
      console.log(value);
      resetForm();
    },
  });

  return (
    <View className="flex-1 gap-y-4">
      <form.Field
        name="name"
        children={(field) => <CategoryFormInputs.NameInput field={field} />}
      />

      <form.Field
        name="description"
        children={(field) => (
          <CategoryFormInputs.DescriptionInput field={field} />
        )}
      />
      <Button onPress={form.handleSubmit}>
        <Button.Label>{t("forms.category.create")}</Button.Label>
      </Button>
    </View>
  );
}

export function CategoryFormDialog() {
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  return (
    <BottomSheet>
      <BottomSheet.Trigger asChild>
        <Button isIconOnly size="lg">
          <MaterialIcons name="add" size={26} className="text-muted" />
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={snapPoints}
          enableOverDrag={false}
          enableDynamicSizing={false}
          keyboardBehavior="extend"
          contentContainerClassName="h-full bg-background"
        >
          <BottomSheet.Close />
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pt-3"
            keyboardShouldPersistTaps="handled"
          >
            <CategoryForm />
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
