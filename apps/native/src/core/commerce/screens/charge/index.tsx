import { Button, Host } from "@expo/ui";
import { useChargeSale } from "@fludge/client/commerce/hooks/use-charge-sale";
import { useCreateSaleMutation } from "@fludge/client/commerce/mutations/use-sale.mutations";
import { useActiveTicket, useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

import { CustomerSelectorSection } from "@/core/commerce/components/customer-selector";
import { ChargeSummarySection } from "@/core/commerce/sections/charge/charge-summary";
import { PaymentTypeSection } from "@/core/commerce/sections/charge/payment-type";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedScrollView, ThemedView } from "@/core/shared/components/themed-view";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

export function ChargeSaleScreen() {
  const activeTicket = useActiveTicket();
  const { state, dispatch, getEffectiveState } = useChargeSale();
  const createSale = useCreateSaleMutation();
  const removeTicket = useTicketStore((s) => s.removeTicket);
  const mutationToast = useMutationToast("SALES_CHARGE");
  const router = useRouter();

  if (!activeTicket) return null;

  const canSubmit =
    !createSale.isPending && (state.saleVariant === "walk-in" || state.selectedCustomer !== null);

  function handleSubmit() {
    if (!activeTicket) return null;

    mutationToast.showPending("mutations.sale.create.is_pending");

    const items: (
      | { presentationId: string; price: number; quantity: number }
      | { name: string; price: number; quantity: number }
    )[] = [];

    for (const product of activeTicket.items) {
      for (const presentation of product.presentations) {
        if (product.productId) {
          items.push({
            presentationId: presentation.presentationId!,
            price: presentation.priceSale,
            quantity: presentation.quantity,
          });
        } else {
          items.push({
            name: presentation.name,
            price: presentation.priceSale,
            quantity: presentation.quantity,
          });
        }
      }
    }

    const { paymentType, selectedCustomer } = getEffectiveState();

    createSale.mutate(
      {
        customerId: selectedCustomer?.id,
        paymentType,
        notes: "",
        items,
      },
      {
        onSuccess: () => {
          removeTicket(activeTicket.id);
          mutationToast.showSuccess("mutations.sale.create.success.title");
          router.back();
        },
        onError: (e) => {
          mutationToast.showError("mutations.sale.create.error", e.message as TranslationKey);
        },
      },
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <CustomerSelectorSection
          selectedCustomer={state.selectedCustomer}
          onSelectCustomer={(customer) =>
            dispatch({ type: "set-selected-customer", payload: customer })
          }
          tab={state.saleVariant}
          onTabChange={(tab) => dispatch({ type: "set-customer-tab", payload: tab })}
        />

        {state.saleVariant === "customer" && (
          <PaymentTypeSection
            paymentType={state.paymentType}
            onPaymentTypeChange={(paymentType) =>
              dispatch({ type: "set-payment-type", payload: paymentType })
            }
          />
        )}
        {/* {(state.saleVariant !== "customer" || state.paymentType !== "credit") && (
          <AmountReceivedSection total={activeTicket.total} />
        )} */}
      </ThemedScrollView>
      <Host matchContents>
        <Button onPress={handleSubmit}>
          <ThemedNativeText>Cobrar</ThemedNativeText>
        </Button>
      </Host>
      <ChargeSummarySection ticket={{ ...activeTicket, customer: state.selectedCustomer }} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    rowGap: SPACING.xl,
  },
});
