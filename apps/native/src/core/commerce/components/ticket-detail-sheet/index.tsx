import {
  Box,
  Button,
  Column,
  Host,
  IconButton,
  LazyColumn,
  ModalBottomSheet,
  type ModalBottomSheetRef,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxHeight,
  fillMaxWidth,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useActiveTicket, useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { TicketDetailItem } from "../ticket-item";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TicketDetailSheet({ isOpen, onClose }: Props) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const colors = useThemeColor();
  const { t } = useTranslation();

  const router = useRouter();
  const activeTicket = useActiveTicket();
  const clearTicket = useTicketStore((s) => s.clearTicket);

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

  if (!isOpen || !activeTicket) return null;

  const items = activeTicket?.items.flatMap((item) =>
    item.presentations.map((presentation) => ({
      ...presentation,
      ticketProductId: item.id,
    })),
  );

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
          modifiers={[fillMaxWidth(), fillMaxHeight(0.85), paddingAll(SPACING.md)]}
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
            {items.map((item) => (
              <TicketDetailItem key={item.id} presentations={item} />
            ))}
          </LazyColumn>

          <Column verticalArrangement={{ spacedBy: SPACING.md }}>
            <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
              <ThemedNativeText variant="h6">
                {t("screens.pos.ticket_summary.total")}
              </ThemedNativeText>
              <Spacer modifiers={[weight(1)]} />
              <ThemedNativeText variant="h5">{formatCurrency(activeTicket.total)}</ThemedNativeText>
            </Row>

            <Row horizontalArrangement={{ spacedBy: SPACING.md }} modifiers={[fillMaxWidth()]}>
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
                  enabled={activeTicket.items.length > 0}
                  onClick={async () => {
                    await sheetRef.current?.hide();
                    onClose();
                    router.push("/pos/charge");
                  }}
                >
                  <ThemedNativeText color={colors.onPrimary}>
                    {t("screens.pos.ticket_summary.charge")}
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
