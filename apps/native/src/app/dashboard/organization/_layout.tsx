import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useFindOrganizations } from "@fludge/client/iam/queries/use-find-organizations";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

export default function OrganizationLayout() {
  const { t } = useTranslation();
  const {
    data: { session },
  } = useAppState();
  const { data: organizations } = useFindOrganizations();
  const colors = useThemeColor();

  const userIsRoot = session?.user.isRoot ?? false;
  const hasOrganizations = organizations.length > 0;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.onPrimaryContainer,
          fontFamily: GeistFonts.Bold,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "fade",
      }}
    >
      <Stack.Protected guard={hasOrganizations}>
        <Stack.Screen
          name="index"
          options={{
            title: t("screens.organization.select.title"),
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={userIsRoot}>
        <Stack.Screen
          name="register"
          options={{
            title: t("screens.organization.register.title"),
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
