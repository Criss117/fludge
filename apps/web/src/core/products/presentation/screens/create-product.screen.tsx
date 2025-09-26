import { PageHeader } from "@/core/shared/components/page-header";
import { ProductForm } from "../components/product-form";
import { Card, CardContent } from "@/core/shared/components/ui/card";

interface Props {
  businessId: string;
}

export function CreateProductScreen({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-5 pb-5">
      <PageHeader title="Nuevo Producto" />
      <header className="mx-4">
        <h2 className="text-2xl font-semibold">Crear Producto</h2>
        <p className="text-muted-foreground text-sm">
          Completa los datos del producto para agregarlo a tu negocio.
        </p>
      </header>
      <div className="mx-4 space-y-5">
        <ProductForm.Root businessId={businessId} method="create">
          <ProductForm.Content>
            <fieldset className="space-y-5">
              <Card>
                <CardContent className="space-y-4">
                  <div className="flex gap-x-4">
                    <ProductForm.Name />
                    <ProductForm.Barcode />
                  </div>
                  <ProductForm.Description />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="grid grid-cols-2 gap-4">
                  <ProductForm.PurchasePrice />
                  <ProductForm.SalePrice />
                  <ProductForm.WholesalePrice />
                  <ProductForm.OfferPrice />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="grid grid-cols-2 gap-4">
                  <ProductForm.Stock />
                  <ProductForm.AllowsNegativeInventory />
                  <ProductForm.MinStock />
                  <ProductForm.Weight />
                </CardContent>
              </Card>
              <ProductForm.Submit />
            </fieldset>
          </ProductForm.Content>
        </ProductForm.Root>
      </div>
    </section>
  );
}
