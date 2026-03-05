import { count, ilike, Query, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useCategoriesCollection } from "./use-categories-collection";

type Filters = {
  name?: string;
};

export function useFindManyCategories(filters?: Filters) {
  const categoriesCollection = useCategoriesCollection();

  const name = filters?.name;

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query().from({ category: categoriesCollection });

    if (name)
      query = query.where(({ category }) => ilike(category.name, `%${name}%`));

    return query.orderBy(({ category }) => category.createdAt, "desc");
  }, [name]);

  return data;
}

export function useCountAllCategories() {
  const categoriesCollection = useCategoriesCollection();

  const { data } = useLiveSuspenseQuery(() => {
    return new Query()
      .from({ category: categoriesCollection })
      .select(({ category }) => ({ total: count(category.id) }))
      .findOne();
  }, []);

  return data?.total ?? 0;
}
