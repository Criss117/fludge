import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ChargeSaleSummarySection } from "@/modules/sales/presentation/sections/charge-sale-summary.section";
import { ScrollView } from "react-native-gesture-handler";
import { AmountReceivedSection } from "../sections/amount-received.section";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { formatPrice } from "@fludge/utils/currency";
import { useCreateSaleMutation } from "@fludge/client/application/sales/mutations/use-sale.mutations";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { useTicketStore } from "@fludge/client/application/sales/store/use-ticket.store";

export function ChargeSaleScreen() {
  const { activeTicket, removeTicket } = useTicketStore();
  const { t } = useTranslation();
  const mutationToast = useMutationToast("SALES_CHARGE");
  const createSale = useCreateSaleMutation();
  const router = useRouter();

  function handleSubmit() {
    mutationToast.showIsPendingToast("mutations.sale.create.is_pending");
    createSale.mutate(
      {
        customerId: "",
        paymentType: "cash",
        notes: "",
        items: activeTicket.products.flatMap((p) =>
          p.presentations.map((pp) => ({
            quantity: pp.quantity,
            name: p.name + ":" + pp.name,
            price: pp.priceSale,
            presentationId: pp.presentationId ?? "",
          }))
        ),
      },
      {
        onSuccess: () => {
          removeTicket.mutateAsync(activeTicket.id);
          mutationToast.showSuccessToast(
            "mutations.sale.create.success.title",
            "mutations.sale.create.success.description"
          );
          router.back();
        },
        onError: (e) => {
          mutationToast.showErrorToast(
            "mutations.sale.create.error",
            e.message as TranslationKey
          );
        },
      }
    );
  }

  return (
    <View className="relative flex-1">
      <ScrollView
        contentContainerClassName="px-3 gap-y-4 pb-safe-offset-24"
        showsVerticalScrollIndicator={false}
      >
        <AmountReceivedSection total={activeTicket.total} />
        <ChargeSaleSummarySection ticket={activeTicket} />
      </ScrollView>
      <View className="bg-default pb-safe-offset-4 absolute right-0 bottom-0 left-0 pt-4">
        <View className="px-3">
          <Button
            className="flex-1"
            isDisabled={createSale.isPending}
            onPress={handleSubmit}
          >
            <MaterialIcons name="payments" size={20} className="text-eclipse" />
            <Button.Label>
              {t("forms.ticket.submit")} * {formatPrice(activeTicket.total)}
            </Button.Label>
          </Button>
        </View>
      </View>
    </View>
  );
}
