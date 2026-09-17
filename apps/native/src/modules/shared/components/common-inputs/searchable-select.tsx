import { Label } from "heroui-native/label";
import { Select } from "heroui-native/select";
import { Typography } from "heroui-native/text";
import { FlatList, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  KeyboardController,
} from "react-native-keyboard-controller";
import { Easing, FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchInput } from "../search-input";
import { FieldError } from "../field-error";
import type { SelectInputProps } from "./types";

export function SearchableSelect({
  isInvalid,
  errors,
  label,
  options,
  onChange,
  isRequired,
  value,
}: SelectInputProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const insetTop = insets.top + 12;
  const maxDialogHeight = (height - insetTop) / 2;

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetSearch = () => {
    setSearchQuery("");
  };

  return (
    <Select
      onOpenChange={(v) => v === false && KeyboardController.dismiss()}
      presentation="dialog"
      value={value}
      className="flex-1"
      onValueChange={(v) => {
        const option = options.find((o) => o.value === v?.value);

        if (option) onChange(option);
      }}
    >
      <Select.Trigger className="bg-default">
        {value ? (
          <View className="flex-row items-center gap-2">
            <Typography className="text-base" maxFontSizeMultiplier={1}>
              {value.label}
            </Typography>
          </View>
        ) : (
          <Typography className="" maxFontSizeMultiplier={1}>
            {t(label)}
          </Typography>
        )}
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay className="bg-black/50" />
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={24}>
          <Select.Content
            presentation="dialog"
            style={{ marginTop: insetTop, height: maxDialogHeight }}
            animation={{
              entering: FadeInDown.duration(250).easing(
                Easing.out(Easing.ease)
              ),
              exiting: FadeOutDown.duration(200).easing(Easing.in(Easing.ease)),
            }}
          >
            <View className="mb-2 w-full">
              <SearchInput
                autoFocus
                query={searchQuery}
                setQuery={setSearchQuery}
                placeholder={"api_errors.auth.sessions.invalid_credentials"}
              />
            </View>
            <FlatList
              data={filteredOptions}
              className="flex-1"
              keyboardShouldPersistTaps="handled"
              keyExtractor={(option) => option.value}
              renderItem={({ item: option }) => (
                <Select.Item
                  value={option.value}
                  label={option.label}
                  onPress={() => {
                    KeyboardController.dismiss();
                    resetSearch();
                  }}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    <Typography
                      className="text-foreground flex-1 text-base"
                      maxFontSizeMultiplier={1}
                    >
                      {option.label}
                    </Typography>
                  </View>
                  <Select.ItemIndicator />
                </Select.Item>
              )}
              ListEmptyComponent={
                <Typography
                  className="text-muted mt-8 text-center"
                  maxFontSizeMultiplier={1}
                >
                  {t("screens.categories.not_found")}
                </Typography>
              }
            />
          </Select.Content>
        </KeyboardAvoidingView>
      </Select.Portal>
      {errors && <FieldError errors={errors} />}
    </Select>
  );
}
