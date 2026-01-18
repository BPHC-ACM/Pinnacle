import { format, parseISO } from 'date-fns';

export const formatDateForDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return 'Present';
  try {
    // Ensure we're working with a Date object, whether the input is a string or Date
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMMM yyyy');
  } catch (error) {
    console.error('Invalid date value for formatting:', date);
    return 'Invalid Date';
  }
};

export const formatDateToYYYYMM = (date: Date | string | null | undefined): string | undefined => {
  if (!date) return undefined;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM');
  } catch (error) {
    console.error('Invalid date value for API formatting:', date);
    return undefined;
  }
};
