import { Input } from "heroui-native/input";
import { View } from "react-native";
import { MaterialIcons } from "./icons";
import { Button } from "heroui-native/button";

interface Props {
  query: string;
  setQuery: (query: string) => void;
  placeholder: string;
}

export function SearchInput({ query, setQuery, placeholder }: Props) {
  return (
    <View className="relative w-full flex-row items-center">
      <Input
        value={query}
        onChangeText={setQuery}
        className="flex-1 px-10"
        placeholder={placeholder}
      />
      <View className="absolute left-4" pointerEvents="none">
        <MaterialIcons size={20} name="search" className="text-muted" />
      </View>
      <Button
        className="absolute right-0"
        variant="ghost"
        onPress={() => setQuery("")}
        isIconOnly
        size="sm"
      >
        <MaterialIcons size={20} name="close" className="text-muted" />
      </Button>
    </View>
  );
}
