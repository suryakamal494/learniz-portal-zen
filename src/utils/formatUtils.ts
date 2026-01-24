// Formatting utility functions for consistent number and time display

/**
 * Format numbers intelligently - show decimals only when needed
 * "33.0" becomes "33", "33.5" stays "33.5"
 */
export function formatNumber(value: number, maxDecimals: number = 1): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  // Check if the decimal part rounds to 0
  const rounded = Number(value.toFixed(maxDecimals));
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  return rounded.toString();
}

/**
 * Convert decimal hours to human-readable format
 * 6.7 becomes "6h 42m", 4.0 becomes "4h 0m"
 */
export function formatHoursMinutes(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h 0m`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format hours in short form for compact displays
 * 6.7 becomes "6h 42m", 4.0 becomes "4h"
 */
export function formatHoursShort(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format hours range: "4h 0m / 6h 42m"
 */
export function formatHoursRange(completed: number, total: number): string {
  return `${formatHoursShort(completed)} / ${formatHoursShort(total)}`;
}
