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
import { CustomerSelectorSection } from "../sections/customer-selector.section";
import { PaymentTypeSection } from "../sections/payment-type.section";
import { useChargeSale } from "@fludge/client/application/sales/hooks/use-charge-sale";

export function ChargeSaleScreen() {
  const { activeTicket, removeTicket } = useTicketStore();
  const { t } = useTranslation();
  const mutationToast = useMutationToast("SALES_CHARGE");
  const createSale = useCreateSaleMutation();
  const router = useRouter();

  const { state, dispatch, getEffectiveState } = useChargeSale();

  function handleSubmit() {
    mutationToast.showIsPendingToast("mutations.sale.create.is_pending");
    const items = activeTicket.products
      .map((p) => {
        if (p.type === "catalog") {
          return p.presentations.map((p) => ({
            presentationId: p.presentationId!,
            price: p.priceSale,
            quantity: p.quantity,
          }));
        }

        return p.presentations.map((p) => ({
          name: p.name,
          price: p.priceSale,
          quantity: p.quantity,
        }));
      })
      .flat();

    const { paymentType, selectedCustomer } = getEffectiveState();

    console.log({
      customerId: selectedCustomer?.id,
      paymentType: paymentType,
    });

    createSale.mutate(
      {
        customerId: selectedCustomer?.id,
        paymentType: paymentType,
        notes: "",
        items: items,
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
        <CustomerSelectorSection
          selectedCustomer={state.selectedCustomer}
          onSelectCustomer={(customer) =>
            dispatch({ type: "set-selected-customer", payload: customer })
          }
          tab={state.customerTab}
          onTabChange={(tab) =>
            dispatch({ type: "set-customer-tab", payload: tab })
          }
        />
        {state.customerTab === "customer" && (
          <PaymentTypeSection
            paymentType={state.paymentType}
            onPaymentTypeChange={(paymentType) =>
              dispatch({ type: "set-payment-type", payload: paymentType })
            }
          />
        )}
        <AmountReceivedSection total={activeTicket.total} />
        <ChargeSaleSummarySection ticket={activeTicket} />
      </ScrollView>
      <View className="bg-default pb-safe-offset-4 absolute right-0 bottom-0 left-0 pt-4">
        <View className="px-3">
          <Button
            className="flex-1"
            isDisabled={
              createSale.isPending ||
              (state.customerTab === "customer" && !state.selectedCustomer)
            }
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
