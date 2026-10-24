import type { TranslationKey } from "@fludge/i18n/index";
import type { Link } from "expo-router";
import type { ComponentProps } from "react";

import type { IconName } from "@/core/shared/components/icon";

export interface NavigateTo {
  href: ComponentProps<typeof Link>["href"];
  icon: IconName;
  key: "iam" | "groups" | "catalog" | "categories";
}

export interface HomeHeaderProps {
  title: TranslationKey;
  navigateTo?: NavigateTo[];
}
