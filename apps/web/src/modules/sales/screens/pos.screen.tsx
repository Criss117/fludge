import { useState } from "react";
import { Suspense } from "react";
import type { ProductSummary } from "@fludge/client/application/catalog/hooks/use-find-products";
import {
  PosProductSearchSection,
  PosProductSearchSectionSkeleton,
} from "@/modules/sales/sections/pos-product-search.section";
import {
  PosCartSection,
  PosCartSectionSkeleton,
} from "@/modules/sales/sections/pos-cart.section";

export interface CartItem {
  product: ProductSummary;
  quantity: number;
  unitPrice: number;
}

interface Props {
  organizationId: string;
}

export function PosScreen({ organizationId }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAdd = (product: ProductSummary) => {
    const price = Number(product.priceRetail);

    if (Number.isNaN(price)) {
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { product, quantity: 1, unitPrice: price }];
    });
  };

  const handleIncrement = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const handleDecrement = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemove = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClear = () => {
    setCart([]);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Punto de Venta</h1>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        <div className="flex-[3] overflow-y-auto">
          <Suspense fallback={<PosProductSearchSectionSkeleton />}>
            <PosProductSearchSection
              organizationId={organizationId}
              onAdd={handleAdd}
            />
          </Suspense>
        </div>

        <div className="flex-[2] overflow-y-auto">
          <PosCartSection
            items={cart}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}

export function PosScreenSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 py-4">
        <div className="h-6 w-40" />
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        <div className="flex-[3]">
          <PosProductSearchSectionSkeleton />
        </div>

        <div className="flex-[2]">
          <PosCartSectionSkeleton />
        </div>
      </div>
    </div>
  );
}