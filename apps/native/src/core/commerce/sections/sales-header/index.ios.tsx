import { Button, Host, HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import { buttonStyle, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useSalesHeader } from "./use-sales-header";

export function SalesHeader() {
  const { actions, state, texts } = useSalesHeader();
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
