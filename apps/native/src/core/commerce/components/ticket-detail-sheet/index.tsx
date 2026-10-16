import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import {
  Box,
  Button,
  Column,
  Host,
  IconButton,
  LazyColumn,
  ModalBottomSheet,
  type ModalBottomSheetRef,
  OutlinedIconButton,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxHeight,
  fillMaxWidth,
  paddingAll,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TicketDetailSheet({ isOpen, onClose }: Props) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const colors = useThemeColor();
  const { t } = useTranslation();

  const activeTicket = useTicketStore((s) => s.activeTicket);
  const activeTicketTotal = useTicketStore((s) => s.activeTicketTotal);
  const clearTicket = useTicketStore((s) => s.clearTicket);
  const updateTicketProductPresentation = useTicketStore(
    (s) => s.updateTicketProductPresentation,
  );
  const removePresentations = useTicketStore(
    (s) => s.removeTicketProductPresentations,
  );

  const handleClose = async () => {
    await sheetRef.current?.hide();
    onClose();
  };

  const handleClear = async () => {
    if (!activeTicket) return;

    clearTicket(activeTicket.id);
    await sheetRef.current?.hide();
    onClose();
  };

  const handleRemovePresentation = (presentationId: string) => {
    removePresentations([presentationId]);
  };

  if (!isOpen) return null;

  return (
    <Host matchContents>
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={handleClose}
        skipPartiallyExpanded
        containerColor={colors.background}
      >
        <Column
          verticalArrangement={{ spacedBy: SPACING.lg }}
          modifiers={[
            fillMaxWidth(),
            fillMaxHeight(0.85),
            paddingAll(SPACING.md),
          ]}
        >
          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: SPACING.md }}
          >
            <Icon name="inventory" size={24} color={colors.primary} />
            <Column>
              <ThemedNativeText variant="h5">
                {t("screens.pos.ticket_summary.title")}
              </ThemedNativeText>
              <ThemedNativeText variant="muted">
                {t("screens.pos.ticket_summary.items_count", {
                  count: activeTicket?.items.length ?? 0,
                })}
              </ThemedNativeText>
            </Column>
            <Spacer modifiers={[weight(1)]} />
            <IconButton onClick={handleClose}>
              <Icon name="arrow-drop-down" size={24} color={colors.onSurface} />
            </IconButton>
          </Row>

          <LazyColumn
            verticalArrangement={{ spacedBy: SPACING.sm }}
            modifiers={[fillMaxWidth(), weight(1)]}
          >
            {activeTicket?.items.flatMap((item) =>
              item.presentations.map((presentation) => {
                const subtotal = presentation.quantity * presentation.priceSale;

                const handleUpdateQuantity = (quantity: number) => {
                  updateTicketProductPresentation(
                    item.id,
                    presentation.id,
                    quantity,
                    presentation.priceSale,
                  );
                };

                const increaseQuantity = () => {
                  handleUpdateQuantity(presentation.quantity + 1);
                };

                const decreaseQuantity = () => {
                  const nextQuantity = presentation.quantity - 1;

                  if (nextQuantity <= 0) {
                    handleRemovePresentation(presentation.id);
                    return;
                  }

                  handleUpdateQuantity(nextQuantity);
                };

                return (
                  <Row
                    key={presentation.id}
                    modifiers={[fillMaxWidth(), paddingAll(SPACING.sm)]}
                    verticalAlignment="top"
                    horizontalArrangement={{ spacedBy: SPACING.md }}
                  >
                    <Column verticalArrangement={{ spacedBy: SPACING.xs }}>
                      <ThemedNativeText maxLines={1}>
                        {item.name}
                      </ThemedNativeText>
                      <ThemedNativeText variant="muted" maxLines={1}>
                        {presentation.name}
                      </ThemedNativeText>
                      <ThemedNativeText variant="muted">
                        {presentation.priceSale} c/u
                      </ThemedNativeText>
                      <Row
                        horizontalArrangement={{
                          spacedBy: SPACING.sm,
                        }}
                      >
                        <ThemedNativeText>
                          x{presentation.quantity}
                        </ThemedNativeText>
                        <ThemedNativeText>
                          {formatCurrency(subtotal)}
                        </ThemedNativeText>
                      </Row>
                    </Column>
                    <Spacer modifiers={[weight(1)]} />
                    <Column horizontalAlignment="end">
                      <Row>
                        <IconButton
                          onClick={() =>
                            handleRemovePresentation(presentation.id)
                          }
                        >
                          <Icon name="delete" size={20} color={colors.error} />
                        </IconButton>
                        <IconButton onClick={() => {}}>
                          <Icon name="edit" size={20} color={colors.primary} />
                        </IconButton>
                      </Row>

                      <Row
                        horizontalAlignment="center"
                        verticalAlignment="center"
                      >
                        <OutlinedIconButton onClick={decreaseQuantity}>
                          <Icon
                            name="remove"
                            size={20}
                            color={colors.primary}
                          />
                        </OutlinedIconButton>
                        <Box
                          modifiers={[width(SPACING.xl)]}
                          contentAlignment="center"
                        >
                          <ThemedNativeText variant="h5">
                            {presentation.quantity}
                          </ThemedNativeText>
                        </Box>
                        <OutlinedIconButton onClick={increaseQuantity}>
                          <Icon name="add" size={20} color={colors.primary} />
                        </OutlinedIconButton>
                      </Row>
                    </Column>
                  </Row>
                );
              }),
            )}
          </LazyColumn>

          <Column verticalArrangement={{ spacedBy: SPACING.md }}>
            <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
              <ThemedNativeText variant="h6">
                {t("screens.pos.ticket_summary.total")}
              </ThemedNativeText>
              <Spacer modifiers={[weight(1)]} />
              <ThemedNativeText variant="h5">
                {formatCurrency(activeTicketTotal)}
              </ThemedNativeText>
            </Row>

            <Row
              horizontalArrangement={{ spacedBy: SPACING.md }}
              modifiers={[fillMaxWidth()]}
            >
              <Box modifiers={[weight(1)]}>
                <Button
                  modifiers={[fillMaxWidth()]}
                  colors={{
                    containerColor: colors.surfaceContainerHigh,
                  }}
                  onClick={handleClear}
                >
                  <ThemedNativeText color={colors.onSurface}>
                    {t("screens.pos.ticket_summary.clear")}
                  </ThemedNativeText>
                </Button>
              </Box>
              <Box modifiers={[weight(1)]}>
                <Button
                  modifiers={[fillMaxWidth()]}
                  colors={{
                    containerColor: colors.primary,
                  }}
                  onClick={() => {}}
                >
                  <ThemedNativeText color={colors.onPrimary}>
                    {t("screens.pos.ticket_summary.charge", {
                      total: formatCurrency(activeTicketTotal),
                    })}
                  </ThemedNativeText>
                </Button>
              </Box>
            </Row>
          </Column>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
