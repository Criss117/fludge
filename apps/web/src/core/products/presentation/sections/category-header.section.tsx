import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { CategoryDetail } from "@repo/core/entities/category";
import { BackButton } from "@/core/shared/components/back-button";
import { Button } from "@/core/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { Separator } from "@/core/shared/components/ui/separator";
import { UpdateCategoryDialog } from "../components/update-category-dialog";
import { RemoveCategoriesButton } from "../components/remove-categories-button";

interface Props {
  category: CategoryDetail;
}

function CategoryActions({ category }: Props) {
  return (
    <div className="space-x-2 flex items-center">
      <UpdateCategoryDialog
        businessId={category.businessId}
        category={{
          id: category.id,
          name: category.name,
          description: category.description,
        }}
      />
      <RemoveCategoriesButton
        categoriesIds={[category.id]}
        businessId={category.businessId}
      />
    </div>
  );
}

export function CategoryHeaderSection({ category }: Props) {
  return (
    <div className="space-y-2">
      <header className="flex items-center gap-x-4">
        <BackButton />
        <div>
          <h2 className="text-xl font-semibold">{category.name}</h2>
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
        </div>
      </header>
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>
              Aquí se muestra el resumen de la categoría
            </CardDescription>
          </div>
          <div>
            <CategoryActions category={category} />
          </div>
        </CardHeader>
        <CardContent className="flex justify-between h-12 items-center">
          <div className="flex-1 mx-2">
            <h3 className="text-xs font-semibold text-muted-foreground">ID</h3>
            <p>{category.id}</p>
          </div>
          {category.parent && (
            <>
              <Separator orientation="vertical" />
              <div className="flex-1 mx-2">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  Categoría padre
                </h3>
                <Button variant="link">
                  <Link
                    to="/business/$id/categories/$categoryid"
                    params={{
                      id: category.businessId,
                      categoryid: category.parent.id,
                    }}
                  >
                    {category.parent.name}
                  </Link>
                </Button>
              </div>
            </>
          )}
          <Separator orientation="vertical" />
          <div className="flex-1 mx-2">
            <h3 className="text-xs font-semibold text-muted-foreground">
              Última modificación
            </h3>
            <p>
              {formatDistanceToNow(category.updatedAt, {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
          <Separator orientation="vertical" />
          <div className="flex-1 mx-2">
            <h3 className="text-xs font-semibold text-muted-foreground">
              Creado el
            </h3>
            <p>
              {formatDistanceToNow(category.createdAt, {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
