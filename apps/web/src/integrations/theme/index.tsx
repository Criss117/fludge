import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      storageKey="fludge-ui-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from "next-themes";
