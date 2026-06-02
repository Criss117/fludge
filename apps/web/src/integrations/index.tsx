import { QueryProvider } from "./query";
import { ThemeProvider } from "./theme";

export function IntegrationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
