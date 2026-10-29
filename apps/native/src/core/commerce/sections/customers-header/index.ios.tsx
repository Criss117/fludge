import { Button, Divider, Host, HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import { buttonStyle, tint } from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useCustomersHeader } from "./use-customers-header";

export function CustomersHeader() {
  const { actions, state, texts } = useCustomersHeader();
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      <Host matchContents={{ vertical: true }} style={styles.host} ignoreSafeArea="container">
        <VStack spacing={SPACING.md}>
          <SearchInput
            onValueChange={actions.setSearchQuery}
            label={texts.searchBar.label}
            placeholder={texts.searchBar.placeholder}
            defaultValue={state.filters.searchQuery}
          />
          <HStack>
            {/* <ProductsOrderBySheet /> */}
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
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
});
