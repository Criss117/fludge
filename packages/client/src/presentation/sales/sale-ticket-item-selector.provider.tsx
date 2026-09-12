import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import type { NewCatalogTicketItem } from "@fludge/client/application/sales/store/tickets.store";
import { createContext, use, useImperativeHandle, useState } from "react";

export interface TicketItemSelectorRef {
  open: (product: ProductSummary) => void;
  close: () => void;
}

type Presentation = ProductSummary["presentations"][number];

export function TicketItemSelectorProvider({
  children,
  ref,
}: {
  children: React.ReactNode;
  ref: React.RefObject<TicketItemSelectorRef | null>;
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

  return (
    <TicketItemContextProvider
      selectedProduct={selectedProduct}
      setSelectedProduct={setSelectedProduct}
    >
      {children}
    </TicketItemContextProvider>
  );
}

function generateNewItem(
  product: ProductSummary,
  selectedTicketItem: Presentation,
) {
  const newItem: NewCatalogTicketItem = {
    kind: "catalog",
    quantity: 1,
    presentation: {
      kind: "catalog",
      id: selectedTicketItem.id,
      productId: product.id,
      name: selectedTicketItem.name,
      conversionFactor: selectedTicketItem.conversionFactor,
      price: selectedTicketItem.priceSale,
      priceWholesale: selectedTicketItem.priceWholesale,
      originalPrice: selectedTicketItem.priceSale,
    },
    product: {
      id: product.id,
      allowNegativeStock: false,
      minStock: 0,
      totalStock: product.stock,
    },
  };

  return newItem;
}

type Values =
  | { quantity: number }
  | { price: number }
  | { quantity: number; price: number };

function updateItem(selectedItem: NewCatalogTicketItem, values: Values) {
  let newQuantity = selectedItem.quantity;
  let newPrice = selectedItem.presentation.price;

  if ("quantity" in values) newQuantity = values.quantity;

  if ("price" in values) newPrice = values.price;

  if (newQuantity <= 0 || newPrice <= 0) return selectedItem;

  const newItem: NewCatalogTicketItem = {
    ...selectedItem,
    quantity: newQuantity,
    presentation: {
      ...selectedItem.presentation,
      price: newPrice,
    },
  };

  return newItem;
}

interface Context {
  selectedProduct: ProductSummary | null;
  isSheetOpen: boolean;
  selectedTicketItem: NewCatalogTicketItem | null;
  closeSheet: () => void;
  isPresentationSelected: (item: Presentation) => boolean;
  selectPresentation: (item: Presentation) => void;
  changeQuantity: (newQuantity: number) => void;
  resetPrice: () => void;
  changePrice: (newPrice: number) => void;
  decreaseQuantity: () => void;
  increaseQuantity: () => void;
}

const TicketItemContext = createContext<Context | null>(null);

function TicketItemContextProvider({
  children,
  selectedProduct,
  setSelectedProduct,
}: {
  children: React.ReactNode;
  selectedProduct: ProductSummary | null;
  setSelectedProduct: (product: ProductSummary | null) => void;
}) {
  const [selectedTicketItem, setSelectedTicketItem] =
    useState<NewCatalogTicketItem | null>(() => {
      if (!selectedProduct?.id) return null;

      const presentation = selectedProduct.presentations.at(0);

      if (!presentation) return null;

      return generateNewItem(selectedProduct, presentation);
    });

  const isSheetOpen = selectedProduct !== null;

  const closeSheet = () => {
    setSelectedProduct(null);
    setSelectedTicketItem(null);
  };

  const isPresentationSelected = (item: Presentation) =>
    item.id === selectedTicketItem?.presentation.id;

  const selectPresentation = (item: Presentation) => {
    if (!selectedProduct) return;

    setSelectedTicketItem(generateNewItem(selectedProduct, item));
  };

  const changeQuantity = (newQuantity: number) => {
    if (!selectedTicketItem) return;
    setSelectedTicketItem(
      updateItem(selectedTicketItem, {
        quantity: newQuantity,
      }),
    );
  };

  const resetPrice = () => {
    changePrice(selectedTicketItem?.presentation.originalPrice ?? 0);
  };

  const changePrice = (newPrice: number) => {
    if (!selectedTicketItem) return;

    setSelectedTicketItem(
      updateItem(selectedTicketItem, {
        price: newPrice,
      }),
    );
  };

  const decreaseQuantity = () => {
    if (!selectedTicketItem) return;

    setSelectedTicketItem(
      updateItem(selectedTicketItem, {
        quantity: selectedTicketItem.quantity - 1,
      }),
    );
  };

  const increaseQuantity = () => {
    if (!selectedTicketItem) return;

    setSelectedTicketItem(
      updateItem(selectedTicketItem, {
        quantity: selectedTicketItem.quantity + 1,
      }),
    );
  };

  return (
    <TicketItemContext.Provider
      value={{
        selectedProduct,
        isSheetOpen,
        selectedTicketItem,
        closeSheet,
        isPresentationSelected,
        selectPresentation,
        changeQuantity,
        resetPrice,
        changePrice,
        decreaseQuantity,
        increaseQuantity,
      }}
    >
      {children}
    </TicketItemContext.Provider>
  );
}

export function useTicketItemSelector() {
  const context = use(TicketItemContext);

  if (!context) {
    throw new Error(
      "useProductPresentation must be used within a ProductPresentationProvider",
    );
  }

  return context;
}
