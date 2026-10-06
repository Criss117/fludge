// core/shared/components/avatar.tsx
import { Image } from "expo-image";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";

type AvatarProps = {
  name: string;
  imageUri?: string | null;
  size?: number;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, imageUri, size = 40 }: AvatarProps) {
  const colors = useThemeColor();
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.onPrimary,
        },
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <Text
          style={{
            color: colors.primary,
            fontSize: size * 0.4,
            fontWeight: "600",
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
