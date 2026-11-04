import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { useFindCustomer } from "@fludge/client/commerce/queries/use-find-customers";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

import { CustomerScreen } from "@/core/commerce/screens/customer";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { isPlatform } from "@/lib/constants";

function StackConfig({ customer }: { customer: CustomerSummary }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: customer.name,
        }}
      />
      {isPlatform.isIos && (
        <>
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button icon="chevron.backward" onPress={router.back} />
          </Stack.Toolbar>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              onPress={() =>
                router.push({
                  pathname: "/dashboard/customers/[customerid]/update",
                  params: {
                    customerid: customer.id,
                  },
                })
              }
            >
              <Stack.Toolbar.Label>{t("helpers.navigation.update")}</Stack.Toolbar.Label>
            </Stack.Toolbar.Button>
          </Stack.Toolbar>
        </>
      )}
    </>
  );
}

function Screen({ customerId }: { customerId: string }) {
  const { data } = useFindCustomer(customerId);

  if (!data) return <Redirect href="/dashboard/customers" />;

  return (
    <>
      <StackConfig customer={data} />
      <CustomerScreen customer={data} />
    </>
  );
}

export default function CustomerDetail() {
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
