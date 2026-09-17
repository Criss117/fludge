import type { ProductSummary } from "@fludge/client/application/catalog/domain/product.repository";
import { createContext, use, useState } from "react";

export interface ProductPresentationSelectorRef {
  open: (product: ProductSummary) => void;
  close: () => void;
}

export type SelectedProduct = Omit<ProductSummary, "presentations"> & {
  presentations: Array<
    ProductSummary["presentations"][number] & {
      selected?: boolean;
    }
  >;
};

interface Context {
  selectedProduct: SelectedProduct | null;
  isSheetOpen: boolean;
  selectedPresentations: SelectedProduct["presentations"];
  onOpenSheetChange: (v: boolean) => void;
  closeSheet: () => void;
  selectProduct: (item: SelectedProduct) => void;
  selectPresentation: (presentationId: string) => void;
}

const ProductPresentationSelectorContext = createContext<Context | null>(null);

export function ProductPresentationSelectorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);

  const isSheetOpen = selectedProduct !== null;
  const selectedPresentations =
    selectedProduct?.presentations.filter((p) => p.selected) ?? [];

  const onOpenSheetChange = (v: boolean) => {
    if (v) setSelectedProduct(null);
  };

  const closeSheet = () => {
    setSelectedProduct(null);
  };

  const selectProduct = (item: SelectedProduct) => {
    setSelectedProduct(item);
  };

  const selectPresentation = (presentationId: string) => {
    if (!selectedProduct) return;

    const updatedProduct: SelectedProduct = {
      ...selectedProduct,
      presentations: selectedProduct.presentations.map((p) => {
        if (p.id === presentationId)
          return { ...p, selected: p.selected ? !p.selected : true };

        return p;
      }),
    };

    setSelectedProduct(updatedProduct);
  };

  return (
    <ProductPresentationSelectorContext.Provider
      value={{
        selectedProduct,
        isSheetOpen,
        selectedPresentations,
        onOpenSheetChange,
        closeSheet,
        selectProduct,
        selectPresentation,
      }}
    >
      {children}
    </ProductPresentationSelectorContext.Provider>
  );
}

export function useProductPresentationSelector() {
  const context = use(ProductPresentationSelectorContext);

  if (!context) {
    throw new Error(
      "useProductPresentation must be used within a ProductPresentationProvider",
    );
  }

  return context;
}
