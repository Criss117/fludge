import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { SearchInput } from "@/modules/shared/components/search-input";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useFindCustomers } from "@fludge/client/application/customer/queries/use-find-customers";
import type { TranslationKey } from "@fludge/i18n/index";
import type { CustomerSummary } from "@fludge/client/application/customer/domain/customer.repository";

interface Props {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (customer: CustomerSummary) => void;
}

function CustomerListItem({
  customer,
  onSelect,
}: {
  customer: CustomerSummary;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  const identification = customer.documentNumber
    ? `${customer.documentType ?? ""} ${customer.documentNumber}`.trim()
    : "-";

  const contact = customer.phone ?? customer.email ?? "-";

  return (
    <PressableFeedback className="rounded-2xl" onPress={onSelect}>
      <View className="bg-default flex-row items-center gap-x-3 rounded-2xl px-3 py-3">
        <View className="bg-accent/40 size-9 items-center justify-center rounded-full">
          <MaterialIcons name="person" size={20} className="text-foreground" />
        </View>
        <View className="flex-1">
          <Typography className="line-clamp-1 font-semibold">
            {customer.name}
          </Typography>
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons name="badge" size={14} className="text-muted" />
            <Typography type="body-sm" color="muted">
              {identification}
            </Typography>
          </View>
        </View>
        <View className="flex-row items-center gap-x-1">
          <MaterialIcons name="phone" size={14} className="text-muted" />
          <Typography type="body-sm" color="muted">
            {contact}
          </Typography>
        </View>
      </View>
    </PressableFeedback>
  );
}

function CustomerList({ onSelect }: { onSelect: Props["onSelect"] }) {
  const [query, setQuery] = useState("");
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage } = useFindCustomers({
    searchQuery: query,
  });

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data]);

  return (
    <BottomSheetScrollView
      contentContainerClassName="pb-safe-offset-32"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

        if (
          hasNextPage &&
          layoutMeasurement.height + contentOffset.y >= contentSize.height - 200
        ) {
          fetchNextPage();
        }
      }}
    >
      <View className="mb-3">
        <SearchInput
          query={query}
          setQuery={setQuery}
          placeholder="helpers.placeholder.search_customers"
          className="bg-accent"
        />
      </View>

      <View className="gap-y-3">
        {items.map((item) => (
          <CustomerListItem
            key={item.id}
            customer={item}
            onSelect={() => onSelect(item)}
          />
        ))}
        {items.length === 0 && (
          <View className="items-center py-8">
            <Typography>{t("screens.customers.not_found")}</Typography>
          </View>
        )}
      </View>
    </BottomSheetScrollView>
  );
}

const SNAP_POINTS = ["70%", "90%"];

export function CustomerSelectorBottomSheet({
  isOpen,
  onOpenChange,
  onSelect,
}: Props) {
  const { t } = useTranslation();

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <View className="pb-safe-offset-8 bg-overlay px-4">
          <Separator className="-mx-4 mb-3" />
          <Button
            variant="outline"
            className="w-full"
            onPress={() => onOpenChange(false)}
          >
            <MaterialIcons name="close" size={20} className="text-muted" />
            <Button.Label className="text-muted">
              {t("helpers.cancel")}
            </Button.Label>
          </Button>
        </View>
      </BottomSheetFooter>
    ),
    [t, onOpenChange]
  );

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={SNAP_POINTS}
          enableOverDrag={false}
          enableDynamicSizing={false}
          footerComponent={renderFooter}
        >
          <View className="flex-row items-center justify-between gap-4 pb-3">
            <BottomSheet.Title maxFontSizeMultiplier={1.2} numberOfLines={1}>
              {t("screens.sales.customer_selector.select_title")}
            </BottomSheet.Title>
            <BottomSheet.Close />
          </View>
          <Separator className="pb-safe-offset -mx-5" />
          <CustomerList onSelect={onSelect} />
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
