import { QueryProvider } from "./query";
import { ThemeProvider } from "./theme";

export function IntegrationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
}
