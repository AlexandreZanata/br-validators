import type { ParsedUtcDate } from './types.js';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDateString(value: string): ParsedUtcDate | null {
  const match = ISO_DATE_PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidUtcDateParts(year, month, day)) {
    return null;
  }
  return { year, month, day };
}

export function parseDateInput(input: string | Date): ParsedUtcDate | null {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      return null;
    }
    return {
      year: input.getUTCFullYear(),
      month: input.getUTCMonth() + 1,
      day: input.getUTCDate(),
    };
  }
  return parseIsoDateString(input.trim());
}

export function formatIsoDate(parts: ParsedUtcDate): string {
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${String(parts.year)}-${month}-${day}`;
}

export function addUtcDays(parts: ParsedUtcDate, days: number): ParsedUtcDate {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function isWeekendUtc(parts: ParsedUtcDate): boolean {
  const dayOfWeek = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/** Easter Sunday — Meeus/Jones/Butcher Gregorian algorithm (Computus). */
export function easterSunday(year: number): ParsedUtcDate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

function isValidUtcDateParts(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
