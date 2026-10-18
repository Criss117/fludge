import { Button, Host, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, width } from "@expo/ui/jetpack-compose/modifiers";
import { useChargeSale } from "@fludge/client/commerce/hooks/use-charge-sale";
import { useCreateSaleMutation } from "@fludge/client/commerce/mutations/use-sale.mutations";
import { useActiveTicket, useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import type { TranslationKey } from "@fludge/i18n/index";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { CustomerSelectorSection } from "@/core/commerce/components/customer-selector";
import { AmountReceivedSection } from "@/core/commerce/sections/charge/amount-received";
import { ChargeSummarySection } from "@/core/commerce/sections/charge/charge-summary";
import { PaymentTypeSection } from "@/core/commerce/sections/charge/payment-type";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

export function ChargeSaleScreen() {
  const activeTicket = useActiveTicket();
  const removeTicket = useTicketStore((s) => s.removeTicket);
  const { t } = useTranslation();
  const mutationToast = useMutationToast("SALES_CHARGE");
  const createSale = useCreateSaleMutation();
  const router = useRouter();
  const colors = useThemeColor();

  const { state, dispatch, getEffectiveState } = useChargeSale();

  if (!activeTicket) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedNativeText variant="muted">
          {t("mutations.tickets.errors.ticket_not_found")}
        </ThemedNativeText>
      </ThemedView>
    );
  }

  const ticket = activeTicket;

  function handleSubmit() {
    mutationToast.showPending("mutations.sale.create.is_pending");

    const items: (
      | { presentationId: string; price: number; quantity: number }
      | { name: string; price: number; quantity: number }
    )[] = [];

    for (const product of ticket.items) {
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
          removeTicket(ticket.id);
          mutationToast.showSuccess("mutations.sale.create.success.title");
          router.back();
        },
        onError: (e) => {
          mutationToast.showError("mutations.sale.create.error", e.message as TranslationKey);
        },
      },
    );
  }

  const canSubmit =
    !createSale.isPending && (state.customerTab === "walk-in" || state.selectedCustomer !== null);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.md,
          gap: SPACING.md,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <CustomerSelectorSection
          selectedCustomer={state.selectedCustomer}
          onSelectCustomer={(customer) =>
            dispatch({ type: "set-selected-customer", payload: customer })
          }
          tab={state.customerTab}
          onTabChange={(tab) => dispatch({ type: "set-customer-tab", payload: tab })}
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
        <ChargeSummarySection ticket={activeTicket} />
      </ScrollView>

      <View
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          left: 0,
          paddingHorizontal: SPACING.md,
          paddingTop: SPACING.md,
          paddingBottom: SPACING.md,
          backgroundColor: colors.background,
        }}
      >
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            modifiers={[fillMaxWidth()]}
            colors={{
              containerColor: colors.primary,
            }}
            onClick={handleSubmit}
            enabled={canSubmit}
          >
            <Icon name="payments" size={20} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>
              {t("forms.ticket.submit")} · {formatCurrency(activeTicket.total)}
            </ThemedNativeText>
          </Button>
        </Host>
        <KeyboardSpacerView />
      </View>
    </ThemedView>
  );
}
