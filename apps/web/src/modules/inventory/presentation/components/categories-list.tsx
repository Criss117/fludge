import { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/components/ui/sheet";
import { Button } from "@shared/components/ui/button";
import { SearchInput } from "@shared/components/search-input";
import { Separator } from "@shared/components/ui/separator";

import {
  useCountAllCategories,
  useFindManyCategories,
} from "@inventory/application/hooks/use-categories-queries";
import { CreateCategory } from "./create-category";
import { CategoryCard } from "./category-card";
import { UpdateCategory } from "./update-category";

export function CategoriesList() {
  const [search, setSearch] = useState("");
  const totalCategories = useCountAllCategories();
  const categories = useFindManyCategories({
    name: search,
  });

  return (
    <Sheet>
      <SheetTrigger render={(props) => <Button {...props} variant="outline" />}>
        Ver Categorias
      </SheetTrigger>
      <SheetContent className="data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Listado de Categorias</SheetTitle>
          <SheetDescription>
            ({totalCategories}) categorias registradas
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="no-scrollbar overflow-y-auto px-4 pb-20 flex-1 space-y-5">
          <SearchInput
            onChange={setSearch}
            value={search}
            placeholder="Buscar categorias"
          />
          <ul className="space-y-3">
            <UpdateCategory.Root>
              {categories.map((category) => (
                <CategoryCard category={category} key={category.id} />
              ))}
              <UpdateCategory.Content />
            </UpdateCategory.Root>
          </ul>
        </div>
        <Separator />
        <SheetFooter>
          <CreateCategory />
          <SheetClose
            render={(props) => <Button {...props} variant="outline" />}
          >
            Cerrar
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
