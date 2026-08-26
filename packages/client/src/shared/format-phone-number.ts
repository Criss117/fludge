/**
 * Formatea una cadena de texto en tiempo real según una máscara dinámica.
 *
 * @param value - El texto ingresado en el input.
 * @param mask - Patrón de formato usando 'X' para representar cada dígito.
 */
export function formatPhoneNumber(
  value: string,
  mask: string = "(XXX) XXX-XXXX",
): string {
  const digits = value.replace(/\D/g, "");
  let formatted = "";
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === "X") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += mask[i];
    }
  }

  return formatted;
}
