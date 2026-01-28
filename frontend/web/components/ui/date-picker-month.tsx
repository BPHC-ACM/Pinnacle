// components/ui/date-picker-month.tsx

'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// A simple, flat array for easier mapping
const MONTHS = [
  { name: 'Jan', number: 0 },
  { name: 'Feb', number: 1 },
  { name: 'Mar', number: 2 },
  { name: 'Apr', number: 3 },
  { name: 'May', number: 4 },
  { name: 'Jun', number: 5 },
  { name: 'Jul', number: 6 },
  { name: 'Aug', number: 7 },
  { name: 'Sep', number: 8 },
  { name: 'Oct', number: 9 },
  { name: 'Nov', number: 10 },
  { name: 'Dec', number: 11 },
];

interface DatePickerWithMonthProps {
  value: Date | string | null | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePickerWithMonth({
  value,
  onChange,
  placeholder = 'Select a month',
  className,
  disabled,
  minDate,
  maxDate,
}: DatePickerWithMonthProps) {
  const [open, setOpen] = React.useState(false);

  // Safely create a Date object from the value prop (handles strings from API)
  const dateValue = React.useMemo(() => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return undefined;
  }, [value]);

  const handleMonthSelect = (date: Date) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !dateValue && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, 'MMM yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <MonthCalendar
          selectedMonth={dateValue}
          onMonthSelect={handleMonthSelect}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
}

// --- Internal Calendar Component ---
interface MonthCalendarProps {
  selectedMonth?: Date;
  onMonthSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

function MonthCalendar({ selectedMonth, onMonthSelect, minDate, maxDate }: MonthCalendarProps) {
  const [displayYear, setDisplayYear] = React.useState<number>(
    selectedMonth?.getFullYear() ?? new Date().getFullYear(),
  );

  const selectedMonthValue = selectedMonth?.getMonth();
  const selectedYearValue = selectedMonth?.getFullYear();

  const canGoBackward = !minDate || displayYear > minDate.getFullYear();
  const canGoForward = !maxDate || displayYear < maxDate.getFullYear();

  return (
    <div className="w-55 space-y-2">
      {/* Year Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setDisplayYear(displayYear - 1)}
          variant="ghost"
          size="icon"
          disabled={!canGoBackward}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-semibold">{displayYear}</div>
        <Button
          onClick={() => setDisplayYear(displayYear + 1)}
          variant="ghost"
          size="icon"
          disabled={!canGoForward}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-4 gap-2">
        {MONTHS.map((month) => {
          const isSelected =
            selectedYearValue === displayYear && selectedMonthValue === month.number;

          const isDisabledByMin = minDate
            ? displayYear < minDate.getFullYear() ||
              (displayYear === minDate.getFullYear() && month.number < minDate.getMonth())
            : false;
          const isDisabledByMax = maxDate
            ? displayYear > maxDate.getFullYear() ||
              (displayYear === maxDate.getFullYear() && month.number > maxDate.getMonth())
            : false;
          const isDisabled = isDisabledByMin || isDisabledByMax;

          return (
            <Button
              key={month.name}
              onClick={() => onMonthSelect(new Date(displayYear, month.number))}
              disabled={isDisabled}
              variant={isSelected ? 'default' : 'ghost'}
              className="h-auto p-2 text-xs" // Proper sizing for a tight grid
            >
              {month.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
