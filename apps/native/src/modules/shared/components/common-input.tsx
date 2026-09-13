import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import {
  type BlurEvent,
  type FocusEvent,
  FlatList,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialIcons } from "./icons";
import { FieldError } from "./field-error";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Button } from "heroui-native/button";
import { TextArea } from "heroui-native/text-area";
import { useTranslation } from "react-i18next";
import { TranslationKey } from "@fludge/i18n/index";
import { ControlField } from "heroui-native/control-field";
import { Description } from "heroui-native/description";
import { Select } from "heroui-native/select";
import { Typography } from "heroui-native/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  KeyboardController,
} from "react-native-keyboard-controller";
import { Easing, FadeInDown, FadeOutDown } from "react-native-reanimated";
import { SearchInput } from "./search-input";
import { cn } from "heroui-native";
import { formatPrice } from "@fludge/utils/currency";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface BaseInputProps {
  isRequired?: boolean;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  label: TranslationKey;
  icon?: MaterialIconName;
}

interface TextInputProps extends BaseInputProps {
  inputProps: Omit<ComponentProps<typeof Input>, "placeholder"> & {
    placeholder: TranslationKey;
  };
}

interface SwitchInputProps extends BaseInputProps {
  isSelected: boolean;
  onSelectedChange: (v: boolean) => void;
  description?: TranslationKey;
}

interface SelectInputProps extends BaseInputProps {
  options: Array<{ label: string; value: string }>;
  onChange: (v: { label: string; value: string }) => void;
  value?: { label: string; value: string };
}

interface NumberInputProps extends BaseInputProps {
  inputProps: Omit<
    ComponentProps<typeof Input>,
    "placeholder" | "value" | "onChangeText"
  > & {
    placeholder: TranslationKey;
    value: number;
    onChangeText: (v: number) => void;
  };
}

interface TextAreaInputProps {
  isRequired?: boolean;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  label: TranslationKey;
  inputProps: Omit<ComponentProps<typeof TextArea>, "placeholder"> & {
    placeholder: TranslationKey;
  };
}

function TextInput({
  isRequired,
  isInvalid,
  label,
  icon,
  errors,
  inputProps,
}: TextInputProps) {
  const { t } = useTranslation();

  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired}>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <View className="w-full flex-row items-center">
        <Input
          {...inputProps}
          placeholder={t(inputProps.placeholder)}
          className={cn("flex-1 px-10", inputProps.className)}
          isInvalid={isInvalid}
        />
        {icon && (
          <View className="absolute inset-s-3.5" pointerEvents="none">
            <MaterialIcons size={20} name={icon} className="text-muted" />
          </View>
        )}
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

function NumberInput({
  isRequired,
  isInvalid,
  label,
  icon,
  errors,
  inputProps,
}: Omit<NumberInputProps, "label"> & {
  label?: TranslationKey;
}) {
  const { t } = useTranslation();

  // Buffer local de texto, independiente del número parseado
  const [text, setText] = useState(
    inputProps.value != null ? String(inputProps.value) : ""
  );

  // Sincroniza si el valor cambia desde afuera (ej. reset del form)
  useEffect(() => {
    const external = inputProps.value != null ? String(inputProps.value) : "";
    // Solo pisamos el texto si el número que representa es distinto
    // al que ya tenemos, para no interrumpir mientras el usuario escribe.
    if (Number(text) !== inputProps.value) {
      setText(external);
    }
  }, [inputProps.value]);

  const onChangeText = (v: string) => {
    // Permite estados intermedios válidos mientras se escribe
    if (v === "" || v === "-" || v === "." || v === "-.") {
      setText(v);
      return;
    }

    // Solo dígitos, un signo negativo opcional y un punto decimal opcional
    if (!/^-?\d*\.?\d*$/.test(v)) return;

    setText(v);

    const n = Number(v);
    if (!isNaN(n)) {
      inputProps.onChangeText?.(n);
    }
  };

  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired}>
      {label && <Label isInvalid={isInvalid}>{t(label)}</Label>}
      <View className="w-full flex-row items-center">
        <Input
          {...inputProps}
          value={text}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={t(inputProps.placeholder)}
          className={cn("flex-1 px-10", inputProps.className)}
          isInvalid={isInvalid}
        />
        {icon && (
          <View className="absolute inset-s-3.5" pointerEvents="none">
            <MaterialIcons size={20} name={icon} className="text-muted" />
          </View>
        )}
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

function TextAreaInput({
  isRequired,
  isInvalid,
  label,
  errors,
  inputProps,
}: TextAreaInputProps) {
  const { t } = useTranslation();

  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired}>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <TextArea
        {...inputProps}
        placeholder={t(inputProps.placeholder)}
        className={cn("flex-1", inputProps.className)}
        isInvalid={isInvalid}
      />
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

function PasswordInput({
  isInvalid,
  errors,
  label,
  inputProps,
}: Omit<TextInputProps, "icon" | "isRequired">) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField isInvalid={isInvalid} isRequired>
      <Label isInvalid={isInvalid}>{t(label)}</Label>
      <View className="w-full flex-row items-center">
        <Input
          {...inputProps}
          className={cn("flex-1 px-10", inputProps.className)}
          placeholder={t(inputProps.placeholder)}
          secureTextEntry={!showPassword}
          aria-invalid={isInvalid}
        />
        <View className="absolute inset-s-3.5" pointerEvents="none">
          <MaterialIcons size={20} name="lock-outline" className="text-muted" />
        </View>
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setShowPassword((prev) => !prev)}
          className="absolute inset-e-0"
        >
          {showPassword ? (
            <MaterialIcons
              name="visibility-off"
              size={20}
              className="text-muted"
            />
          ) : (
            <MaterialIcons name="visibility" size={20} className="text-muted" />
          )}
        </Button>
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

function SwitchInput({
  isSelected,
  onSelectedChange,
  description,
  isInvalid,
  errors,
  label,
}: SwitchInputProps) {
  const { t } = useTranslation();

  return (
    <ControlField
      isSelected={isSelected}
      onSelectedChange={onSelectedChange}
      isInvalid={isInvalid}
    >
      <View className="flex-row items-center py-2">
        <View className="flex-1 gap-x-4">
          <Label>{t(label)}</Label>
          {description && <Description>{t(description)}</Description>}
        </View>
        <ControlField.Indicator />
      </View>
      {isInvalid && <FieldError errors={errors} />}
    </ControlField>
  );
}

function SearchableSelect({
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

// react-doctor-disable-next-line only-export-components -- This component namespace is the public shared-input composition API.
export const CommonInputs = {
  TextInput,
  TextAreaInput,
  PasswordInput,
  NumberInput,
  SwitchInput,
  SearchableSelect,
};
