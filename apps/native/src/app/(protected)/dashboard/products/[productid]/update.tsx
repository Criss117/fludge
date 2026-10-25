import { useFindProduct } from "@fludge/client/catalog/queries/use-find-products";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

import { ProductFormScreen } from "@/core/catalog/screens/product-form";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";

function Screen({ productid }: { productid: string }) {
  const { data } = useFindProduct(productid);

  if (data === null) return <Redirect href="/dashboard/home/catalog" />;

  return (
    <ProductFormScreen
      action={{
        type: "update",
        product: data,
      }}
    />
  );
}

export default function UpdateProduct() {
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
