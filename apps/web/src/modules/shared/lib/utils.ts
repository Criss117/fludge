import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const inputNumberHelper = {
  value: (value: string, isTouched: boolean) =>
    value.toString() === "0" && !isTouched ? "" : value.toString(),
  onChange: (value: string) => {
    const val = value === "" ? undefined : Number(value);
    return val?.toString() || "";
  },
};
