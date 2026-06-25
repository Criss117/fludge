import { Button } from "@fludge/ui/components/button";
import { PlusIcon } from "lucide-react";
import { useTotalCategories } from "@fludge/client/application/catalog/hooks/use-find-categories";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@fludge/ui/components/card";
import { Skeleton } from "@fludge/ui/components/skeleton";
import { CreateCategory } from "../components/create-category";

interface Props {
  organizationId: string;
  canCreate: boolean;
}

export function CategoriesHeaderSection({
  organizationId,
  canCreate,
}: Props) {
  const { data: totalCategories } = useTotalCategories(organizationId);

  const categoryInfo = [
    {
      title: "Total Categorías",
      data: totalCategories,
    },
  ];

  return (
    <section className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Listado de Categorías</h2>
          <p className="text-muted-foreground">
            Administra y organiza las categorías de productos de la
            organización
          </p>
        </div>
        <div>
          {canCreate && <CreateCategory organizationId={organizationId} />}
        </div>
      </header>
      <div className="grid grid-cols-4 gap-x-4 justify-between">
        {categoryInfo.map(({ title, data }) => (
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

const categoryInfoSkeleton = [
  {
    title: "Total Categorías",
  },
];

export function CategoriesHeaderSectionSkeleton() {
  return (
    <section className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Listado de Categorías</h2>
          <p className="text-muted-foreground">
            Administra y organiza las categorías de productos de la
            organización
          </p>
        </div>
        <div>
          <Button>
            <PlusIcon />
            <span>Nueva Categoría</span>
          </Button>
        </div>
      </header>
      <div className="flex gap-x-4 justify-between">
        {categoryInfoSkeleton.map(({ title }) => (
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
