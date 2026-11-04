import { useFindCustomer } from "@fludge/client/commerce/queries/use-find-customers";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

import { CustomerFormScreen } from "@/core/commerce/screens/customer-form";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";

function Screen({ customerId }: { customerId: string }) {
  const { data } = useFindCustomer(customerId);

  if (!data) return <Redirect href="/dashboard/customers" />;

  return <CustomerFormScreen action={{ type: "update", customer: data }} />;
}

export default function CustomerUpdate() {
  const { customerid } = useLocalSearchParams<{
    customerid?: string;
  }>();

  if (!customerid) return null;

  return (
    <Suspense fallback={<BaseLoadingIndicator />}>
      <Screen customerId={customerid} />
    </Suspense>
  );
}
