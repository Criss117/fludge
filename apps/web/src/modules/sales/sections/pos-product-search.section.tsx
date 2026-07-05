import { useState } from "react";
import { SearchInput } from "@fludge/ui/components/search-input";
import { Skeleton } from "@fludge/ui/components/skeleton";
import { useFindAllProducts } from "@fludge/client/application/catalog/hooks/use-find-products";
import type { ProductSummary } from "@fludge/client/application/catalog/hooks/use-find-products";
import {
  PosProductCard,
  PosProductCardSkeleton,
} from "@/modules/sales/components/pos-product-card.component";

const SKELETON_CARDS = Array.from({ length: 8 });

interface Props {
  organizationId: string;
  onAdd: (product: ProductSummary) => void;
}

export function PosProductSearchSection({ organizationId, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const { data: products } = useFindAllProducts(organizationId, { query });

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Buscar por nombre, SKU o código de barras..."
      />

      {products.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center border border-dashed text-sm text-muted-foreground">
          {query
            ? "No se encontraron productos para tu búsqueda"
            : "No hay productos disponibles"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => (
            <PosProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PosProductSearchSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {SKELETON_CARDS.map((_, i) => (
          <PosProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}