import { useAuth } from "@fludge/client/providers/auth.provider";
import { Redirect } from "expo-router";

export default function Index() {
  const { session } = useAuth();
  const isLogged = session.data !== null;

  if (!isLogged) return <Redirect href="/auth/sign-in" />;

  return <Redirect href="/(private)/dashboard/(tabs)" />;
}
