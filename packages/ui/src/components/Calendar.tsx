'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  availableDates?: Date[];
  unavailableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ 
    className, 
    selectedDate, 
    onDateSelect, 
    availableDates = [], 
    unavailableDates = [], 
    minDate, 
    maxDate, 
    ...props 
  }, ref) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days: (Date | null)[] = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      
      return days;
    };

    const isDateAvailable = (date: Date) => {
      const dateString = date.toDateString();
      
      // Check if date is in unavailable dates
      if (unavailableDates.some(d => d.toDateString() === dateString)) {
        return false;
      }
      
      // Check if date is before minDate or after maxDate
      if (minDate && date < minDate) return false;
      if (maxDate && date > maxDate) return false;
      
      // If availableDates is provided, only those dates are available
      if (availableDates.length > 0) {
        return availableDates.some(d => d.toDateString() === dateString);
      }
      
      // By default, all future dates are available
      return date >= new Date(new Date().setHours(0, 0, 0, 0));
    };

    const isDateSelected = (date: Date) => {
      return selectedDate && date.toDateString() === selectedDate.toDateString();
    };

    const handleDateClick = (date: Date) => {
      if (isDateAvailable(date) && onDateSelect) {
        onDateSelect(date);
      }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        if (direction === 'prev') {
          newMonth.setMonth(prev.getMonth() - 1);
        } else {
          newMonth.setMonth(prev.getMonth() + 1);
        }
        return newMonth;
      });
    };

    const days = getDaysInMonth(currentMonth);

    return (
      <div
        ref={ref}
        className={cn(
          'bg-background-paper rounded-card shadow-card p-6 font-sans',
          className
        )}
        {...props}
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <h2 className="font-serif text-heading-4 text-text-primary">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-body-xs font-medium text-text-secondary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-10" />;
            }

            const available = isDateAvailable(date);
            const selected = isDateSelected(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                disabled={!available}
                className={cn(
                  'h-10 w-10 rounded-button text-body-sm font-medium transition-all duration-200 ease-lea relative',
                  'focus:outline-none focus:ring-2 focus:ring-silver-accent/30',
                  available
                    ? 'text-text-primary hover:bg-elegant-silver hover:shadow-subtle cursor-pointer'
                    : 'text-text-muted cursor-not-allowed opacity-50',
                  selected && 'bg-deep-charcoal text-pure-white shadow-card hover:bg-primary-600'
                )}
              >
                {date.getDate()}
                
                {/* Available indicator dot */}
                {available && !selected && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-silver-accent rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-body-xs text-text-secondary">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-silver-accent rounded-full" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-deep-charcoal rounded-full" />
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';

export { Calendar };
