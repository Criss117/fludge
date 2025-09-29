import {
  BoxIcon,
  ChartNoAxesGantt,
  CheckCircle2Icon,
  CoinsIcon,
  Percent,
  Weight,
} from "lucide-react";
import { Badge } from "@/core/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { cn, formatCurrency } from "@/core/shared/lib/utils";
import type { ProductDetail } from "@repo/core/entities/product";
import { Separator } from "@/core/shared/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  product: ProductDetail;
}

export function ProductImage({ product }: Props) {
  return (
    <Card>
      <CardHeader className="flex-1">
        <img
          src="https://picsum.photos/id/1005/400/300"
          alt="Product"
          className="aspect-square object-cover w-full"
        />
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <h4 className="text-muted-foreground">Código de barras:</h4>
          <p>{product.barcode}</p>
        </div>
        <div>
          <div className="flex gap-x-2">
            <h4 className="text-muted-foreground">Creado:</h4>
            <p>
              {formatDistanceToNow(product.createdAt, {
                locale: es,
                addSuffix: true,
              })}
            </p>
          </div>
          <div className="flex gap-x-2">
            <h4 className="text-muted-foreground">Última actualización:</h4>
            <p>
              {formatDistanceToNow(product.updatedAt, {
                locale: es,
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        {product.stock > 0 && (
          <div className="flex gap-x-2">
            <CheckCircle2Icon className="h-5 w-5 text-green-500" />
            <Badge className="bg-green-300 rounded-full">En stock</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductDescription({ product }: Props) {
  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-x-2">
          <BoxIcon />
          Descripción
        </CardTitle>
        <CardDescription>{product.description || "-"}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function ProductPrices({ product }: Props) {
  const profitMargin = product.salePrice - product.purchasePrice;
  const profitMarginPercent = (profitMargin / product.purchasePrice) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-x-2">
          <CoinsIcon /> Información de Precios
        </CardTitle>
        <CardDescription />
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="flex justify-around">
          <li className="text-center bg-accent/1 p-4 rounded-md">
            <h4 className="text-muted-foreground">Precio de compra</h4>
            <p className="font-semibold">
              $ {formatCurrency(product.purchasePrice)}
            </p>
          </li>
          <li className="text-center bg-accent/1 p-4 rounded-md">
            <h4 className="text-muted-foreground">Precio de venta</h4>
            <p className="text-green-400 font-semibold text-xl">
              $ {formatCurrency(product.salePrice)}
            </p>
          </li>
          <li className="text-center bg-accent/1 p-4 rounded-md">
            <h4 className="text-muted-foreground">Precio mayoreo</h4>
            <p className="font-semibold">
              $ {formatCurrency(product.wholesalePrice)}
            </p>
          </li>
          <li className="text-center bg-accent/1 p-4 rounded-md">
            <h4 className="text-muted-foreground">Precio de oferta</h4>
            <p className="font-semibold">
              $ {formatCurrency(product.offerPrice)}
            </p>
          </li>
        </ul>
        <div className="bg-accent/1 p-4 rounded-md">
          <h4 className="text-muted-foreground">Margen de ganancia</h4>
          <div className="flex gap-x-2">
            <p className="font-semibold">$ {formatCurrency(profitMargin)}</p>
            <p className="flex items-center text-muted-foreground">
              (<Percent className="size-4" />
              {profitMarginPercent.toFixed(2)})
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductInventory({ product }: Props) {
  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-x-2">
          <ChartNoAxesGantt />
          Gestion de Inventario
        </CardTitle>
        <CardDescription />
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="flex justify-around">
          <li className="text-center bg-accent/1 p-4 rounded-md">
            <h4 className="text-muted-foreground">Stock actual</h4>
            <p
              className={cn(
                "font-semibold",
                product.stock < product.minStock && "text-red-500",
                product.stock <= 0 && "text-red-500"
              )}
            >
              {product.stock}
            </p>
          </li>
          <li className="text-center bg-accent/1 p-4 rounded-md">
            <h4 className="text-muted-foreground">Stock mínimo</h4>
            <p className="font-semibold">{product.minStock}</p>
          </li>
          <li className="text-center bg-accent/1 p-4 rounded-md">
            <h4 className="text-muted-foreground">Inventario negativo</h4>
            <p className="font-semibold">
              {product.allowsNegativeInventory
                ? "Si permitido"
                : "No permitido"}
            </p>
          </li>
        </ul>
        <div className="bg-accent/1 p-4 rounded-md flex gap-x-2">
          <p className="flex gap-x-2 items-center text-muted-foreground">
            <Weight className="size-4" /> Peso:
          </p>
          <p>{product.weight ? `${product.weight} Kg` : "-"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductMetadata({ product }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clasificación</CardTitle>
        <CardDescription />
      </CardHeader>
      <CardContent className="space-y-2">
        {product.category && (
          <div className="space-y-2">
            <h4>Categoría</h4>
            <div>
              <Badge className="text-md">{product.category?.name}</Badge>
              <p className="text-muted-foreground">
                {product.category?.description || "-"}
              </p>
            </div>
          </div>
        )}
        {!product.category && (
          <div>
            <p>No se ha definido una categoría</p>
          </div>
        )}
        <Separator />
        {!product.brand && (
          <div>
            <p className="text-muted-foreground">No se ha definido una marca</p>
          </div>
        )}

        {product.brand && (
          <div className="space-y-2">
            <h4>Marca</h4>
            <div>
              <Badge className="text-md">{product.brand?.name}</Badge>
              <p className="text-muted-foreground">
                {product.brand?.description || "-"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
