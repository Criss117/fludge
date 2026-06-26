import { Button } from "@fludge/ui/components/button";
import { PlusIcon } from "lucide-react";
import { useTotalProducts } from "@fludge/client/application/catalog/hooks/use-find-products";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@fludge/ui/components/card";
import { Skeleton } from "@fludge/ui/components/skeleton";
import { CreateProduct } from "../components/create-product";

interface Props {
  organizationId: string;
  canCreate: boolean;
}

export function ProductsHeaderSection({
  organizationId,
  canCreate,
}: Props) {
  const { data: totalProducts } = useTotalProducts(organizationId);

  const productInfo = [
    {
      title: "Total Productos",
      data: totalProducts,
    },
  ];

  return (
    <section className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Productos</h2>
          <p className="text-muted-foreground">
            Administra y consulta los productos de la organización
          </p>
        </div>
        <div>
          {canCreate && <CreateProduct organizationId={organizationId} />}
        </div>
      </header>
      <div className="grid grid-cols-4 gap-x-4 justify-between">
        {productInfo.map(({ title, data }) => (
          <Card key={title} className="flex-1">
            <CardHeader>
              <CardTitle className="uppercase text-muted-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-2xl">{data}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

const productInfoSkeleton = [
  {
    title: "Total Productos",
  },
];

export function ProductsHeaderSectionSkeleton() {
  return (
    <section className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Productos</h2>
          <p className="text-muted-foreground">
            Administra y consulta los productos de la organización
          </p>
        </div>
        <div>
          <Button>
            <PlusIcon />
            <span>Nuevo Producto</span>
          </Button>
        </div>
      </header>
      <div className="flex gap-x-4 justify-between">
        {productInfoSkeleton.map(({ title }) => (
          <Card key={title} className="flex-1">
            <CardHeader>
              <CardTitle className="uppercase text-muted-foreground">
                {title}
              </CardTitle>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}