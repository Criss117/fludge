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
import { useFilters } from "@fludge/client/providers/filters.provider";
import type { OrderByField } from "@fludge/client/shared/use-filters";
import type { TranslationKey } from "@fludge/i18n/index";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import type { iconName } from "@/core/shared/components/icon";
import { Icon } from "@/core/shared/components/icon";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useProductsHeader } from "./use-products-header";

const orderByItems: { key: OrderByField; label: TranslationKey }[] = [
  {
    key: "createdAt",
    label: "helpers.order_by.created_at",
  },
  {
    key: "stock",
    label: "helpers.order_by.stock",
  },
  {
    key: "minStock",
    label: "helpers.order_by.min_stock",
  },
];

function ProductsOrderBySheet() {
  const { filters, setNextOrderBy } = useFilters();
  const [isPresented, setIsPresented] = useState(false);
  const colors = useThemeColor();
  const { t } = useTranslation();

  const open = () => setIsPresented(true);

  const orderByButons = useMemo(() => {
    return orderByItems.map((i) => {
      const exists = filters.orderBy?.find((o) => o.field === i.key);

      let iconName: iconName = "remove";

      if (exists !== undefined) {
        switch (exists.direction) {
          case "asc":
            iconName = "keyboard-arrow-up";
            break;
          case "desc":
            iconName = "keyboard-arrow-down";
            break;
        }
      }

      return {
        ...i,
        icon: iconName,
      };
    });
  }, [filters.orderBy]);

  return (
    <VStack>
      <BottomSheet
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
        fitToContents
        anchor={
          <Button
            onPress={open}
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
            {orderByButons.map((b) => (
              <Fragment key={b.key}>
                <Button onPress={() => setNextOrderBy(b.key)}>
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
