import { ORPCProvider } from "./orpc";
import { QueryProvider } from "./query";
import { ThemeProvider } from "./theme";
import { TooltipProvider } from "@fludge/ui/components/tooltip";

export function IntegrationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ORPCProvider>
      <QueryProvider>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </ORPCProvider>
  );
}
