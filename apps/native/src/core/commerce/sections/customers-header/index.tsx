import { Box, Column, FilterChip, Host, LazyRow, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
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
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: SPACING.md }}>
          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: SPACING.sm }}
          >
            <Box modifiers={[weight(1)]}>
              <SearchInput
                onValueChange={actions.setSearchQuery}
                label={texts.searchBar.label}
                placeholder={texts.searchBar.placeholder}
                defaultValue={state.filters.searchQuery}
              />
            </Box>
          </Row>

          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: SPACING.sm }}
          >
            {/* <ProductsOrderBySheet /> */}

            <Box modifiers={[weight(1)]}>
              <LazyRow horizontalArrangement={{ spacedBy: SPACING.sm }} verticalAlignment="center">
                {state.statusOptions.map((sp) => (
                  <FilterChip
                    key={sp.value}
                    selected={actions.isStatusSelected(sp.value)}
                    onClick={() => actions.setStatus(sp.value)}
                    colors={{
                      containerColor: colors.surfaceVariant,
                      labelColor: colors.outline,
                      selectedContainerColor: colors.primaryContainer,
                      selectedLabelColor: colors.onPrimaryContainer,
                    }}
                  >
                    <FilterChip.Label>
                      <ThemedNativeText
                        color={
                          actions.isStatusSelected(sp.value)
                            ? colors.onPrimaryContainer
                            : colors.outline
                        }
                      >
                        {t(sp.label)}
                      </ThemedNativeText>
                    </FilterChip.Label>
                  </FilterChip>
                ))}
              </LazyRow>
            </Box>
          </Row>
        </Column>
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
