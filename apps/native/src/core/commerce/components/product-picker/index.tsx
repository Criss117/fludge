import {
  Button,
  Checkbox,
  Column,
  HorizontalDivider,
  Host,
  LazyColumn,
  ModalBottomSheet,
  type ModalBottomSheetRef,
  Row,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  height,
  padding,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { formatCurrency } from "@fludge/utils/format-currency";
import { Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { ProductPickerProps } from "./types";
import { useProductPicker } from "./use-product-picker";

const windowHeight = Dimensions.get("window").height / 2;

export function ProductPicker(props: ProductPickerProps) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { actions, state, texts } = useProductPicker(props);

  if (!state.isPresented) return null;

  const onSubmit = async () => {
    actions.submit();
    await sheetRef.current?.hide();
  };

  return (
    <Host matchContents>
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={actions.close}
        skipPartiallyExpanded
        containerColor={colors.background}
      >
        <Column
          verticalArrangement={{ spacedBy: SPACING.lg }}
          modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}
        >
          <Column verticalArrangement={{ spacedBy: SPACING.xs }}>
            <ThemedNativeText variant="h5">{props.selectedProduct?.name}</ThemedNativeText>
            <ThemedNativeText variant="muted">{t(texts.title)}</ThemedNativeText>
          </Column>

          <LazyColumn
            verticalArrangement={{ spacedBy: SPACING.xs }}
            modifiers={[fillMaxWidth(), height(windowHeight)]}
          >
            {props.selectedProduct?.presentations.map((presentation, index) => {
              const isSelected = actions.isPresentationSelected(presentation.id);
              const isLast = index + 1 === props.selectedProduct?.description.length;

              const onPress = () => actions.togglePresentation(presentation.id);

              return (
                <Fragment key={presentation.id}>
                  <Row
                    modifiers={[
                      clickable(onPress),
                      fillMaxWidth(),
                      padding(SPACING.sm, SPACING.md, SPACING.sm, SPACING.md),
                    ]}
                    verticalAlignment="center"
                  >
                    <Column verticalArrangement={{ spacedBy: SPACING.xs }} modifiers={[weight(1)]}>
                      <ThemedNativeText>{presentation.name}</ThemedNativeText>
                      <ThemedNativeText variant="muted">
                        x{presentation.conversionFactor}
                      </ThemedNativeText>
                      <ThemedNativeText>{formatCurrency(presentation.priceSale)}</ThemedNativeText>
                    </Column>
                    <Checkbox
                      value={isSelected}
                      onCheckedChange={onPress}
                      colors={{
                        checkedColor: colors.primary,
                      }}
                    />
                  </Row>
                  {!isLast && <HorizontalDivider />}
                </Fragment>
              );
            })}
          </LazyColumn>

          <Button
            modifiers={[fillMaxWidth()]}
            colors={{
              containerColor: colors.primary,
            }}
            onClick={onSubmit}
          >
            <ThemedNativeText color={colors.onPrimary}>Agregar al ticket</ThemedNativeText>
          </Button>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
