/**
 * Date Utilities
 * Helpers for formatting dates and timestamps using date-fns
 */

import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
  formatRelative as dateFnsFormatRelative,
} from 'date-fns';

/**
 * Formats a timestamp for display in tables/lists
 *
 * @param timestamp - Unix timestamp (seconds) or ISO string
 * @returns Formatted date string (e.g., "Dec 24, 2025 at 3:45 PM")
 *
 * @example
 * formatTimestamp(1703433600) // "Dec 24, 2023 at 12:00 PM"
 * formatTimestamp("2023-12-24T12:00:00Z") // "Dec 24, 2023 at 12:00 PM"
 */
export function formatTimestamp(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp * 1000);
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Formats a timestamp for detailed views
 *
 * @param timestamp - Unix timestamp (seconds) or ISO string
 * @returns Formatted date string (e.g., "December 24, 2025 at 3:45:30 PM")
 *
 * @example
 * formatTimestampDetailed(1703433600) // "December 24, 2023 at 12:00:00 PM"
 */
export function formatTimestampDetailed(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp * 1000);
  return format(date, "MMMM d, yyyy 'at' h:mm:ss a");
}

/**
 * Formats a date for display (no time)
 *
 * @param timestamp - Unix timestamp (seconds) or ISO string
 * @returns Formatted date string (e.g., "Dec 24, 2025")
 *
 * @example
 * formatDate(1703433600) // "Dec 24, 2023"
 * formatDate("2023-12-24") // "Dec 24, 2023"
 */
export function formatDate(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp * 1000);
  return format(date, 'MMM d, yyyy');
}

/**
 * Formats a time (no date)
 *
 * @param timestamp - Unix timestamp (seconds) or ISO string
 * @returns Formatted time string (e.g., "3:45 PM")
 *
 * @example
 * formatTime(1703433600) // "12:00 PM"
 */
export function formatTime(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp * 1000);
  return format(date, 'h:mm a');
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 *
 * @param timestamp - Unix timestamp (seconds) or ISO string
 * @param addSuffix - Whether to add "ago" suffix (default: true)
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(Date.now() / 1000 - 3600) // "about 1 hour ago"
 * formatRelativeTime(Date.now() / 1000 + 3600, false) // "about 1 hour"
 */
export function formatRelativeTime(
  timestamp: number | string,
  addSuffix: boolean = true
): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp * 1000);
  return formatDistanceToNow(date, { addSuffix });
}

/**
 * Formats a relative date (e.g., "Today at 3:45 PM", "Yesterday at 2:30 PM")
 *
 * @param timestamp - Unix timestamp (seconds) or ISO string
 * @returns Smart relative date string
 *
 * @example
 * formatSmartDate(Date.now() / 1000) // "Today at 3:45 PM"
 * formatSmartDate(Date.now() / 1000 - 86400) // "Yesterday at 3:45 PM"
 * formatSmartDate(Date.now() / 1000 - 172800) // "Dec 22, 2025 at 3:45 PM"
 */
export function formatSmartDate(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp * 1000);

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }

  return formatTimestamp(timestamp);
}

/**
 * Formats a date range
 *
 * @param start - Start timestamp
 * @param end - End timestamp
 * @returns Formatted date range string
 *
 * @example
 * formatDateRange(start, end) // "Dec 24, 2025 - Dec 31, 2025"
 * formatDateRange(start, end) // "Dec 24 - 25, 2025" (same month/year)
 */
export function formatDateRange(
  start: number | string,
  end: number | string
): string {
  const startDate = typeof start === 'string' ? parseISO(start) : new Date(start * 1000);
  const endDate = typeof end === 'string' ? parseISO(end) : new Date(end * 1000);

  const startFormatted = format(startDate, 'MMM d, yyyy');
  const endFormatted = format(endDate, 'MMM d, yyyy');

  // Same date
  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  // Same month and year
  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
  }

  // Same year
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }

  // Different years
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Formats duration in minutes to human-readable format
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(30) // "30 minutes"
 * formatDuration(90) // "1 hour 30 minutes"
 * formatDuration(60) // "1 hour"
 * formatDuration(1440) // "1 day"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours === 0) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  return `${days} day${days === 1 ? '' : 's'} ${remainingHours} hour${remainingHours === 1 ? '' : 's'}`;
}

/**
 * Converts ISO string to Unix timestamp (seconds)
 *
 * @param isoString - ISO 8601 date string
 * @returns Unix timestamp in seconds
 *
 * @example
 * toUnixTimestamp("2023-12-24T12:00:00Z") // 1703433600
 */
export function toUnixTimestamp(isoString: string): number {
  return Math.floor(parseISO(isoString).getTime() / 1000);
}

/**
 * Converts Unix timestamp to ISO string
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns ISO 8601 date string
 *
 * @example
 * toISOString(1703433600) // "2023-12-24T12:00:00.000Z"
 */
export function toISOString(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}
