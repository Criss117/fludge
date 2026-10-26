import { RNHostView } from "@expo/ui";
import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import {
  AlertDialog,
  Column,
  ModalBottomSheet,
  OutlinedIconButton,
  TextButton,
} from "@expo/ui/jetpack-compose";
import { height, paddingAll } from "@expo/ui/jetpack-compose/modifiers";
import type { PermissionResponse } from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

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
    <>
      <OutlinedIconButton onClick={open}>
        <Icon name="barcode-scanner" />
      </OutlinedIconButton>
      {isOpen && (
        <AlertDialog
          onDismissRequest={close}
          colors={{
            containerColor: colors.background,
          }}
        >
          <AlertDialog.Title>
            <ThemedNativeText>{t("app.permissions.camera.request")}</ThemedNativeText>
          </AlertDialog.Title>
          <AlertDialog.Text>
            <ThemedNativeText>{t("app.permissions.camera.required")}</ThemedNativeText>
          </AlertDialog.Text>
          <AlertDialog.ConfirmButton>
            <TextButton onClick={onRequestPermission}>
              <ThemedNativeText>{t("app.permissions.camera.confirm")}</ThemedNativeText>
            </TextButton>
          </AlertDialog.ConfirmButton>
          <AlertDialog.DismissButton>
            <TextButton onClick={close}>
              <ThemedNativeText>{t("app.permissions.camera.cancel")}</ThemedNativeText>
            </TextButton>
          </AlertDialog.DismissButton>
        </AlertDialog>
      )}
    </>
  );
}

export function BarcodeReader({ setBarcode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const scannedRef = useRef(false); // ref en vez de state: evita lecturas dobles
  const colors = useThemeColor();

  if (!permission?.granted) return <RequestPermission requestPermission={requestPermission} />;

  const open = () => {
    scannedRef.current = false;
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const handleBarcodeScanned = async (data: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setBarcode(data);
    await sheetRef.current?.hide();
    setIsOpen(false);
  };

  return (
    <>
      <OutlinedIconButton onClick={open}>
        <Icon name="barcode-scanner" color={colors.primary} />
      </OutlinedIconButton>

      {isOpen && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={close}
          skipPartiallyExpanded
          containerColor={colors.background}
        >
          <Column modifiers={[height(420), paddingAll(16)]}>
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
          </Column>
        </ModalBottomSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
});
