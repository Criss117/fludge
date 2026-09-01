import { useCategoriesCollection } from "@fludge/client/application/catalog/collections/categories.collection";
import { useProductsCollection } from "@fludge/client/application/catalog/collections/products.collection";
import { useLiveQuery } from "@tanstack/react-db";
import { Typography } from "heroui-native/text";
import { ScrollView } from "react-native";

export default function DashboardCatalog() {
  const { productCollection } = useProductsCollection();
  const { data } = useLiveQuery((q) =>
    q.from({ p: productCollection }).orderBy(({ p }) => p.createdAt, "desc")
  );

  return (
    <ScrollView>
      <Typography.Code>{JSON.stringify(data, null, 2)}</Typography.Code>
    </ScrollView>
  );
}
