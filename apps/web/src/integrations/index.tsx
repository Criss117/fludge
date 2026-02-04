import { ThemeProvider } from "./theme/provider";
import { TanstackQueryProvider } from "./tanstack-query";

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TanstackQueryProvider>{children}</TanstackQueryProvider>
    </ThemeProvider>
  );
}
