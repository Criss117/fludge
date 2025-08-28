import type { ComponentProps } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import type { FieldValues, Path, Control } from "react-hook-form";

interface Props<T extends FieldValues> extends ComponentProps<"input"> {
  control: Control<T, unknown, T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
}

export function InputForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  ...props
}: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} placeholder={placeholder} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
