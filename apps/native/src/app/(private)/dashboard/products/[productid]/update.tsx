import { UpdateProductScreen } from "@/modules/catalog/presentation/screens/update-product.screen";
import { useFindOneProduct } from "@fludge/client/application/catalog/queries/use-find-products";
import { Link, Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Button } from "heroui-native/button";
import { View } from "react-native";

export function ErrorBoundary() {
  return (
    <View>
      <Link
        asChild
        replace
        href={{
          pathname: "/(private)/dashboard/(tabs)",
        }}
      >
        <Button>Go to catalog</Button>
      </Link>
    </View>
  );
}

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
