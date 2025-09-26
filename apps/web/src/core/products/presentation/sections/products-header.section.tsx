import { Button } from "@/core/shared/components/ui/button";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { ProductSummaryTable } from "../components/products-summary-table";
import { Link } from "@tanstack/react-router";

interface Props {
  totalProducts: number;
  businessId: string;
}

export function ProductsHeader({ totalProducts, businessId }: Props) {
  const { table } = ProductSummaryTable.useProductSummaryTable();
  const { userHasPermissions } = usePermissions();

  const selectedRows = table.getSelectedRowModel().rows.length;

  const userCanDeleteProducts = userHasPermissions("products:delete");

  return (
    <header className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Listado de Categorias ({totalProducts}
          {selectedRows > 0 && `/${selectedRows}`})
        </h2>
        <p className="text-muted-foreground text-sm">
          Administra las categorías de tus productos
        </p>
      </div>
      <div className="space-x-2">
        <Button asChild>
          <Link to="/business/$id/products/create" params={{ id: businessId }}>
            Crear Producto
          </Link>
        </Button>
        <Button
          variant="destructive"
          disabled={selectedRows === 0 || !userCanDeleteProducts}
        >
          Eliminar
        </Button>
      </div>
    </header>
  );
}
