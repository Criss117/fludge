import { ThemeProvider } from "./theme/provider";
import { TanstackQueryProvider } from "./tanstack-query";
import { TooltipProvider } from "@/modules/shared/components/ui/tooltip";
import { Toaster } from "@/modules/shared/components/ui/sonner";

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TanstackQueryProvider>
        <TooltipProvider>
          <Toaster richColors />
          {children}
        </TooltipProvider>
      </TanstackQueryProvider>
    </ThemeProvider>
  );
}
