import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import {
  Column,
  ModalBottomSheet,
  OutlinedButton,
  OutlinedIconButton,
  Spacer,
} from "@expo/ui/jetpack-compose";
import { padding, weight } from "@expo/ui/jetpack-compose/modifiers";
import type { OrderByDirection } from "@fludge/client/shared/use-filters";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { IconName } from "@/core/shared/components/icon";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useProductsFiltersSheet } from "./use-products-filters-sheet";

export function ProductsFiltersSheet() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { actions, state, texts } = useProductsFiltersSheet();
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const iconName = (status: "none" | OrderByDirection): IconName => {
    switch (status) {
      case "asc":
        return "keyboard-arrow-up";
      case "desc":
        return "keyboard-arrow-down";
      default:
        return "remove";
    }
  };

  return (
    <>
      <OutlinedIconButton onClick={actions.open}>
        <Icon name="filter-list" size={18} />
      </OutlinedIconButton>
      {state.isOpen && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={actions.close}
          skipPartiallyExpanded
          containerColor={colors.background}
          contentColor={colors.onBackground}
        >
          <Column
            modifiers={[padding(SPACING.md, 0, SPACING.md, SPACING["2xl"])]}
            verticalArrangement={{ spacedBy: SPACING.xl }}
          >
            <ThemedNativeText variant="h5">{t(texts.title)}</ThemedNativeText>

            <Column>
              <OutlinedButton onClick={() => actions.setNextOrderBy("createdAt")}>
                <ThemedNativeText>{t("helpers.order_by.created_at")}</ThemedNativeText>
                <Spacer modifiers={[weight(1)]} />
                <Icon name={iconName(state.orderBy.createdAt)} size={18} />
              </OutlinedButton>

              <OutlinedButton onClick={() => actions.setNextOrderBy("stock")}>
                <ThemedNativeText>{t("helpers.order_by.stock")}</ThemedNativeText>
                <Spacer modifiers={[weight(1)]} />
                <Icon name={iconName(state.orderBy.stock)} size={18} />
              </OutlinedButton>
            </Column>
          </Column>
        </ModalBottomSheet>
      )}
    </>
  );
}
