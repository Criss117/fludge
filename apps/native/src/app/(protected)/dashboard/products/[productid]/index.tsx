import { useFindProduct } from "@fludge/client/catalog/queries/use-find-products";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";

function Screen({ productid }: { productid: string }) {
  const { data } = useFindProduct(productid);

  if (data === null) return <Redirect href="/dashboard/catalog" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: data.name,
        }}
      />
    </>
  );
}

export default function ProductDetail() {
  const { productid } = useLocalSearchParams<{
    productid?: string;
  }>();

  if (productid === undefined) return null;

  return (
    <Suspense fallback={<BaseLoadingIndicator />}>
      <Screen productid={productid} />
    </Suspense>
  );
}
