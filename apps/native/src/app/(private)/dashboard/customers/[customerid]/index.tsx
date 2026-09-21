import {
  CustomerDetailScreen,
  CustomerDetailSkeleton,
} from "@/modules/customer/presentation/screens/customer-detail.screen";
import { useFindCustomer } from "@fludge/client/application/customer/queries/use-find-customers";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Button } from "react-native";

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        {t("screens.customers.not_found")}
      </Text>
      <Text style={{ marginBottom: 20 }}>{error.message}</Text>
      <Button title="Reintentar" onPress={retry} />
    </View>
  );
}

function Screen({ customerid }: { customerid: string }) {
  const { data } = useFindCustomer(customerid);

  if (!data)
    return (
      <Redirect
        href={{
          pathname: "/dashboard/customers",
        }}
      />
    );

  return (
    <>
      <Stack.Screen options={{ title: data.name }} />
      <CustomerDetailScreen customer={data} />
    </>
  );
}

export default function Customer() {
  const { customerid } = useLocalSearchParams<{ customerid?: string }>();

  if (!customerid) return null;

  return (
    <Suspense fallback={<CustomerDetailSkeleton />}>
      <Screen customerid={customerid} />
    </Suspense>
  );
}
