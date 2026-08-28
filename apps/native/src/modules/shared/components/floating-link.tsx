import type { ComponentProps } from "react";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "./icons";
import { Link } from "expo-router";

interface Props {
  href: ComponentProps<typeof Link>["href"];
}

export function FloatingLink({ href }: Props) {
  return (
    <Link href={href} push asChild>
      <Button isIconOnly size="lg">
        <MaterialIcons name="add" size={26} className="text-muted" />
      </Button>
    </Link>
  );
}
