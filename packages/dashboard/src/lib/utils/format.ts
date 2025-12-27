/**
 * Format Utilities
 * Helpers for formatting numbers, currency, and text
 */

/**
 * Formats a number with thousands separators
 *
 * @param value - Number to format
 * @returns Formatted string (e.g., 1234 -> "1,234")
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(0) // "0"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Formats a number as currency (USD)
 *
 * @param value - Number to format
 * @returns Formatted currency string (e.g., 1234.56 -> "$1,234.56")
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(0) // "$0.00"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Formats a percentage value
 *
 * @param value - Decimal value (0-1) or whole number (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - Whether input is decimal (0-1) or whole (0-100)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.8567, 2, true) // "85.67%"
 * formatPercent(85.67, 2, false) // "85.67%"
 * formatPercent(0.5) // "50%"
 */
export function formatPercent(
  value: number,
  decimals: number = 0,
  isDecimal: boolean = true
): string {
  const percent = isDecimal ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Truncates text to a maximum length with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncate("This is a long string", 10) // "This is a..."
 * truncate("Short", 10) // "Short"
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalizes the first letter of a string
 *
 * @param text - Text to capitalize
 * @returns Text with first letter capitalized
 *
 * @example
 * capitalize("hello world") // "Hello world"
 * capitalize("HELLO") // "HELLO"
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a string to title case
 *
 * @param text - Text to convert
 * @returns Text in title case
 *
 * @example
 * titleCase("hello world") // "Hello World"
 * titleCase("HELLO WORLD") // "Hello World"
 */
export function titleCase(text: string): string {
  if (!text) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Pluralizes a word based on count
 *
 * @param count - Number to check
 * @param singular - Singular form of word
 * @param plural - Plural form of word (optional, defaults to singular + 's')
 * @returns Pluralized string with count
 *
 * @example
 * pluralize(1, "item") // "1 item"
 * pluralize(5, "item") // "5 items"
 * pluralize(1, "person", "people") // "1 person"
 * pluralize(3, "person", "people") // "3 people"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}

/**
 * Formats file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size
 *
 * @example
 * formatBytes(1024) // "1.00 KB"
 * formatBytes(1234567) // "1.18 MB"
 * formatBytes(0) // "0 Bytes"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Masks sensitive text (e.g., API keys)
 *
 * @param text - Text to mask
 * @param visibleChars - Number of visible characters at end (default: 4)
 * @param maskChar - Character to use for masking (default: '•')
 * @returns Masked text
 *
 * @example
 * maskText("sk_live_abc123def456", 6) // "sk_...def456"
 * maskText("secret123", 3) // "••••••123"
 */
export function maskText(
  text: string,
  visibleChars: number = 4,
  maskChar: string = '•'
): string {
  if (text.length <= visibleChars) return text;

  // For API keys starting with "sk_", keep prefix
  if (text.startsWith('sk_')) {
    const prefix = 'sk_';
    const suffix = text.slice(-visibleChars);
    return `${prefix}...${suffix}`;
  }

  const masked = maskChar.repeat(text.length - visibleChars);
  const visible = text.slice(-visibleChars);
  return masked + visible;
}
