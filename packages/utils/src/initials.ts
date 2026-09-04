export function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (first && last && first[0] && last[0]) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }
  }
  return name.substring(0, 2).toUpperCase();
}
