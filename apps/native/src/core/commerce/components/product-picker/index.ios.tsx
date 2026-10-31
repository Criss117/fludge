import {
  BottomSheet,
  Button,
  Divider,
  Host,
  HStack,
  ScrollView,
  Toggle,
  VStack,
} from "@expo/ui/swift-ui";
import { buttonStyle, frame, padding, tint } from "@expo/ui/swift-ui/modifiers";
import { formatCurrency } from "@fludge/utils/format-currency";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { ProductPickerProps } from "./types";
import { useProductPicker } from "./use-product-picker";

const height = Dimensions.get("window").height / 2;

export function ProductPicker(props: ProductPickerProps) {
  const { t } = useTranslation();
  const { actions, state, texts } = useProductPicker(props);
  const colors = useThemeColor();

  return (
    <Host matchContents>
      <BottomSheet
        onIsPresentedChange={(v) => {
          if (!v) actions.close();
        }}
        isPresented={state.isPresented}
        onDismiss={actions.close}
        fitToContents
      >
        <VStack
          spacing={SPACING.lg}
          alignment="leading"
          modifiers={[
            padding({
              horizontal: SPACING.md,
              vertical: SPACING.xl,
            }),
          ]}
        >
          <VStack alignment="leading">
            <ThemedNativeText variant="h5">{props.selectedProduct?.name}</ThemedNativeText>
            <ThemedNativeText variant="muted">{t(texts.title)}</ThemedNativeText>
          </VStack>

          <ScrollView
            showsIndicators={false}
            modifiers={[
              frame({
                height: height,
              }),
            ]}
          >
            {props.selectedProduct?.presentations.map((presentation, index) => {
              const isSelected = actions.isPresentationSelected(presentation.id);
              const isLast = index + 1 === props.selectedProduct?.description.length;

              const onPress = () => actions.togglePresentation(presentation.id);

              return (
                <Fragment key={presentation.id}>
                  <Button
                    onPress={onPress}
                    modifiers={[
                      padding({
                        horizontal: SPACING.sm,
                      }),
                    ]}
                  >
                    <HStack alignment="center">
                      <VStack
                        alignment="leading"
                        modifiers={[
                          frame({
                            maxHeight: Infinity,
                          }),
                        ]}
                      >
                        <ThemedNativeText>{presentation.name}</ThemedNativeText>
                        <ThemedNativeText variant="muted">
                          x{presentation.conversionFactor}
                        </ThemedNativeText>
                        <ThemedNativeText>
                          {formatCurrency(presentation.priceSale)}
                        </ThemedNativeText>
                      </VStack>

                      <Toggle isOn={isSelected} onIsOnChange={onPress} />
                    </HStack>
                  </Button>
                  {!isLast && <Divider />}
                </Fragment>
              );
            })}
          </ScrollView>
          <Button
            modifiers={[tint(colors.primary), buttonStyle("borderedProminent")]}
            onPress={actions.submit}
          >
            <HStack
              modifiers={[
                frame({
                  maxWidth: Infinity,
                }),
              ]}
            >
              <ThemedNativeText color={colors.onPrimary}>{t(texts.submit)}</ThemedNativeText>
            </HStack>
          </Button>
        </VStack>
      </BottomSheet>
    </Host>
  );
}
