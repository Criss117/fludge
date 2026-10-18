import { useFindCustomer } from "@fludge/client/commerce/queries/use-find-customers";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

import { CustomerFormScreen } from "@/core/commerce/screens/customer-form";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";

function Screen({ customerid }: { customerid: string }) {
  const { data } = useFindCustomer(customerid);

  if (data === null) return <Redirect href="/dashboard/customer" />;

  return <CustomerFormScreen action={{ type: "update", customer: data }} />;
}

export default function UpdateCustomer() {
  const { customerid } = useLocalSearchParams<{
    customerid?: string;
  }>();

  if (customerid === undefined) return null;

  return (
    <Suspense fallback={<BaseLoadingIndicator />}>
      <Screen customerid={customerid} />
    </Suspense>
  );
}
