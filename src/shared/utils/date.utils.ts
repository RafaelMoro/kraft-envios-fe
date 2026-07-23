import { DateTime } from "luxon";

import { BUSINESS_TIMEZONE } from "@/shared/constants/global.constants";

export type FormattedBusinessTimestamp = {
  fullDateTime: string;
  date: string;
  time: string;
};

export type BusinessMonthYear = {
  month: number;
  year: number;
};

export type BusinessDateRange = {
  startDate: string;
  endDate: string;
};

const MONTHS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const PLACEHOLDER: FormattedBusinessTimestamp = {
  fullDateTime: '--',
  date: '--',
  time: '--',
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Contract requires a complete instant (`Z` or a numeric offset); offsetless
 * strings would otherwise be silently reinterpreted as browser-local time.
 */
const hasExplicitOffset = (timestamp: string): boolean =>
  /Z$|[+-]\d{2}:?\d{2}$/.test(timestamp.trim());

const getBusinessDateParts = (date: Date): Record<string, string> => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return parts.reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
};

export const formatDateToSpanish = (
  timestamp: string,
): FormattedBusinessTimestamp => {
  if (typeof timestamp !== 'string' || !hasExplicitOffset(timestamp)) {
    return PLACEHOLDER;
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return PLACEHOLDER;
  }

  const parts = getBusinessDateParts(date);
  const month = MONTHS_ES[Number(parts.month) - 1];
  const day = Number(parts.day);
  // en-US non-hour12 formatting reports midnight as "24"; normalize to 0.
  let hours = Number(parts.hour === '24' ? '0' : parts.hour);
  const minutes = parts.minute;
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedHours = hours.toString().padStart(2, '0');
  const dateFormatted = `${month} ${day}`;
  const timeFormatted = `${formattedHours}:${minutes} ${ampm}`;

  return {
    fullDateTime: `${dateFormatted}, ${timeFormatted}`,
    date: dateFormatted,
    time: timeFormatted,
  };
};

export const getBusinessCalendarMonthYear = (
  instant: Date = new Date(),
): BusinessMonthYear => {
  const parts = getBusinessDateParts(instant);
  return {
    month: Number(parts.month),
    year: Number(parts.year),
  };
};

export const toBusinessDateRange = (
  startDate: string,
  endDate: string,
): BusinessDateRange | null => {
  if (!DATE_ONLY_PATTERN.test(startDate) || !DATE_ONLY_PATTERN.test(endDate)) {
    return null;
  }

  const start = DateTime.fromISO(startDate, { zone: BUSINESS_TIMEZONE });
  const end = DateTime.fromISO(endDate, { zone: BUSINESS_TIMEZONE });

  if (!start.isValid || !end.isValid || end < start) {
    return null;
  }

  const exclusiveEnd = end.plus({ days: 1 });

  return {
    startDate: start.startOf('day').toUTC().toISO() as string,
    endDate: exclusiveEnd.startOf('day').toUTC().toISO() as string,
  };
};
