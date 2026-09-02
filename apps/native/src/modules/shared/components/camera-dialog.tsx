import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import { MaterialIcons } from "./icons";
import { Typography } from "heroui-native/text";
import { StyleSheet } from "react-native";
import { useState } from "react";

interface Props {
  setBarcode: (barcode: string) => void;
}

export function CameraDialog({ setBarcode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBarcodeScanned, setIsBarcodeScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <Button isIconOnly variant="outline" isDisabled>
        <MaterialIcons
          name="photo-camera"
          size={20}
          className="text-foreground"
        />
      </Button>
    );
  }

  if (!permission.granted) {
    return (
      <Dialog>
        <Dialog.Trigger asChild>
          <Button isIconOnly variant="outline">
            <MaterialIcons
              name="photo-camera"
              size={20}
              className="text-foreground"
            />
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Typography>Necesitamos permisos para usar la cámara</Typography>
            <Button onPress={requestPermission}>
              Permitir acceso a la cámara
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  }

  // Reinicia la bandera de escaneo cada vez que el usuario abre o cierra el Dialog
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setIsBarcodeScanned(false);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Si ya procesó un código en esta sesión, ignora lecturas adicionales
    if (isBarcodeScanned) return;

    setIsBarcodeScanned(true);
    setBarcode(barcode);
    setIsOpen(false); // Cierra el Dialog tras la primera lectura
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button isIconOnly variant="outline">
          <MaterialIcons
            name="photo-camera"
            size={20}
            className="text-foreground"
          />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="h-96 overflow-hidden rounded-3xl p-0">
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "code128", "qr", "upc_a"],
            }}
            onBarcodeScanned={
              isBarcodeScanned ? undefined : (b) => handleBarcodeScanned(b.data)
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    borderRadius: 8 * 3,
  },
});
