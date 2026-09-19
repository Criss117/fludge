import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";
import { useCreateCustomerForm } from "@fludge/client/application/customer/form/customer-form";
import { useCreateCustomerMutation } from "@fludge/client/application/customer/mutations/use-customer.mutations";
import { Card } from "heroui-native/card";
import { Button } from "heroui-native/button";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import {
  ContactSection,
  CreditSection,
  GeneralInformationSection,
} from "../components/customer-form-sections";

const PADDING_BOTTOM = 20;

export function CreateCustomerScreen() {
  const { t } = useTranslation();
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const mutation = useCreateCustomerMutation();

  const mutationToast = useMutationToast("create-customer-toast");
  const router = useRouter();

  const form = useCreateCustomerForm({
    onSubmit: ({ value }) => {
      mutationToast.showIsPendingToast("mutations.customers.create.is_pending");

      mutation.mutate(value, {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.customers.create.success.title",
            "mutations.customers.create.success.description"
          );
          router.back();
        },
        onError: (error) => {
          mutationToast.showErrorToast(
            "mutations.customers.create.error",
            error.message as TranslationKey
          );
        },
      });
    },
  });

  const keyboardSpacer = useAnimatedStyle(() => {
    const keyboardHeight = height.get();
    return {
      height: Math.abs(keyboardHeight),
      marginBottom: keyboardHeight > 0 ? 0 : PADDING_BOTTOM,
    };
  });

  return (
    <View className="relative flex-1">
      <ScrollView
        className="flex-1 px-3"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-y-8">
          <GeneralInformationSection form={form} />
          <ContactSection form={form} />
          <CreditSection form={form} />
        </View>
        <Animated.View style={keyboardSpacer} />
      </ScrollView>
      <View className="bg-background absolute bottom-0 w-full gap-y-3 px-3 py-6">
        <Button onPress={form.handleSubmit} isDisabled={mutation.isPending}>
          <MaterialIcons name="person-add" size={20} className="text-eclipse" />
          <Button.Label className="text-eclipse">
            {t("forms.customer.create")}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
