import {
  Column,
  Host,
  IconButton,
  LazyColumn,
  ModalBottomSheet,
  type ModalBottomSheetRef,
  RNHostView,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxSize,
  fillMaxWidth,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { useFindCustomers } from "@fludge/client/commerce/queries/use-find-customers";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
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
    <Row
      modifiers={[clickable(onSelect), fillMaxWidth(), paddingAll(SPACING.md)]}
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: SPACING.md }}
    >
      <Column modifiers={[weight(1)]}>
        <ThemedNativeText variant="h6" numberOfLines={1}>
          {customer.name}
        </ThemedNativeText>
        <Row horizontalArrangement={{ spacedBy: SPACING.xs }}>
          <Icon name="user-name" size={14} color={colors.outline} />
          <ThemedNativeText variant="muted">{identification}</ThemedNativeText>
        </Row>
      </Column>

      <Row horizontalArrangement={{ spacedBy: SPACING.xs }}>
        <Icon name="phone" size={14} color={colors.outline} />
        <ThemedNativeText variant="muted">{contact}</ThemedNativeText>
      </Row>
    </Row>
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
  const sheetRef = useRef<ModalBottomSheetRef>(null);
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
    async (customer: CustomerSummary) => {
      onSelect(customer);
      await sheetRef.current?.hide();
      onClose();
    },
    [onClose, onSelect],
  );

  const renderCustomer = useCallback(
    ({ item }: { item: CustomerSummary }) => {
      if (isEndItem(item))
        return (
          <RNHostView matchContents={{ vertical: true }}>
            <View
              style={{ height: SPACING["4xl"], alignItems: "center", justifyContent: "center" }}
              onLayout={handleEndReached}
            >
              {isFetchingNextPage && <ActivityIndicator />}
            </View>
          </RNHostView>
        );

      return <CustomerListItem customer={item} onSelect={() => handleSelect(item)} />;
    },
    [handleSelect, handleEndReached, isFetchingNextPage],
  );

  if (!isOpen) return null;

  return (
    <Host matchContents>
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={onClose}
        skipPartiallyExpanded
        containerColor={colors.background}
      >
        <Column
          verticalArrangement={{ spacedBy: SPACING.sm }}
          modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}
        >
          <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <ThemedNativeText variant="h5">
              {t("screens.charge.sections.customer_selector.select_title")}
            </ThemedNativeText>
            <Spacer modifiers={[weight(1)]} />
            <IconButton onClick={onClose}>
              <Icon name="close" size={24} color={colors.onSurface} />
            </IconButton>
          </Row>

          <SearchInput
            defaultValue={query}
            onValueChange={setQuery}
            label="screens.catalog.products.search.label"
            placeholder="helpers.placeholder.search_customers"
          />

          {items.length === 0 ? (
            <Column modifiers={[fillMaxWidth(), paddingAll(SPACING.lg)]}>
              <Row modifiers={[fillMaxWidth()]}>
                <Spacer modifiers={[weight(1)]} />
                <ThemedNativeText variant="muted">
                  {t("screens.customers.not_found")}
                </ThemedNativeText>
                <Spacer modifiers={[weight(1)]} />
              </Row>
            </Column>
          ) : (
            <LazyColumn modifiers={[fillMaxSize()]}>
              <LazyColumn.Items
                data={items}
                keyExtractor={(item) => item.id}
                estimatedItemSize={SPACING["4xl"]}
              >
                {renderCustomer}
              </LazyColumn.Items>
            </LazyColumn>
          )}
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
