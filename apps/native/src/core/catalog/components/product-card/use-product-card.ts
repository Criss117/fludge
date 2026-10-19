import type { ProductSummary } from "@fludge/client/catalog/domain/entities";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { useMemo } from "react";

import type { IconName } from "@/core/shared/components/icon";
import type { MenuOptionItem } from "@/core/shared/components/menu-options";

import type { ProductCardProps } from "./types";

type Chip = {
  label: {
    key: TranslationKey;
    args?: Record<string, unknown>;
  };
  icon: IconName;
};

export function generateChips(product: ProductSummary): Chip[] {
  return [
    {
      label: {
        key: "screens.catalog.products.stock",
        args: { quantity: product.stock },
      },
      icon: "conveyor-belt",
    },
    {
      label: {
        key: "screens.catalog.products.min_stock",
        args: { quantity: product.minStock },
      },
      icon: "conveyor-belt",
    },
    {
      label: {
        key: product.allowNegativeStock
          ? "screens.catalog.products.allow_negative_stock"
          : "screens.catalog.products.not_allow_negative_stock",
      },
      icon: "do-not-disturb-on",
    },
  ];
}

export function useProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const menuOptions = useMemo((): MenuOptionItem[] => {
    const onActiveStatus: MenuOptionItem = {
      label: "helpers.status.deactivate",
      action: () => {},
      icon: "block",
      color: "error",
    };

    const onInactiveStatus: MenuOptionItem = {
      label: "helpers.status.activate",
      action: () => {},
      icon: "check",
    };

    return [
      {
        label: "helpers.navigation.see_details",
        action: () => {
          router.push({
            pathname: "/dashboard/products/[productid]",
            params: {
              productid: product.id,
            },
          });
        },
        icon: "visibility",
      },
      {
        label: "helpers.navigation.update",
        action: () => {
          router.push({
            pathname: "/dashboard/products/[productid]/update",
            params: {
              productid: product.id,
            },
          });
        },
        icon: "edit",
      },
      product.status === "active" ? onActiveStatus : onInactiveStatus,
    ];
  }, [router, product.id, product.status]);

  return {
    texts: {},
    actions: {},
    state: { menuOptions },
  };
}
