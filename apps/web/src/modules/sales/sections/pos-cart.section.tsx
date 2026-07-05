import { Minus, Plus, X } from "lucide-react";
import { Button } from "@fludge/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { Separator } from "@fludge/ui/components/separator";
import { formatPrice } from "@fludge/utils/currency";
import type { CartItem } from "@/modules/sales/screens/pos.screen";

interface Props {
  items: CartItem[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function PosCartSection({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
}: Props) {
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Carrito</CardTitle>
          {items.length > 0 && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={onClear}
            >
              Vaciar carrito
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
            Carrito vacío
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map((item, index) => (
              <div key={item.product.id}>
                {index > 0 && <Separator />}
                <div className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p
                      className="truncate text-sm font-medium"
                      title={item.product.name}
                    >
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.product.sku ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.unitPrice)} c/u
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => onRemove(item.product.id)}
                      aria-label="Quitar del carrito"
                    >
                      <X />
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => onDecrement(item.product.id)}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => onIncrement(item.product.id)}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pb-3 text-sm font-medium">
                  {formatPrice(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {items.length > 0 && (
        <div className="mt-auto border-t p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">
              {formatPrice(total)}
            </span>
          </div>
          <Button type="button" className="mt-4 w-full" disabled>
            Cobrar
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Vista previa — el cobro no está disponible
          </p>
        </div>
      )}
    </Card>
  );
}

export function PosCartSectionSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle>Carrito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          Carrito vacío
        </div>
      </CardContent>
    </Card>
  );
}