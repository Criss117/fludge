import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import {
  createContext,
  use,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

export interface ProductPresentationSelectorRef {
  open: (product: ProductSummary) => void;
  close: () => void;
}

export function ProductPresentationSelectorProvider({
  children,
  ref,
}: {
  children: React.ReactNode;
  ref: React.RefObject<ProductPresentationSelectorRef | null>;
}) {
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null,
  );

  useImperativeHandle(ref, () => ({
    open: (selectedProduct: ProductSummary) =>
      setSelectedProduct({
        ...selectedProduct,
        presentations: selectedProduct.presentations.filter(
          (p) => p.status === "active",
        ),
      }),
    close: () => setSelectedProduct(null),
  }));

  const closeSheet = () => setSelectedProduct(null);

  return (
    <TicketItemContextProvider
      selectedProduct={selectedProduct}
      closeSheet={closeSheet}
    >
      {children}
    </TicketItemContextProvider>
  );
}

type Presentation = ProductSummary["presentations"][number];

interface Context {
  selectedProduct: ProductSummary | null;
  isSheetOpen: boolean;
  selectedPresentation: Presentation | null;
  closeSheet: () => void;
  isPresentationSelected: (item: Presentation) => boolean;
  selectPresentation: (item: Presentation) => void;
}

const TicketItemContext = createContext<Context | null>(null);

function TicketItemContextProvider({
  children,
  selectedProduct,
  closeSheet,
}: {
  children: React.ReactNode;
  selectedProduct: ProductSummary | null;
  closeSheet: () => void;
}) {
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(() => {
      if (!selectedProduct?.id) return null;

      return selectedProduct.presentations.at(0)!;
    });

  const isSheetOpen = selectedProduct !== null;

  const isPresentationSelected = (item: Presentation) =>
    item.id === selectedPresentation?.id;

  const selectPresentation = (item: Presentation) => {
    if (!selectedProduct) return;

    setSelectedPresentation(item);
  };

  const onClose = () => {
    setSelectedPresentation(null);
    closeSheet();
  };

  useEffect(() => {
    if (selectedPresentation !== null || !selectedProduct?.id) return;

    setSelectedPresentation(selectedProduct.presentations.at(0)!);
  }, [selectedProduct?.id]);

  return (
    <TicketItemContext.Provider
      value={{
        closeSheet: onClose,
        isPresentationSelected,
        selectPresentation,
        selectedPresentation,
        isSheetOpen,
        selectedProduct,
      }}
    >
      {children}
    </TicketItemContext.Provider>
  );
}

export function useProductPresentationSelector() {
  const context = use(TicketItemContext);

  if (!context) {
    throw new Error(
      "useProductPresentation must be used within a ProductPresentationProvider",
    );
  }

  return context;
}
