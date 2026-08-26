import { useAuth } from "@fludge/client/providers/auth.provider";
import { Typography } from "heroui-native/text";

export default function Dashboard() {
  const { session } = useAuth();

  return (
    <>
      <Typography.Code>{JSON.stringify(session.data, null, 2)}</Typography.Code>
    </>
  );
}
