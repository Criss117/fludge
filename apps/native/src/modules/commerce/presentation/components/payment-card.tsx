import type { CustomerDetail } from "@fludge/client/commerce/domain/entities";
import { formatPrice } from "@fludge/utils/currency";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Popover } from "heroui-native/popover";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useCancelCustomerPaymentMutation } from "@fludge/client/commerce/mutations/use-customer.mutations";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { TranslationKey } from "@fludge/i18n/index";

interface Props {
  payment: CustomerDetail["payments"][number];
}

const MethodConfig = {
  cash: {
    icon: "payments",
    label: "screens.customers.detail.payment_method_cash",
  },
  transfer: {
    icon: "account-balance",
    label: "screens.customers.detail.payment_method_transfer",
  },
} as const;

export function PaymentCard({ payment }: Props) {
  const { t } = useTranslation();
  const cancelPayment = useCancelCustomerPaymentMutation();
  const method = MethodConfig[payment.method];
  const mutationToast = useMutationToast("screens.customers.cancel_payment");

  const onCancelPayment = () => {
    mutationToast.showIsPendingToast(
      "mutations.customer_payment.cancel.is_pending"
    );
    cancelPayment.mutate(
      {
        customerId: payment.customerId,
        paymentId: payment.id,
        reason: "payment_cancelled",
      },
      {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.customer_payment.cancel.success.title",
            "mutations.customer_payment.cancel.success.description"
          );
        },
        onError: (erre) => {
          mutationToast.showErrorToast(
            "mutations.customer_payment.cancel.error",
            erre.message as TranslationKey
          );
        },
      }
    );
  };

  const dateStr = payment.createdAt.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = payment.createdAt.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card className="gap-y-3">
      <Card.Header className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-x-1">
          <MaterialIcons name="add" size={18} className="text-success" />
          <Typography className="text-success text-lg font-bold">
            {formatPrice(payment.amount)}
          </Typography>
        </View>

        <Chip className="border-muted bg-muted/20 border">
          <MaterialIcons
            name={method.icon}
            size={14}
            className="text-foreground"
          />
          <Chip.Label>{t(method.label)}</Chip.Label>
        </Chip>
      </Card.Header>

      <Card.Body className="gap-y-2">
        <View className="flex-row items-center gap-x-1.5">
          <MaterialIcons name="schedule" size={16} className="text-muted" />
          <Typography type="body-sm" color="muted">
            {dateStr} • {timeStr}
          </Typography>
        </View>

        {payment.notes ? (
          <View className="flex-row items-start gap-x-1.5">
            <MaterialIcons
              name="notes"
              size={16}
              className="text-muted mt-0.5"
            />
            <Typography type="body-sm" color="muted" className="flex-1">
              {payment.notes}
            </Typography>
          </View>
        ) : null}
      </Card.Body>

      <Card.Footer className="flex-row items-center gap-x-2">
        <Typography type="body-sm" color="muted" className="flex-1">
          {t("screens.customers.detail.applied_to_balance")}
        </Typography>
        <Popover presentation="popover">
          <Popover.Trigger asChild>
            <PressableFeedback className="pl-1">
              <MaterialIcons
                name="more-vert"
                size={24}
                className="text-foreground"
              />
            </PressableFeedback>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Overlay className="bg-default-soft" />
            <Popover.Content presentation="popover">
              <Button variant="danger-soft" onPress={onCancelPayment}>
                <MaterialIcons
                  name="delete"
                  size={24}
                  className="text-danger"
                />
                <Button.Label>
                  {t("screens.customers.cancel_payment")}
                </Button.Label>
              </Button>
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </Card.Footer>
    </Card>
  );
}
