import { useState, useMemo, useCallback } from 'react';
import type { CalendarEvent, MonthViewProps } from '../types/calendar.zod';
import CalendarEventComponent from './CalendarEvent';

export default function MonthView({
  events,
  currentDate,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateChange,
  onNavigate
}: MonthViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Get the month dates (6 weeks to fill the calendar grid)
  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days back
    startDate.setDate(startDate.getDate() - daysToMonday);
    
    // Generate 6 weeks (42 days) starting from the Monday
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get events for a specific date, limited to 3 for display
  const getDisplayEventsForDate = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.slice(0, 3); // Show max 3 events
  };

  // Get overflow count for events beyond the 3 displayed
  const getOverflowCount = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    return Math.max(0, dayEvents.length - 3);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onEventClick(event);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    onEventUpdate(event);
  };

  const handleEventDelete = (eventId: string) => {
    onEventDelete(eventId);
    setSelectedEvent(null);
  };

  const handleDateClick = (date: Date) => {
    // Create event at 9 AM for the clicked date
    const eventDate = new Date(date);
    eventDate.setHours(9, 0, 0, 0);
    onEventCreate(eventDate, '09:00');
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    
    return {
      dayNumber: date.getDate(),
      isToday,
      isCurrentMonth
    };
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      resistance: 'bg-blue-100 text-blue-800 border-blue-200',
      cme: 'bg-green-100 text-green-800 border-green-200',
      recovery: 'bg-purple-100 text-purple-800 border-purple-200',
      goal: 'bg-amber-100 text-amber-800 border-amber-200',
      milestone: 'bg-orange-100 text-orange-800 border-orange-200',
      event: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getEventTime = (event: CalendarEvent) => {
    const startTime = new Date(event.startTime);
    return startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-700 hover:text-slate-900"
            >
              ←
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-3 py-1 text-sm bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-700 hover:text-slate-900"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-600 bg-slate-50 border-r border-slate-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-7">
          {monthDates.map((date, index) => {
            const { dayNumber, isToday, isCurrentMonth } = formatDateHeader(date);
            const dayEvents = getDisplayEventsForDate(date);
            const overflowCount = getOverflowCount(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-slate-200 last:border-r-0 p-2 cursor-pointer hover:bg-slate-50 transition-colors ${
                  !isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'bg-white'
                }`}
                onClick={() => handleDateClick(date)}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday 
                      ? 'bg-sky-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                      : isCurrentMonth 
                        ? 'text-slate-800' 
                        : 'text-slate-400'
                  }`}>
                    {dayNumber}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getEventTypeColor(event.type)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium truncate">
                          {getEventTime(event)}
                        </span>
                      </div>
                      <div className="text-xs font-medium truncate">
                        {event.title}
                      </div>
                    </div>
                  ))}
                  
                  {/* Overflow indicator */}
                  {overflowCount > 0 && (
                    <div className="text-xs text-slate-500 font-medium">
                      +{overflowCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Title</label>
                <p className="text-slate-800 font-medium">{selectedEvent.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Start Time</label>
                  <p className="text-slate-800">
                    {new Date(selectedEvent.startTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">End Time</label>
                  <p className="text-slate-800">
                    {new Date(selectedEvent.endTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Type</label>
                <p className="text-slate-800 capitalize">{selectedEvent.type}</p>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <p className="text-slate-800">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEventEdit(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
              >
                Edit Event
              </button>
              <button
                onClick={() => {
                  handleEventDelete(selectedEvent.id);
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
