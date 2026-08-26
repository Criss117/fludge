import { useFindAllOrganizations } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { Redirect } from "expo-router";
import { Typography } from "heroui-native/text";
import { Suspense } from "react";
import { View } from "react-native";

function RedirectIntoOrganization() {
  const { data } = useFindAllOrganizations();

  const userHasOrganizations = data?.length > 0;

  if (!userHasOrganizations) return <Redirect href="/(private)/organization" />;

  return <Redirect href="/(private)/organization/select" />;
}

function RedirecTo() {
  const { session } = useAuth();
  const isLogged = session.data !== null;
  const activeOrganizationId = session.data?.activeOrganizationId;

  if (!isLogged) return <Redirect href="/auth/sign-in" />;

  if (activeOrganizationId) return <Redirect href="/(private)/dashboard" />;

  return <RedirectIntoOrganization />;
}

export default function Index() {
  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center">
          <Typography>Connecting to the server...</Typography>
        </View>
      }
    >
      <RedirecTo />
    </Suspense>
  );
}
