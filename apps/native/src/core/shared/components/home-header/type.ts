import type { Link } from "expo-router";
import type { ComponentProps } from "react";

import type { iconName } from "@/core/shared/components/icon";

export interface NavigateTo {
  href: ComponentProps<typeof Link>["href"];
  icon: iconName;
  key: "iam" | "groups" | "catalog" | "categories";
}

export interface HomeHeaderActionButtonProps {
  onPress: () => void;
  icon: iconName;
}
