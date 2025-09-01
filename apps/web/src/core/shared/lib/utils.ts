import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function avatarFallback(...inputs: string[]) {
  const initials = inputs.map((name) => name[0]).join("");

  return initials.toUpperCase();
}
