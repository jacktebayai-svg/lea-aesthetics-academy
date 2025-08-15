'use client';

import React, { useState } from 'react';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  practitioner?: string;
}

export interface CalendarDay {
  date: Date;
  available: boolean;
  slots: TimeSlot[];
}

interface BookingCalendarProps {
  availableDays: CalendarDay[];
  selectedDate?: Date;
  selectedSlot?: TimeSlot;
  onDateSelect?: (date: Date) => void;
  onSlotSelect?: (slot: TimeSlot) => void;
  className?: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  availableDays,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get calendar grid for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: (Date | null)[] = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks of days
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        if (current.getMonth() === month || days.length < 7 || days.length > 28) {
          days.push(new Date(current));
        } else {
          days.push(null);
        }
        current.setDate(current.getDate() + 1);
      }
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateAvailable = (date: Date) => {
    return availableDays.some(day => 
      day.date.toDateString() === date.toDateString() && day.available
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const getAvailableSlots = (date: Date) => {
    const day = availableDays.find(d => d.date.toDateString() === date.toDateString());
    return day?.slots.filter(slot => slot.available) || [];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = getCalendarDays();
  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  return (
    <div className={`booking-calendar ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-surface rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-serif text-xl font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-surface rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-secondary p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={index} className="p-2" />;
          
          const available = isDateAvailable(date);
          const selected = isDateSelected(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <button
              key={date.toISOString()}
              onClick={() => available && onDateSelect?.(date)}
              disabled={!available || isPast}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-muted-gray' : ''}
                ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                ${available && !selected ? 'hover:bg-surface cursor-pointer' : ''}
                ${selected ? 'bg-primary text-white' : ''}
                ${available && !selected ? 'bg-surface border border-border' : ''}
                ${!available && isCurrentMonth && !isPast ? 'text-muted-gray cursor-not-allowed' : ''}
              `}
            >
              {date.getDate()}
              {available && !selected && (
                <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Available Time Slots */}
      {selectedDate && availableSlots.length > 0 && (
        <div>
          <h3 className="text-serif text-lg font-semibold mb-4">
            Available Times - {selectedDate.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSlotSelect?.(slot)}
                className={`
                  available-slot p-3 rounded-lg text-sm font-medium
                  ${selectedSlot?.id === slot.id ? 'selected-slot' : ''}
                `}
              >
                <div>{slot.time}</div>
                {slot.practitioner && (
                  <div className="text-xs mt-1 opacity-80">{slot.practitioner}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No slots available message */}
      {selectedDate && availableSlots.length === 0 && (
        <div className="text-center py-8">
          <p className="text-secondary">
            No available time slots for {selectedDate.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </p>
          <p className="text-sm text-muted-gray mt-2">
            Please select another date
          </p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedSlot && (
        <div className="mt-6 p-4 bg-surface rounded-lg">
          <h4 className="text-serif font-semibold mb-2">Selected Appointment</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Date:</strong> {selectedDate.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</p>
            <p><strong>Time:</strong> {selectedSlot.time}</p>
            {selectedSlot.practitioner && (
              <p><strong>Practitioner:</strong> {selectedSlot.practitioner}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
