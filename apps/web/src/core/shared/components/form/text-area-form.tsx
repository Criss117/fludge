import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { cn } from "@/core/shared/lib/utils";

interface Props<T extends FieldValues> {
  control: Control<T, unknown, T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  textAreaClassName?: string;
}

export function TextAreaForm<T extends FieldValues>({
  control,
  label,
  name,
  description,
  placeholder,
  textAreaClassName,
}: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={cn(textAreaClassName)}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
