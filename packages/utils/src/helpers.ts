export function toAvatarFallback(name: string) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return initials;
}
