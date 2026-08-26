import { useFindActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { Link } from "expo-router";
import { Typography } from "heroui-native/text";
import { ScrollView } from "react-native";

export default function Dashboard() {
  const { session } = useAuth();
  const { data: activeOrganization } = useFindActiveOrganization();

  return (
    <ScrollView>
      <Link href="/(private)/organization" replace>
        Register Organization
      </Link>
      <Typography.Code>{JSON.stringify(session.data, null, 2)}</Typography.Code>
      <Typography.Code>
        {JSON.stringify(activeOrganization, null, 2)}
      </Typography.Code>
    </ScrollView>
  );
}
