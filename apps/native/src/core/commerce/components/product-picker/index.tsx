import {
  Button,
  Checkbox,
  Column,
  Host,
  LazyColumn,
  ModalBottomSheet,
  type ModalBottomSheetRef,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  height,
  padding,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import type { ProductDetail } from "@fludge/client/catalog/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useRef, useState } from "react";

import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: ProductDetail, presentations: ProductDetail["presentations"]) => void;
}

export function ProductPickerSheet({ product, isOpen, onClose, onAdd }: Props) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const colors = useThemeColor();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen || !product) return null;

  const togglePresentation = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedPresentations = product.presentations.filter((presentation) =>
    selectedIds.has(presentation.id),
  );

  const handleAdd = async () => {
    if (selectedPresentations.length === 0) return;

    onAdd(product, selectedPresentations);
    await sheetRef.current?.hide();
    onClose();
  };

  return (
    <Host matchContents>
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={onClose}
        skipPartiallyExpanded
        containerColor={colors.background}
      >
        <Column
          verticalArrangement={{ spacedBy: SPACING.lg }}
          modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}
        >
          <Column verticalArrangement={{ spacedBy: SPACING.xs }}>
            <ThemedNativeText variant="h5">{product.name}</ThemedNativeText>
            <ThemedNativeText variant="muted">Seleccioná las presentaciones</ThemedNativeText>
          </Column>

          <LazyColumn
            verticalArrangement={{ spacedBy: SPACING.xs }}
            modifiers={[fillMaxWidth(), height(320)]}
          >
            {product.presentations.map((presentation) => {
              const isSelected = selectedIds.has(presentation.id);

              return (
                <Row
                  key={presentation.id}
                  modifiers={[
                    clickable(() => togglePresentation(presentation.id)),
                    fillMaxWidth(),
                    padding(SPACING.sm, SPACING.md, SPACING.sm, SPACING.md),
                  ]}
                  verticalAlignment="center"
                >
                  <Column verticalArrangement={{ spacedBy: SPACING.xs }}>
                    <ThemedNativeText>{presentation.name}</ThemedNativeText>
                    <ThemedNativeText variant="muted">
                      {presentation.conversionFactor === 1
                        ? "1 unidad"
                        : `${presentation.conversionFactor} unidades`}
                    </ThemedNativeText>
                  </Column>
                  <Spacer modifiers={[weight(1)]} />
                  <ThemedNativeText>{formatCurrency(presentation.priceSale)}</ThemedNativeText>
                  <Checkbox
                    value={isSelected}
                    colors={{
                      checkedColor: colors.primary,
                    }}
                  />
                </Row>
              );
            })}
          </LazyColumn>

          <Button
            modifiers={[fillMaxWidth()]}
            colors={{
              containerColor: colors.primary,
            }}
            onClick={handleAdd}
          >
            <ThemedNativeText color={colors.onPrimary}>Agregar al ticket</ThemedNativeText>
          </Button>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
