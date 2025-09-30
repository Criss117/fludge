import { Link } from "@tanstack/react-router";
import { Button } from "@/core/shared/components/ui/button";
import { ProductSummaryTable } from "../components/products-summary-table";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { PlusCircleIcon } from "lucide-react";

interface Props {
  totalProducts: number;
  businessId: string;
}

export function ProductsHeader({ totalProducts, businessId }: Props) {
  const { table } = ProductSummaryTable.useProductSummaryTable();
  const { userHasPermissions } = usePermissions();

  const selectedRows = table.getSelectedRowModel().rows.length;

  const userCanCreateProducts = userHasPermissions("products:create");

  return (
    <header className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Listado de Productos ({totalProducts}
          {selectedRows > 0 && `/${selectedRows}`})
        </h2>
        <p className="text-muted-foreground text-sm">
          Administra las categorías de tus productos
        </p>
      </div>
      <div className="space-x-2">
        {userCanCreateProducts && (
          <Button asChild>
            <Link
              to="/business/$id/products/create"
              params={{ id: businessId }}
            >
              <PlusCircleIcon />
              Nuevo Producto
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
