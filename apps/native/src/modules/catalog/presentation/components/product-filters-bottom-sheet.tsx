import { MaterialIcons } from "@/modules/shared/components/icons";
import type { FindAllProductsFilters } from "@fludge/client/application/catalog/domain/product.repository";
import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  filters: FindAllProductsFilters;
  onApply: (filters: FindAllProductsFilters) => void;
}

type StatusOption = FindAllProductsFilters["status"];

const statusCycle: StatusOption[] = [
  "all",
  "active",
  "inactive",
  "discontinued",
];

const createdAtCycle: Array<FindAllProductsFilters["orderBy"]["createdAt"]> = [
  "desc",
  "asc",
];
const stockCycle: Array<FindAllProductsFilters["orderBy"]["stock"]> = [
  "asc",
  "desc",
  "none",
];

const defaultFilters: FindAllProductsFilters = {
  searchQuery: "",
  status: "all",
  orderBy: {
    createdAt: "desc",
    stock: "asc",
  },
};

const SNAP_POINTS = ["45%"];

export function ProductFiltersBottomSheet({ filters, onApply }: Props) {
  const { t } = useTranslation();
  const [isOpen, onOpenChange] = useState(false);

  const [localFilters, setLocalFilters] =
    useState<FindAllProductsFilters>(filters);

  // Sync local state when sheet opens
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setLocalFilters(filters);
    }
    onOpenChange(v);
  };

  const cycleStatus = () => {
    setLocalFilters((prev) => {
      const currentIndex = statusCycle.indexOf(prev.status);
      const nextIndex = (currentIndex + 1) % statusCycle.length;
      return { ...prev, status: statusCycle[nextIndex] };
    });
  };

  const cycleCreatedAt = () => {
    setLocalFilters((prev) => {
      const currentIndex = createdAtCycle.indexOf(prev.orderBy.createdAt);
      const nextIndex = (currentIndex + 1) % createdAtCycle.length;
      return {
        ...prev,
        orderBy: { ...prev.orderBy, createdAt: createdAtCycle[nextIndex] },
      };
    });
  };

  const cycleStock = () => {
    setLocalFilters((prev) => {
      const currentIndex = stockCycle.indexOf(prev.orderBy.stock);
      const nextIndex = (currentIndex + 1) % stockCycle.length;
      return {
        ...prev,
        orderBy: { ...prev.orderBy, stock: stockCycle[nextIndex] },
      };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalFilters((prev) => ({
      ...defaultFilters,
      searchQuery: prev.searchQuery,
    }));
  };

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <View className="pb-safe-offset-8 bg-overlay px-4 pt-2">
          <Separator className="-mx-4 mb-4" />
          <View className="flex-row gap-x-2">
            <Button className="flex-1" variant="outline" onPress={handleClear}>
              <Button.Label>{t("helpers.restart")}</Button.Label>
            </Button>
            <Button className="flex-1" onPress={handleApply}>
              <MaterialIcons name="check" size={20} className="text-eclipse" />
              <Button.Label className="text-eclipse">
                {t("screens.products.filters.apply")}
              </Button.Label>
            </Button>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [handleApply, handleClear, t]
  );

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Trigger asChild>
        <Button isIconOnly variant="outline">
          <MaterialIcons
            name="filter-list"
            size={20}
            className="text-foreground"
          />
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={SNAP_POINTS}
          enableOverDrag={false}
          enableDynamicSizing={false}
          footerComponent={renderFooter}
        >
          <View className="flex-row items-center justify-between gap-4 px-3 pb-3">
            <BottomSheet.Title maxFontSizeMultiplier={1.2} numberOfLines={1}>
              {t("screens.products.filters.title")}
            </BottomSheet.Title>
            <BottomSheet.Close />
          </View>

          <Separator className="pb-safe-offset -mx-5" />
          <BottomSheetScrollView
            contentContainerClassName="pb-safe-offset-32 gap-y-1 px-3"
            showsVerticalScrollIndicator={false}
          >
            {/* Status filter */}
            <View className="flex-row items-center justify-between py-3">
              <View className="w-3/5">
                <Typography className="text-foreground">
                  {t("screens.products.filters.status.label")}
                </Typography>
              </View>
              <View className="w-2/5">
                <Button size="sm" variant="outline" onPress={cycleStatus}>
                  <Button.Label>
                    {t(
                      `screens.products.filters.status.${localFilters.status}`
                    )}
                  </Button.Label>
                </Button>
              </View>
            </View>

            <Separator />

            {/* Order by - Created At */}
            <View className="flex-row items-center justify-between py-3">
              <View className="w-3/5">
                <Typography className="text-foreground">
                  {t("screens.products.filters.order_by.created_at.label")}
                </Typography>
              </View>
              <View className="w-2/5">
                <Button size="sm" variant="outline" onPress={cycleCreatedAt}>
                  <Button.Label>
                    {t(
                      `screens.products.filters.order_by.created_at.${localFilters.orderBy.createdAt}`
                    )}
                  </Button.Label>
                </Button>
              </View>
            </View>

            <Separator />

            {/* Order by - Stock */}
            <View className="flex-row items-center justify-between py-3">
              <View className="w-3/5">
                <Typography className="text-foreground">
                  {t("screens.products.filters.order_by.stock.label")}
                </Typography>
              </View>
              <View className="w-2/5">
                <Button size="sm" variant="outline" onPress={cycleStock}>
                  <Button.Label>
                    {t(
                      `screens.products.filters.order_by.stock.${localFilters.orderBy.stock}`
                    )}
                  </Button.Label>
                </Button>
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
