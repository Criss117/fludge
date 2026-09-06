import { UpdateProductScreen } from "@/modules/catalog/presentation/screens/update-product.screen";
import { useFindOneProduct } from "@fludge/client/application/catalog/queries/use-find-products";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";

export default function ProductScreen() {
  const { productid } = useLocalSearchParams<{
    productid?: string;
  }>();

  if (!productid) return null;

  const { data } = useFindOneProduct(productid);

  if (!data)
    return (
      <Redirect
        href={{
          pathname: "/(private)/dashboard/(tabs)/catalog",
        }}
      />
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: data.name,
        }}
      />
      <UpdateProductScreen product={data} />
    </>
  );
}
