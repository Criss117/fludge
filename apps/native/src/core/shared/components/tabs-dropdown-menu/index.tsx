import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  IconButton,
  OutlinedButton,
  Row,
} from "@expo/ui/jetpack-compose";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

export function TabsDropdownMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const colors = useThemeColor();
  const router = useRouter();

  const open = () => setIsExpanded(true);
  const close = () => setIsExpanded(false);

  return (
    <Host matchContents>
      <Row>
        <DropdownMenu expanded={isExpanded} onDismissRequest={close} color={colors.surface}>
          <DropdownMenu.Trigger>
            <IconButton onClick={open}>
              <Icon name="settings" size={24} color={colors.onSurface} />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            <DropdownMenuItem
              onClick={() => {
                close();
                router.push("/dashboard/settings");
              }}
            >
              <DropdownMenuItem.Text>
                <ThemedNativeText color={colors.onSurface}>
                  {t("screens.settings.label")}
                </ThemedNativeText>
              </DropdownMenuItem.Text>
              <DropdownMenuItem.LeadingIcon>
                <Icon name="settings" />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                close();
                console.log("Home pressed");
              }}
            >
              <DropdownMenuItem.Text>
                <ThemedNativeText color={colors.onSurface}>
                  {t("screens.iam.members.label")}
                </ThemedNativeText>
              </DropdownMenuItem.Text>
              <DropdownMenuItem.LeadingIcon>
                <Icon name="person-add" />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                close();
                console.log("Home pressed");
              }}
            >
              <DropdownMenuItem.Text>
                <ThemedNativeText color={colors.onSurface}>
                  {t("screens.iam.groups.label")}
                </ThemedNativeText>
              </DropdownMenuItem.Text>
              <DropdownMenuItem.LeadingIcon>
                <Icon name="group" />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
          </DropdownMenu.Items>
        </DropdownMenu>
        <OutlinedButton
          onClick={() => router.push("/dashboard/categories")}

          colors={{
            containerColor: colors.surface,
            contentColor: colors.onSurface,
          }}
        >
          <ThemedNativeText>{t("screens.catalog.categories.label")}</ThemedNativeText>
        </OutlinedButton>
      </Row>
    </Host>
  );
}
