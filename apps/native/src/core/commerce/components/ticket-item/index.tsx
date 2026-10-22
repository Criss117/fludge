import {
  BasicAlertDialog,
  Box,
  Button,
  Column,
  IconButton,
  OutlinedButton,
  OutlinedIconButton,
  Row,
  Spacer,
  Surface,
} from "@expo/ui/jetpack-compose";
import {
  clip,
  fillMaxWidth,
  paddingAll,
  Shapes,
  weight,
  width,
  wrapContentHeight,
  wrapContentWidth,
} from "@expo/ui/jetpack-compose/modifiers";
import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import type { TicketProductPresentation } from "@fludge/db/local-schemas/ticket.schema";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  presentations: TicketProductPresentation & {
    ticketProductId: string;
  };
}

function UpdatePrice({ presentations }: Props) {
  const [newPriceSale, setNewPriceSale] = useState(presentations.priceSale);
  const colors = useThemeColor();
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const updateTicketProductPresentation = useTicketStore((s) => s.updateTicketProductPresentation);

  const open = () => setVisible(true);
  const close = () => {
    setNewPriceSale(presentations.priceSale);
    setVisible(false);
  };

  const handleUpdate = () => {
    updateTicketProductPresentation({
      priceSale: newPriceSale,
      ticketProductId: presentations.ticketProductId,
      ticketProductPresentationId: presentations.id,
      quantity: presentations.quantity,
    });
    close();
  };

  return (
    <>
      <IconButton onClick={open}>
        <Icon name="edit" size={20} color={colors.primary} />
      </IconButton>
      {visible && (
        <BasicAlertDialog onDismissRequest={close}>
          <Surface
            color={colors.background}
            tonalElevation={5}
            modifiers={[wrapContentWidth(), wrapContentHeight(), clip(Shapes.RoundedCorner(28))]}
          >
            <Column
              modifiers={[paddingAll(SPACING.md)]}
              verticalArrangement={{
                spacedBy: SPACING.md,
              }}
            >
              <TextInput
                value={newPriceSale}
                onValueChange={setNewPriceSale}
                type="number"
                label="forms.product_presentation.price_sale.label"
                placeholder="forms.product_presentation.price_sale.placeholder"
                modifiers={[fillMaxWidth()]}
                iconName="attach-money"
              />

              <Row
                horizontalArrangement={{
                  spacedBy: SPACING.sm,
                }}
              >
                <OutlinedButton modifiers={[weight(1)]} onClick={close}>
                  <ThemedNativeText>{t("helpers.cancel")}</ThemedNativeText>
                </OutlinedButton>
                <Button
                  modifiers={[weight(1)]}
                  colors={{
                    containerColor: colors.primary,
                  }}
                  onClick={handleUpdate}
                >
                  <ThemedNativeText color={colors.onPrimary}>
                    {t("helpers.confirm")}
                  </ThemedNativeText>
                </Button>
              </Row>
            </Column>
          </Surface>
        </BasicAlertDialog>
      )}
    </>
  );
}

export function TicketDetailItem({ presentations }: Props) {
  const updateTicketProductPresentation = useTicketStore((s) => s.updateTicketProductPresentation);
  const removePresentations = useTicketStore((s) => s.removeTicketProductPresentations);

  const colors = useThemeColor();
  const subtotal = presentations.quantity * presentations.priceSale;

  const handleUpdateQuantity = (quantity: number) => {
    updateTicketProductPresentation({
      priceSale: presentations.priceSale,
      quantity,
      ticketProductId: presentations.ticketProductId,
      ticketProductPresentationId: presentations.id,
    });
  };

  const handleRemovePresentation = (presentationId: string) => {
    removePresentations([presentationId]);
  };

  const increaseQuantity = () => {
    handleUpdateQuantity(presentations.quantity + 1);
  };

  const decreaseQuantity = () => {
    const nextQuantity = presentations.quantity - 1;

    if (nextQuantity <= 0) {
      handleRemovePresentation(presentations.id);
      return;
    }

    handleUpdateQuantity(nextQuantity);
  };

  return (
    <Row
      key={presentations.id}
      modifiers={[fillMaxWidth(), paddingAll(SPACING.sm)]}
      verticalAlignment="top"
      horizontalArrangement={{ spacedBy: SPACING.md }}
    >
      <Column verticalArrangement={{ spacedBy: SPACING.xs }}>
        <ThemedNativeText numberOfLines={1}>{presentations.name}</ThemedNativeText>
        <ThemedNativeText variant="muted" numberOfLines={1}>
          {presentations.name}
        </ThemedNativeText>
        <ThemedNativeText variant="muted">{presentations.priceSale} c/u</ThemedNativeText>
        <Row
          horizontalArrangement={{
            spacedBy: SPACING.sm,
          }}
        >
          <ThemedNativeText>x{presentations.quantity}</ThemedNativeText>
          <ThemedNativeText>{formatCurrency(subtotal)}</ThemedNativeText>
        </Row>
      </Column>
      <Spacer modifiers={[weight(1)]} />
      <Column horizontalAlignment="end">
        <Row>
          <IconButton onClick={() => handleRemovePresentation(presentations.id)}>
            <Icon name="delete" size={20} color={colors.error} />
          </IconButton>
          <UpdatePrice presentations={presentations} />
        </Row>

        <Row horizontalAlignment="center" verticalAlignment="center">
          <OutlinedIconButton onClick={decreaseQuantity}>
            <Icon name="remove" size={20} color={colors.primary} />
          </OutlinedIconButton>
          <Box modifiers={[width(SPACING.xl)]} contentAlignment="center">
            <ThemedNativeText variant="h5">{presentations.quantity}</ThemedNativeText>
          </Box>
          <OutlinedIconButton onClick={increaseQuantity}>
            <Icon name="add" size={20} color={colors.primary} />
          </OutlinedIconButton>
        </Row>
      </Column>
    </Row>
  );
}
