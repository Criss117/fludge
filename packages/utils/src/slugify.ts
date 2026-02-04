export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Reemplazar caracteres acentuados
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Reemplazar espacios y guiones bajos con guiones
      .replace(/[\s_]+/g, "-")
      // Eliminar caracteres especiales excepto guiones
      .replace(/[^\w\-]+/g, "")
      // Reemplazar múltiples guiones con uno solo
      .replace(/\-\-+/g, "-")
      // Eliminar guiones al inicio y final
      .replace(/^-+|-+$/g, "")
  );
}
