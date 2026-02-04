import { cn } from "../lib/utils";
import { buttonVariants } from "@/modules/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { Button } from "./ui/button";
import type { ComponentProps } from "react";
import type { LinkProps } from "@tanstack/react-router";

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
        className,
        buttonVariants({
          variant,
          size,
        }),
      )}
    />
  );
}
