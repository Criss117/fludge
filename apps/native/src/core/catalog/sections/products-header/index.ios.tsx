import {
  BottomSheet,
  Button,
  Divider,
  Host,
  HStack,
  ScrollView,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import { buttonStyle, frame, padding, tint } from "@expo/ui/swift-ui/modifiers";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { Icon } from "@/core/shared/components/icon";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useProductsHeader, useProductsOrderBySheet } from "./use-products-header";

function ProductsOrderBySheet() {
  const { state, actions } = useProductsOrderBySheet();
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <VStack>
      <BottomSheet
        isPresented={state.isPresented}
        onIsPresentedChange={actions.setIsPresented}
        fitToContents
        anchor={
          <Button
            onPress={actions.open}
            modifiers={[buttonStyle("borderedProminent"), tint(colors.surfaceVariant)]}
          >
            <ThemedNativeText>{t("helpers.order_by.label")}</ThemedNativeText>
          </Button>
        }
      >
        <VStack
          modifiers={[
            padding({
              vertical: SPACING.xl,
              horizontal: SPACING.md,
            }),
          ]}
          spacing={SPACING.md}
        >
          <ThemedNativeText variant="h5">{t("helpers.order_by.title")}</ThemedNativeText>

          <VStack spacing={SPACING.md}>
            {state.orderByButtons.map((b) => (
              <Fragment key={b.value}>
                <Button onPress={() => actions.setNextOrderBy(b.value)}>
                  <HStack
                    modifiers={[
                      frame({
                        maxWidth: Infinity,
                      }),
                    ]}
                  >
                    <ThemedNativeText>{t(b.label)}</ThemedNativeText>
                    <Spacer />
                    <Icon name={b.icon} size={18} color={colors.primary} />
                  </HStack>
                </Button>
                <Divider />
              </Fragment>
            ))}
          </VStack>
        </VStack>
      </BottomSheet>
    </VStack>
  );
}

export function ProductsHeader() {
  const { actions, state, texts } = useProductsHeader();
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      <Host matchContents={{ vertical: true }} style={styles.host} ignoreSafeArea="container">
        <VStack spacing={SPACING.md}>
          <HStack
            modifiers={[
              frame({
                width: Infinity,
              }),
            ]}
          >
            <BarcodeReader setBarcode={actions.setSearchQuery} />
            <SearchInput
              onValueChange={actions.setSearchQuery}
              label={texts.searchBar.label}
              placeholder={texts.searchBar.placeholder}
              defaultValue={state.filters.searchQuery}
            />
          </HStack>
          <HStack>
            <ProductsOrderBySheet />
            <Divider />
            <ScrollView axes="horizontal" showsIndicators={false}>
              <HStack>
                {state.statusOptions.map((sp) => (
                  <Button
                    key={sp.value}
                    onPress={() => actions.setStatus(sp.value)}
                    modifiers={[
                      buttonStyle(
                        actions.isStatusSelected(sp.value) ? "borderedProminent" : "bordered",
                      ),
                      tint(colors.surfaceVariant),
                    ]}
                  >
                    <ThemedNativeText
                      color={actions.isStatusSelected(sp.value) ? colors.primary : colors.outline}
                    >
                      {t(sp.label)}
                    </ThemedNativeText>
                  </Button>
                ))}
              </HStack>
            </ScrollView>
          </HStack>
        </VStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    width: "100%",
  },
  headerContainer: {
    rowGap: SPACING.sm,
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
});
