import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function OrganizationLayout() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { hasOrganizations } = useOrganization();
  const colors = useThemeColor();

  const userIsRoot = session.data?.user.isRoot ?? false;

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
