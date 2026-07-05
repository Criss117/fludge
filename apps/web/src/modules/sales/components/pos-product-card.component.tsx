import { Badge } from "@fludge/ui/components/badge";
import { Button } from "@fludge/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { Skeleton } from "@fludge/ui/components/skeleton";
import { formatPrice } from "@fludge/utils/currency";
import type { ProductSummary } from "@fludge/client/application/catalog/hooks/use-find-products";

interface Props {
  product: ProductSummary;
  onAdd: (product: ProductSummary) => void;
}

export function PosProductCard({ product, onAdd }: Props) {
  const price = Number(product.priceRetail);
  const hasValidPrice = !Number.isNaN(price) && price > 0;
  const categoryName = product.category?.name ?? "Sin categoría";
  const inStock = product.stockQuantity > 0;

  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <CardTitle
          className="truncate leading-tight"
          title={product.name}
        >
          {product.name}
        </CardTitle>
        {product.category ? (
          <Badge variant="outline" className="mt-1">
            {categoryName}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Sin categoría</span>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">{product.sku ?? "—"}</span>
          <span
            className={
              inStock
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-destructive font-medium"
            }
          >
            {inStock ? `Stock: ${product.stockQuantity}` : "Sin stock"}
          </span>
        </div>
        {hasValidPrice ? (
          <div className="text-lg font-semibold">
            {formatPrice(price)}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Precio no disponible</div>
        )}
      </CardContent>

      <CardFooter>
        {hasValidPrice ? (
          <Button
            type="button"
            className="w-full"
            onClick={() => onAdd(product)}
          >
            Agregar
          </Button>
        ) : (
          <Button type="button" className="w-full" disabled variant="secondary">
            No disponible
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function PosProductCardSkeleton() {
  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-20" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-6 w-24" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}