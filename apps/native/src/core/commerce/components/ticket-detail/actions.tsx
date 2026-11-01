import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import {
  Box,
  Host,
  IconButton,
  ModalBottomSheet,
  OutlinedIconButton,
  RNHostView,
  Row,
} from "@expo/ui/jetpack-compose";
import { height, width } from "@expo/ui/jetpack-compose/modifiers";
import { formatCurrency } from "@fludge/utils/format-currency";
import { PressableScale } from "pressto";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { PresentationPriceKeyboard } from "./shared";
import type { EditPresentationProps, PresentationQuantityProps } from "./types";
import { useEditPresentation } from "./use-ticket-detail";

export function PresentationQuantity({ decrease, increase, quantity }: PresentationQuantityProps) {
  const colors = useThemeColor();

  return (
    <Row>
      <OutlinedIconButton onClick={decrease} modifiers={[width(SPACING.xl), height(SPACING.xl)]}>
        <Icon name="remove" color={colors.primary} />
      </OutlinedIconButton>

      <Box modifiers={[width(SPACING.xl), height(SPACING.xl)]} contentAlignment="center">
        <ThemedNativeText>{quantity}</ThemedNativeText>
      </Box>

      <OutlinedIconButton onClick={increase} modifiers={[width(SPACING.xl), height(SPACING.xl)]}>
        <Icon name="add" color={colors.primary} />
      </OutlinedIconButton>
    </Row>
  );
}

export function DeleteButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColor();

  return (
    <IconButton onClick={onPress} modifiers={[width(SPACING.xl), height(SPACING.xl)]}>
      <Icon name="close" color={colors.error} />
    </IconButton>
  );
}

export function EditPresentation({ presentation, itemId }: EditPresentationProps) {
  const { actions, state } = useEditPresentation({ presentation, itemId });
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const colors = useThemeColor();

  const onClose = async () => {
    await sheetRef.current?.hide();
    actions.close();
  };

  return (
    <View>
      <PressableScale onPress={actions.open} style={editPresentationStyles.triggerButton}>
        <ThemedText variant="h6">
          <ThemedText variant="muted">unit </ThemedText>
          {formatCurrency(presentation.priceSale)}
        </ThemedText>
        <Host matchContents>
          <Icon name="edit" size={14} />
        </Host>
      </PressableScale>

      <Host matchContents>
        {state.isPresented && (
          <ModalBottomSheet
            ref={sheetRef}
            onDismissRequest={actions.close}
            skipPartiallyExpanded
            containerColor={colors.background}
          >
            <RNHostView matchContents={{ vertical: true }}>
              <GestureHandlerRootView>
                <PresentationPriceKeyboard
                  defaultPrice={presentation.priceSale}
                  onSubmit={actions.handleUpdatePrice}
                  close={onClose}
                />
              </GestureHandlerRootView>
            </RNHostView>
          </ModalBottomSheet>
        )}
      </Host>
    </View>
  );
}

const editPresentationStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.xl,
  },
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: SPACING.sm,
  },
});
