import { useFindSales } from "@fludge/client/application/sales/queries/use-find-sales";
import { Typography } from "heroui-native/text";

export function SalesScreen() {
  const { data } = useFindSales("");

  return (
    <>
      <Typography.Code>{JSON.stringify(data, null, 2)}</Typography.Code>
    </>
  );
}

export function SalesScreenSkeleton() {
  return <></>;
}
