/**
 * dates.ts - Small date library (no dependencies, never throws)
 *
 * Functions:
 *   parseDate(input)            -> Date | null
 *   formatDate(date)            -> "dd/mm/YYYY" | null
 *   timeSince(date, until?)     -> { years, months, days, hours, minutes, seconds, totalDays } | null
 *   ago(date, until?)           -> "hace 2 años, 3 meses y 5 días" | null
 *
 * Every function returns null when the input is invalid instead of throwing.
 */

export type DateInput = Date | number | string;

export interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

const pad = (value: number, length = 2): string => String(value).padStart(length, "0");

const isValidDate = (date: Date): boolean => !isNaN(date.getTime());

const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

/**
 * Converts the input into a Date, or returns null if it can't be interpreted.
 * Accepts: Date, timestamp (number), "dd/mm/YYYY" or any ISO-like string.
 */
export function parseDate(input: DateInput): Date | null {
  if (input instanceof Date) {
    return isValidDate(input) ? new Date(input.getTime()) : null;
  }

  if (typeof input === "number") {
    const date = new Date(input);
    return isValidDate(date) ? date : null;
  }

  if (typeof input === "string") {
    const match = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);
      const date = new Date(year, month - 1, day);
      // Rejects impossible dates such as 31/02/2024
      const isReal =
        date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
      return isReal ? date : null;
    }

    const date = new Date(input);
    return isValidDate(date) ? date : null;
  }

  return null;
}

/** Returns the date formatted as dd/mm/YYYY, or null if the input is invalid. */
export function formatDate(input: DateInput): string | null {
  const date = parseDate(input);
  if (!date) return null;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear(), 4)}`;
}

/**
 * Time elapsed between `from` and `until` (defaults to now), or null if either is invalid.
 * Uses real calendar months and years (it doesn't assume 30 days per month).
 */
export function timeSince(from: DateInput, until: DateInput = new Date()): Duration | null {
  const first = parseDate(from);
  const second = parseDate(until);
  if (!first || !second) return null;

  const [start, end] = first <= second ? [first, second] : [second, first];

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    days += daysInMonth(end.getFullYear(), end.getMonth() - 1);
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
  return { years, months, days, hours, minutes, seconds, totalDays };
}

export interface AgoOptions {
  /** If true and 24 hours or more have passed, returns the date as dd/mm/YYYY instead of the text. */
  dateAfter24h?: boolean;
}

/**
 * Human-readable text such as "hace 2 años, 3 meses y 5 días", or null if invalid.
 * With `{ dateAfter24h: true }`, returns "dd/mm/YYYY" once 24 hours or more have passed.
 */
export function ago(
  from: DateInput,
  until: DateInput = new Date(),
  options: AgoOptions = {},
): string | null {
  const elapsed = timeSince(from, until);
  if (!elapsed) return null;

  if (options.dateAfter24h && elapsed.totalDays >= 1) {
    return formatDate(from);
  }

  const units: [string, string, number][] = [
    ["año", "años", elapsed.years],
    ["mes", "meses", elapsed.months],
    ["día", "días", elapsed.days],
    ["hora", "horas", elapsed.hours],
    ["minuto", "minutos", elapsed.minutes],
    ["segundo", "segundos", elapsed.seconds],
  ];

  // Keeps the first 3 non-zero units
  const parts = units
    .filter(([, , amount]) => amount > 0)
    .slice(0, 3)
    .map(([singular, plural, amount]) => `${amount} ${amount === 1 ? singular : plural}`);

  if (parts.length === 0) return "justo ahora";
  if (parts.length === 1) return `hace ${parts[0]}`;
  return `hace ${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}
