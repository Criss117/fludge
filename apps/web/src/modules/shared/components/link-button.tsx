import type { ComponentProps } from "react";
import type { LinkProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { cn } from "@shared/lib/utils";
import { buttonVariants } from "@shared/components/ui/button";
import type { Button } from "@shared/components/ui/button";

interface Props extends LinkProps {
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
}

export function LinkButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: Props) {
  return (
    <Link
      {...props}
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className,
      )}
    />
  );
}
