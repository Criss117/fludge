import { Column, ElevatedCard, Row, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll, weight } from "@expo/ui/jetpack-compose/modifiers";
import type { TranslationKey } from "@fludge/i18n/index";
import { useTranslation } from "react-i18next";

import { SPACING } from "@/lib/sp";

import { useThemeColor } from "../hooks/use-theme-color";
import { ThemedNativeText } from "./themed-text";

interface Props {
  title: TranslationKey;
  description?: TranslationKey;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children, action }: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <ElevatedCard
      modifiers={[fillMaxWidth()]}
      colors={{
        containerColor: colors.onSecondary,
      }}
    >
      <Column
        modifiers={[paddingAll(SPACING.md)]}
        verticalArrangement={{
          spacedBy: SPACING.md,
        }}
      >
        <Row modifiers={[fillMaxWidth()]} verticalAlignment="top">
          <Column>
            <ThemedNativeText variant="h5">{t(title)}</ThemedNativeText>
            {description && <ThemedNativeText variant="muted">{t(description)}</ThemedNativeText>}
          </Column>
          <Spacer modifiers={[weight(1)]} />
          {action}
        </Row>
        {children}
      </Column>
    </ElevatedCard>
  );
}
