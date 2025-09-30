import { Link, useRouter } from "@tanstack/react-router";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/core/shared/components/ui/button";
import type { ProductDetail } from "@repo/core/entities/product";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/core/shared/components/ui/alert-dialog";
import { useMutateProducts } from "../../application/hooks/use.mutate-products";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";

interface Props {
  product: ProductDetail;
}

function DeleteProduct({ product }: Props) {
  const router = useRouter();
  const { deleteProduct } = useMutateProducts();

  const handleDelete = () => {
    deleteProduct.mutate(
      {
        businessId: product.businessId,
        productId: product.id,
      },
      {
        onSuccess: (_, variables) => {
          router.navigate({
            to: "/business/$id/products",
            params: {
              id: variables.businessId,
            },
          });
        },
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="space-x-2">
          <Trash2Icon />
          <span>Eliminar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
          <AlertDialogDescription>
            Estás seguro de que quieres eliminar este producto?
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ProductHeaderSection({ product }: Props) {
  const { userHasPermissions } = usePermissions();

  const userCanUpdateProducts = userHasPermissions("products:update");
  const userCanDeleteProducts = userHasPermissions("products:delete");

  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-muted-foreground">Detalles del producto</p>
      </div>
      <div className="space-x-2 items-center flex">
        {userCanUpdateProducts && (
          <Button className="space-x-2" asChild>
            <Link
              to="/business/$id/products/$productid/update"
              params={{
                id: product.businessId,
                productid: product.id,
              }}
            >
              <PencilIcon />
              <span>Editar</span>
            </Link>
          </Button>
        )}
        {userCanDeleteProducts && <DeleteProduct product={product} />}
      </div>
    </header>
  );
}
