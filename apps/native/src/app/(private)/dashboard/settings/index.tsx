import { MaterialIcons } from "@/modules/shared/components/icons";
import { useAppTheme } from "@/modules/shared/context/app-theme-context";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { Link } from "expo-router";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { ControlField } from "heroui-native/control-field";
import { Label } from "heroui-native/label";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { ScrollView, View } from "react-native";

export default function DashboardSettings() {
  const { session, signOut } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const sessionData = session.data!;

  return (
    <View className="flex-1 px-3">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-y-8 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Card.Header className="flex items-center justify-center">
            <Avatar size="lg">
              <Avatar.Fallback>
                {sessionData.user.name.charAt(0)}
              </Avatar.Fallback>
              {sessionData.user.image && (
                <Avatar.Image
                  source={{
                    uri: sessionData.user.image,
                  }}
                />
              )}
            </Avatar>
            <Card.Title className="max-w-2/3 text-center text-2xl font-bold text-balance">
              {sessionData.user.name}
            </Card.Title>
            <Card.Description>{sessionData.user.email}</Card.Description>
          </Card.Header>
        </Card>

        <Card className="gap-y-4">
          <Card.Header>
            <Card.Title>Preferencias</Card.Title>
          </Card.Header>
          <Card.Body>
            <ControlField
              isSelected={isDark}
              onSelectedChange={() => toggleTheme()}
            >
              <View className="w-full flex-row items-center py-4">
                <View className="flex-1 flex-row items-center gap-x-4">
                  <MaterialIcons
                    name="dark-mode"
                    size={26}
                    className="dark:text-white"
                  />
                  <Label>Modo Oscuro</Label>
                </View>
                <ControlField.Indicator />
              </View>
            </ControlField>
          </Card.Body>
        </Card>

        <Card className="gap-y-4">
          <Card.Header>
            <Card.Title>Seguridad y Accesos</Card.Title>
          </Card.Header>
          <Card.Body className="gap-y-4">
            <Link href="/(private)/dashboard/settings" asChild push>
              <PressableFeedback className="flex flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-x-2">
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    className="dark:text-white"
                  />
                  <Typography>Cambiar Contraseña</Typography>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  className="dark:text-white"
                />
              </PressableFeedback>
            </Link>
            <Link href="/(private)/dashboard/settings" asChild push>
              <PressableFeedback className="flex flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-x-2">
                  <MaterialIcons
                    name="business"
                    size={20}
                    className="dark:text-white"
                  />
                  <Typography>Gestion de Organizaciones</Typography>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  className="dark:text-white"
                />
              </PressableFeedback>
            </Link>
          </Card.Body>
        </Card>
      </ScrollView>

      <View className="pb-4">
        <Button
          variant="danger-soft"
          isDisabled={signOut.isPending}
          onPress={() => signOut.mutate()}
        >
          <MaterialIcons name="logout" size={20} className="text-danger" />
          <Button.Label>Cerrar Sesión</Button.Label>
        </Button>
      </View>
    </View>
  );
}
