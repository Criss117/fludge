import {
  PageHeader,
  PageHeaderCreateProduct,
  PageHeaderHome,
  PageHeaderProducts,
} from "@/core/shared/components/page-header-bread-crumb";
import { ProductForm } from "../components/product-form";
import { Card, CardContent } from "@/core/shared/components/ui/card";
import { useFindManyCategories } from "../../application/hooks/use.find-many-categories";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

interface Props {
  businessId: string;
}

export function WithOutPermissions({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderProducts businessId={businessId} />
        <PageHeaderCreateProduct isPage />
      </PageHeader>

      <UserHasNoPermissionAlert />
    </section>
  );
}

export function CreateProductScreen({ businessId }: Props) {
  const { data: categories } = useFindManyCategories(businessId);

  return (
    <section className="mx-2 space-y-5 pb-5">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderProducts businessId={businessId} />
        <PageHeaderCreateProduct isPage />
      </PageHeader>
      <header className="mx-4">
        <h2 className="text-2xl font-semibold">Nuevo Producto</h2>
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
                  <ProductForm.MinStock />
                  <ProductForm.SelectCategory categories={categories} />
                  <ProductForm.Weight />
                  <ProductForm.AllowsNegativeInventory />
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
