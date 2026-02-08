import { ThemeProvider } from "./theme/provider";
import { TanstackQueryProvider } from "./tanstack-query";
import { TooltipProvider } from "@/modules/shared/components/ui/tooltip";

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TanstackQueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </TanstackQueryProvider>
    </ThemeProvider>
  );
}
