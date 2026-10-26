import { RNHostView } from "@expo/ui";
import { Alert, BottomSheet, Button, VStack } from "@expo/ui/swift-ui";
import { frame, padding } from "@expo/ui/swift-ui/modifiers";
import type { PermissionResponse } from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  setBarcode: (barcode: string) => void;
}

function RequestPermission({
  requestPermission,
}: {
  requestPermission: () => Promise<PermissionResponse>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useThemeColor();
  const { t } = useTranslation();

  const onRequestPermission = () => {
    requestPermission().then(() => {
      setIsOpen(false);
    });
  };

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <Alert
      title={t("app.permissions.camera.request")}
      isPresented={isOpen}
      onIsPresentedChange={setIsOpen}
    >
      <Alert.Message>
        <ThemedNativeText>{t("app.permissions.camera.request")}</ThemedNativeText>
      </Alert.Message>
      <Alert.Trigger>
        <Button onPress={open}>
          <Icon name="barcode-scanner" color={colors.primary} />
        </Button>
      </Alert.Trigger>
      <Alert.Actions>
        <Button onPress={onRequestPermission}>
          <ThemedNativeText>{t("app.permissions.camera.confirm")}</ThemedNativeText>
        </Button>
        <Button onPress={close} role="cancel">
          <ThemedNativeText>{t("app.permissions.camera.cancel")}</ThemedNativeText>
        </Button>
      </Alert.Actions>
    </Alert>
  );
}

export function BarcodeReader({ setBarcode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false); // ref en vez de state: evita lecturas dobles
  const colors = useThemeColor();

  if (!permission?.granted) return <RequestPermission requestPermission={requestPermission} />;

  const open = () => {
    scannedRef.current = false;
    setIsOpen(true);
  };

  const handleBarcodeScanned = async (data: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setBarcode(data);
    setIsOpen(false);
  };

  return (
    <BottomSheet
      isPresented={isOpen}
      onIsPresentedChange={setIsOpen}
      anchor={
        <Button onPress={open}>
          <Icon name="barcode-scanner" color={colors.primary} />
        </Button>
      }
      fitToContents
    >
      <VStack
        modifiers={[
          frame({
            maxWidth: 420,
          }),
          padding({
            all: SPACING.md,
          }),
        ]}
      >
        <RNHostView>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "code128", "qr", "upc_a"],
            }}
            onBarcodeScanned={(b) => handleBarcodeScanned(b.data)}
          />
        </RNHostView>
      </VStack>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
});
