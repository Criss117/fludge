import {
  BottomSheet,
  Group,
  Host,
  HStack,
  List,
  RNHostView,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  background,
  listRowBackground,
  listStyle,
  onTapGesture,
  padding,
  presentationBackground,
  presentationDetents,
  presentationDragIndicator,
  scrollIndicators,
} from "@expo/ui/swift-ui/modifiers";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { useFindCustomers } from "@fludge/client/commerce/queries/use-find-customers";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

function CustomerListItem({
  customer,
  onSelect,
}: {
  customer: CustomerSummary;
  onSelect: () => void;
}) {
  const colors = useThemeColor();
  const identification = customer.documentNumber
    ? `${customer.documentType ?? ""} ${customer.documentNumber}`.trim()
    : "-";
  const contact = customer.phone ?? customer.email ?? "-";

  return (
    <HStack
      spacing={SPACING.md}
      modifiers={[
        onTapGesture(onSelect),
        padding({ all: SPACING.md }),
        listRowBackground(colors.background),
      ]}
    >
      <VStack alignment="leading">
        <ThemedNativeText variant="h6" numberOfLines={1}>
          {customer.name}
        </ThemedNativeText>
        <HStack spacing={SPACING.xs}>
          <Icon name="user-name" size={14} color={colors.outline} />
          <ThemedNativeText variant="muted">{identification}</ThemedNativeText>
        </HStack>
      </VStack>

      <Spacer />

      <HStack spacing={SPACING.xs}>
        <Icon name="phone" size={14} color={colors.outline} />
        <ThemedNativeText variant="muted">{contact}</ThemedNativeText>
      </HStack>
    </HStack>
  );
}

const onReachedItem: CustomerSummary = {
  id: "onReachedItem",
  name: "onReachedItem",
  documentNumber: "onReachedItem",
  phone: "onReachedItem",
  email: "onReachedItem",
  creditLimit: 0,
  balance: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  status: "active",
  documentType: "CC",
  createdBy: "onReachedItem",
  organizationId: "onReachedItem",
};

const END_PREFIX = "onReachedItem";
const isEndItem = (item: CustomerSummary) => item.id.startsWith(END_PREFIX);

export function CustomerSelectorSheet({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: CustomerSummary) => void;
}) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFindCustomers({
    searchQuery: query,
    status: "all",
  });

  const items = useMemo(() => {
    const customers = data?.pages.flatMap((page) => page.items) ?? [];
    return hasNextPage
      ? customers?.concat({ ...onReachedItem, id: `${END_PREFIX}-${customers.length}` })
      : customers;
  }, [hasNextPage, data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = useCallback(
    (customer: CustomerSummary) => {
      onSelect(customer);
      onClose();
    },
    [onClose, onSelect],
  );

  const handlePresentedChange = useCallback(
    (presented: boolean) => {
      if (!presented) onClose();
    },
    [onClose],
  );

  const renderCustomer = useCallback(
    ({ item }: { item: CustomerSummary }) => {
      if (isEndItem(item))
        return (
          <RNHostView matchContents={{ vertical: true }}>
            <ThemedView
              style={{ height: SPACING["4xl"], alignItems: "center", justifyContent: "center" }}
              onLayout={handleEndReached}
            >
              {isFetchingNextPage && <ActivityIndicator />}
            </ThemedView>
          </RNHostView>
        );

      return <CustomerListItem customer={item} onSelect={() => handleSelect(item)} />;
    },
    [handleSelect, handleEndReached, isFetchingNextPage],
  );

  return (
    <Host matchContents>
      <BottomSheet isPresented={isOpen} onIsPresentedChange={handlePresentedChange}>
        <Group
          modifiers={[
            presentationDetents(["large"]),
            presentationDragIndicator("visible"),
            presentationBackground(colors.background),
          ]}
        >
          <VStack spacing={SPACING.sm} modifiers={[padding({ all: SPACING.md })]}>
            <HStack>
              <ThemedNativeText variant="h5">
                {t("screens.charge.sections.customer_selector.select_title")}
              </ThemedNativeText>
              <Spacer />
              <HStack modifiers={[onTapGesture(onClose), padding({ all: SPACING.xs })]}>
                <Icon name="close" size={24} color={colors.onSurface} />
              </HStack>
            </HStack>

            <SearchInput
              defaultValue={query}
              onValueChange={setQuery}
              label="screens.catalog.products.search.label"
              placeholder="helpers.placeholder.search_customers"
            />

            {items.length === 0 ? (
              <VStack modifiers={[padding({ all: SPACING.lg })]}>
                <ThemedNativeText variant="muted">
                  {t("screens.customers.not_found")}
                </ThemedNativeText>
              </VStack>
            ) : (
              <List
                modifiers={[
                  scrollIndicators("hidden"),
                  listStyle("plain"),
                  background(colors.background),
                ]}
              >
                <List.ForEach
                  data={items}
                  keyExtractor={(item) => item.id}
                  estimatedItemSize={SPACING["4xl"]}
                >
                  {renderCustomer}
                </List.ForEach>
              </List>
            )}
          </VStack>
        </Group>
      </BottomSheet>
    </Host>
  );
}
