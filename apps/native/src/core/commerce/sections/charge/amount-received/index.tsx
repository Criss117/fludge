import { Column, Host, Row } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxWidth,
  paddingAll,
  Shapes,
} from "@expo/ui/jetpack-compose/modifiers";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { SectionCard } from "@/core/shared/components/section-card";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  total: number;
}

export function AmountReceivedSection({ total }: Props) {
  const [amount, setAmount] = useState(total);
  const { t } = useTranslation();
  const colors = useThemeColor();

  const change = amount - total;
  const isEnough = change >= 0;

  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <SectionCard title="screens.charge.sections.amount_received.title">
        <Column verticalArrangement={{ spacedBy: SPACING.md }} modifiers={[fillMaxWidth()]}>
          <TextInput
            type="number"
            defaultValue={amount}
            onValueChange={setAmount}
            label="screens.charge.sections.amount_received.label"
            placeholder="screens.charge.sections.amount_received.placeholder"
            iconName="dollar"
            modifiers={[fillMaxWidth()]}
          />

          <Column
            verticalArrangement={{ spacedBy: SPACING.md }}
            modifiers={[
              fillMaxWidth(),
              background(isEnough ? colors.success : colors.errorContainer),
              paddingAll(SPACING.md),
              clip(Shapes.RoundedCorner(SPACING.md)),
            ]}
          >
            <Row
              modifiers={[fillMaxWidth()]}
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: SPACING.md }}
            >
              <Icon
                name="assignment-return"
                size={20}
                color={isEnough ? colors.onSuccess : colors.onErrorContainer}
              />
              <Column>
                <ThemedNativeText
                  color={isEnough ? colors.onSuccess : colors.onErrorContainer}
                  variant="h6"
                >
                  {t("screens.charge.sections.amount_received.resubmitted.title")}
                </ThemedNativeText>
                <ThemedNativeText
                  color={isEnough ? colors.onSuccess : colors.onErrorContainer}
                  variant="muted"
                >
                  {t("screens.charge.sections.amount_received.resubmitted.description")}
                </ThemedNativeText>
              </Column>
            </Row>
          </Column>

          <ThemedNativeText
            variant="h3"
            color={isEnough ? colors.onSuccess : colors.onErrorContainer}
          >
            {formatCurrency(change)}
          </ThemedNativeText>
        </Column>
      </SectionCard>
    </Host>
  );
}
