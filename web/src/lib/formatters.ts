/**
 * Format a number as Australian currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number as hours with 2 decimal places
 */
export const formatHours = (hours: number): string => {
  return hours.toFixed(2);
};

/**
 * Format a date as DD/MM/YYYY
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format a datetime as DD/MM/YYYY HH:MM
 */
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate total hours from time entries
 */
export const calculateTotalHours = (entries: Array<{
  start: string;
  end: string;
  unpaidBreakMins: number;
}>): number => {
  return entries.reduce((total, entry) => {
    const [startHour, startMin] = entry.start.split(':').map(Number);
    const [endHour, endMin] = entry.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes - entry.unpaidBreakMins;
    return total + Math.max(0, totalMinutes / 60);
  }, 0);
};
