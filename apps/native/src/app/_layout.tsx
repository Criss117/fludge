import { Integrations } from "@/integrations";
import { Stack } from "expo-router";
import "../globals.css";

export default function RootLayout() {
  return (
    <Integrations>
      <Stack />
    </Integrations>
  );
}
