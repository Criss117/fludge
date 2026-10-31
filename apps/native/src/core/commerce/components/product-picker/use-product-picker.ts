import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useState } from "react";

import type { ProductPickerProps } from "./types";

export function useProductPicker({ selectedProduct, onAdd, onClose }: ProductPickerProps) {
  const [selectedPresentationIds, setSelectedPresentationIds] = useState<string[]>([]);

  const togglePresentation = (id: string) => {
    setSelectedPresentationIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);

      return [...prev, id];
    });
  };

  const close = () => {
    setSelectedPresentationIds([]);
    onClose();
  };

  const isPresentationSelected = (id: string) => {
    return selectedPresentationIds.includes(id);
  };

  const submit = () => {
    if (selectedPresentationIds.length === 0 || selectedProduct === null) return;

    const selectedPresentations = selectedProduct.presentations.filter((p) =>
      selectedPresentationIds.includes(p.id),
    );

    onAdd(selectedProduct, selectedPresentations);
    close();
  };

  return {
    actions: {
      submit,
      close,
      togglePresentation,
      isPresentationSelected,
    },
    state: {
      isPresented: selectedProduct !== null,
      selectedPresentationIds,
    },
    texts: {
      title: getI18nKey("screens.pos.product_picker.title"),
      submit: getI18nKey("screens.pos.product_picker.submit"),
    },
  };
}
