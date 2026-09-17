import {
  ProductScreen,
  ProductScreenSkeleton,
} from "@/modules/catalog/presentation/screens/product.screen";
import { useFindProduct } from "@fludge/client/application/catalog/queries/use-find-products";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";
import { ProductMenuOptions } from "@/modules/catalog/presentation/components/product-menu-options";

function ScreenSuspense({ productId }: { productId: string }) {
  const { data } = useFindProduct(productId);

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
          headerRight: () => <ProductMenuOptions product={data} />,
        }}
      />
      <ProductScreen product={data} />
    </>
  );
}

export default function Product() {
  const { productid } = useLocalSearchParams<{
    productid?: string;
  }>();

  if (!productid) return null;

  return (
    <Suspense fallback={<ProductScreenSkeleton />}>
      <ScreenSuspense productId={productid} />
    </Suspense>
  );
}
