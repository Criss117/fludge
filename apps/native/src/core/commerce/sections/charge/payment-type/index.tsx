import { Box, Button, Host, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  paymentType: "cash" | "credit";
  onPaymentTypeChange: (paymentType: "cash" | "credit") => void;
}

export function PaymentTypeSection({ paymentType, onPaymentTypeChange }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <SectionCard title="screens.charge.sections.payment_type.title">
        <Row horizontalArrangement={{ spacedBy: SPACING.md }} modifiers={[fillMaxWidth()]}>
          <Box modifiers={[weight(1)]}>
            <Button
              modifiers={[fillMaxWidth()]}
              colors={{
                containerColor:
                  paymentType === "cash" ? colors.primary : colors.surfaceContainerHigh,
              }}
              onClick={() => onPaymentTypeChange("cash")}
            >
              <Icon
                name="payments"
                size={20}
                color={paymentType === "cash" ? colors.onPrimary : colors.onSurface}
              />
              <ThemedNativeText
                color={paymentType === "cash" ? colors.onPrimary : colors.onSurface}
              >
                {t("screens.charge.sections.payment_type.cash")}
              </ThemedNativeText>
            </Button>
          </Box>
          <Box modifiers={[weight(1)]}>
            <Button
              modifiers={[fillMaxWidth()]}
              colors={{
                containerColor:
                  paymentType === "credit" ? colors.primary : colors.surfaceContainerHigh,
              }}
              onClick={() => onPaymentTypeChange("credit")}
            >
              <Icon
                name="credit-card"
                size={20}
                color={paymentType === "credit" ? colors.onPrimary : colors.onSurface}
              />
              <ThemedNativeText
                color={paymentType === "credit" ? colors.onPrimary : colors.onSurface}
              >
                {t("screens.charge.sections.payment_type.credit")}
              </ThemedNativeText>
            </Button>
          </Box>
        </Row>
      </SectionCard>
    </Host>
  );
}
