import { HeroUINativeProvider } from "heroui-native/provider";

export function HeroUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
      {children}
    </HeroUINativeProvider>
  );
}
