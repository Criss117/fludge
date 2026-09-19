import { MaterialIcons } from "@/modules/shared/components/icons";
import { Button } from "heroui-native/button";
import { Input } from "heroui-native/input";
import { useEffect, useRef, useState } from "react";
import { type FocusEvent, View } from "react-native";

interface Props {
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onFocus: ((e: FocusEvent) => void) | undefined;
}

export function QuantityInput({ quantity, onUpdateQuantity, onFocus }: Props) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef(quantity);

  const incrementQuantity = () => {
    onUpdateQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity === 1) return;
    onUpdateQuantity(quantity - 1);
  };

  const handleUpdateQuantity = (quantity: number) => {
    setLocalQuantity(quantity);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      lastQueryRef.current = quantity;
      onUpdateQuantity(quantity);
    }, 300);
  };

  const canDecreaseQuantity = quantity > 1;

  useEffect(() => {
    if (quantity !== lastQueryRef.current) {
      lastQueryRef.current = quantity;
      setLocalQuantity(quantity);
    }
  }, [quantity]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View className="border-accent flex-row items-center rounded-3xl border">
      <Button
        className="px-3 py-2"
        isDisabled={!canDecreaseQuantity}
        onPress={decreaseQuantity}
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <MaterialIcons name="remove" size={18} className="text-foreground" />
      </Button>
      <Input
        className="w-16 bg-transparent px-3 text-center"
        value={localQuantity.toString()}
        onChangeText={(value) => handleUpdateQuantity(Number(value) || 0)}
        keyboardType="numeric"
        placeholder="0"
        onFocus={onFocus}
      />
      <Button
        className="px-3 py-2"
        onPress={incrementQuantity}
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <MaterialIcons name="add" size={18} className="text-foreground" />
      </Button>
    </View>
  );
}
