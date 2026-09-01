import { useProductsPresentationsCollection } from "@fludge/client/application/catalog/collections/product-presentations.container";
import { useProductsCollection } from "@fludge/client/application/catalog/collections/products.collection";
import { useCreateProductMutation } from "@fludge/client/application/catalog/mutations/use-product.mutations";
import { eq, useLiveQuery, toArray } from "@tanstack/react-db";
import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";
import { ScrollView } from "react-native";

export default function DashboardCatalog() {
  const { productCollection } = useProductsCollection();
  const { productPresentationsCollection } =
    useProductsPresentationsCollection();
  const createProductMutation = useCreateProductMutation();
  const { data } = useLiveQuery((q) =>
    q
      .from({ p: productCollection })
      .select(({ p }) => ({
        ...p,
        presentations: toArray(
          q
            .from({ pp: productPresentationsCollection })
            .where(({ pp }) => eq(pp.productId, p.id))
            .orderBy(({ pp }) => pp.createdAt, "desc")
        ),
      }))
      .orderBy(({ p }) => p.createdAt, "desc")
      .limit(10)
  );

  const onCreateProduct = () => {
    const tx = createProductMutation({
      name: "Arroz de maíz",
      stock: 10,
      allowNegativeStock: false,
      minStock: 0,
      presentations: [
        {
          name: "Arroba",
          conversionFactor: 1,
          priceSale: 10,
          barcode: "arrozdemaizz",
        },
      ],
    });

    tx.isPersisted.promise.catch((err) => {
      console.log(err.message);
    });
  };

  return (
    <ScrollView>
      <Button onPress={onCreateProduct}>Crear producto</Button>
      <Typography.Code>{JSON.stringify(data, null, 2)}</Typography.Code>
    </ScrollView>
  );
}
