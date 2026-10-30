import { VStack } from "@expo/ui/swift-ui";
import type { TranslationKey } from "@fludge/i18n/index";
import { useTranslation } from "react-i18next";

import { SPACING } from "@/lib/sp";

import { ThemedNativeText } from "../themed-text";

interface Props {
  title: TranslationKey;
  description?: TranslationKey;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children }: Props) {
  const { t } = useTranslation();

  return (
    <VStack alignment="leading" spacing={SPACING.md}>
      <VStack alignment="leading">
        <ThemedNativeText variant="h5">{t(title)}</ThemedNativeText>
        {description && <ThemedNativeText variant="muted">{t(description)}</ThemedNativeText>}
      </VStack>
      {children}
    </VStack>
  );
}
