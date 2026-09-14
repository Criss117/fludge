import { UpdateProductScreen } from "@/modules/catalog/presentation/screens/update-product.screen";
import { useFindProduct } from "@fludge/client/application/catalog/queries/use-find-products";
import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { Button } from "heroui-native/button";
import { Suspense } from "react";
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

function Screen({ productId }: { productId: string }) {
  const { data } = useFindProduct(productId);

  if (!data)
    return (
      <Redirect
        href={{
          pathname: "/(private)/dashboard/(tabs)/catalog",
        }}
      />
    );

  return <UpdateProductScreen product={data} />;
}

export default function UpdateProduct() {
  const { productid } = useLocalSearchParams<{
    productid?: string;
  }>();

  if (!productid) return null;

  return (
    <Suspense>
      <Screen productId={productid} />
    </Suspense>
  );
}
