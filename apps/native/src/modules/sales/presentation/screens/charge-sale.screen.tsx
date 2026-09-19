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
import { useState } from "react";
import type { CustomerSummary } from "@fludge/client/application/customer/domain/customer.repository";

export function ChargeSaleScreen() {
  const { activeTicket, removeTicket } = useTicketStore();
  const { t } = useTranslation();
  const mutationToast = useMutationToast("SALES_CHARGE");
  const createSale = useCreateSaleMutation();
  const router = useRouter();

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [customerTab, setCustomerTab] = useState<"walk-in" | "customer">(
    "walk-in"
  );
  const [paymentType, setPaymentType] = useState<"cash" | "credit">("cash");

  const isWalkIn = customerTab === "walk-in";
  const isCustomerTabActiveWithoutSelection =
    customerTab === "customer" && !selectedCustomer;

  // Walk-in siempre paga en efectivo: el tipo de pago queda fijo y oculto.
  const effectivePaymentType = isWalkIn ? "cash" : paymentType;

  function handleSelectCustomerTab(tab: "walk-in" | "customer") {
    setCustomerTab(tab);

    if (tab === "walk-in") {
      setPaymentType("cash");
    }
  }

  function handleSubmit() {
    mutationToast.showIsPendingToast("mutations.sale.create.is_pending");
    const items = activeTicket.products
      .map((p) => {
        if (p.type === "adHoc") {
          return p.presentations.map((p) => ({
            name: p.name,
            price: p.priceSale,
            quantity: p.quantity,
            presentationId: undefined,
          }));
        }

        return p.presentations.map((p) => ({
          presentationId: p.id,
          price: p.priceSale,
          quantity: p.quantity,
          name: undefined,
        }));
      })
      .flat();

    createSale.mutate(
      {
        customerId: selectedCustomer?.id,
        paymentType: effectivePaymentType,
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
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          tab={customerTab}
          onTabChange={handleSelectCustomerTab}
        />
        {!isWalkIn && (
          <PaymentTypeSection
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
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
              createSale.isPending || isCustomerTabActiveWithoutSelection
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
