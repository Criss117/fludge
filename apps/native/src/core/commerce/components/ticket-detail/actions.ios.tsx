import { BottomSheet, Button, Host, HStack, RNHostView, VStack } from "@expo/ui/swift-ui";
import { buttonBorderShape, buttonStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { formatCurrency } from "@fludge/utils/format-currency";
import { PressableScale } from "pressto";
import { StyleSheet, View } from "react-native";

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
    <HStack>
      <Button onPress={decrease} modifiers={[buttonStyle("bordered"), buttonBorderShape("circle")]}>
        <HStack
          modifiers={[
            frame({
              height: SPACING["xl"],
              width: SPACING["xl"],
              alignment: "center",
            }),
          ]}
        >
          <Icon name="remove" color={colors.primary} />
        </HStack>
      </Button>

      <HStack
        modifiers={[
          frame({
            height: SPACING["xl"],
            width: SPACING["xl"],
            alignment: "center",
          }),
        ]}
      >
        <ThemedNativeText>{quantity}</ThemedNativeText>
      </HStack>

      <Button onPress={increase} modifiers={[buttonStyle("bordered"), buttonBorderShape("circle")]}>
        <HStack
          modifiers={[
            frame({
              height: SPACING["xl"],
              width: SPACING["xl"],
              alignment: "center",
            }),
          ]}
        >
          <Icon name="add" color={colors.primary} />
        </HStack>
      </Button>
    </HStack>
  );
}

export function DeleteButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColor();

  return (
    <Button onPress={onPress}>
      <HStack
        modifiers={[
          frame({
            height: SPACING["xl"],
            width: SPACING["xl"],
            alignment: "center",
          }),
        ]}
      >
        <Icon name="close" color={colors.error} size={18} />
      </HStack>
    </Button>
  );
}

export function EditPresentation({ presentation, itemId }: EditPresentationProps) {
  const { actions, state } = useEditPresentation({ presentation, itemId });
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
        <VStack>
          <BottomSheet
            isPresented={state.isPresented}
            onIsPresentedChange={actions.setIsPresented}

            fitToContents
          >
            <VStack
              modifiers={[
                frame({
                  maxWidth: Infinity,
                }),
              ]}
            >
              <RNHostView matchContents={{ vertical: true }}>
                <PresentationPriceKeyboard
                  defaultPrice={presentation.priceSale}
                  onSubmit={actions.handleUpdatePrice}
                  close={actions.close}
                />
              </RNHostView>
            </VStack>
          </BottomSheet>
        </VStack>
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
