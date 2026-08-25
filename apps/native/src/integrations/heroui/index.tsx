import { HeroUINativeProvider } from "heroui-native/provider";

export function HeroUIProvider({ children }: { children: React.ReactNode }) {
  return <HeroUINativeProvider>{children}</HeroUINativeProvider>;
}
