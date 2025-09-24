import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { CalendarEvent, WeekViewProps, TimeSlot } from '(protected)/tools/calendar/types/calendar.zod';
import CalendarEventComponent from '(protected)/tools/calendar/components/CalendarEvent';
import FitnessDashboard from '(protected)/tools/calendar/components/WeeklyMetrics';

export default function WeekView({
  events,
  currentDate,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateChange,
  onNavigate
}: WeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollBarRef = useRef<HTMLDivElement>(null);

  // Generate all 24 hours of time slots with half-hour marks
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      // Full hour slot
      slots.push({
        hour,
        minute: 0,
        display: new Date(2000, 0, 1, hour, 0).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        })
      });
      // Half hour slot (no display text, just for dividers)
      slots.push({
        hour,
        minute: 30,
        display: '' // No display text for half-hour marks
      });
    }
    return slots;
  }, []);

  // Get the week dates
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Get events for a specific date and time slot
  const getEventsForSlot = (date: Date, timeSlot: TimeSlot) => {
    const slotStart = new Date(date);
    slotStart.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      // Check if event overlaps with this time slot
      return eventStart < slotEnd && eventEnd > slotStart;
    });
  };

  // Get events that start in a specific time slot (for continuous rendering)
  const getEventsStartingInSlot = (date: Date, timeSlot: TimeSlot) => {
    const slotStart = new Date(date);
    slotStart.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventDate = new Date(eventStart);
      eventDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      // Check if event starts in this exact time slot and is on the same date
      return eventDate.getTime() === checkDate.getTime() && 
             eventStart >= slotStart && eventStart < slotEnd;
    });
  };

  // Get all events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleTimeSlotClick = (date: Date, timeSlot: TimeSlot) => {
    const timeString = `${timeSlot.hour.toString().padStart(2, '0')}:00`;
    onEventCreate(date, timeString);
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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    setScrollPosition(scrollTop);
    
    // Synchronize all other scrollable areas
    scrollRefs.current.forEach((ref) => {
      if (ref && ref !== target) {
        ref.scrollTop = scrollTop;
      }
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Only handle vertical scroll wheel
    if (Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      e.stopPropagation();
      // Find the scrollable column (last day column) and scroll it
      const scrollableRef = scrollRefs.current[weekDates.length]; // Last column index
      if (scrollableRef) {
        const delta = e.deltaY;
        scrollableRef.scrollTop += delta;
      }
    }
  }, [weekDates.length]);

  const handleDatePickerToggle = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleDateSelect = (selectedDate: Date) => {
    // Calculate the start of the week that contains the selected date
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);
    
    onDateChange(startOfWeek);
    setIsDatePickerOpen(false);
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday
    };
  };

  // Calculate current time position and check if it's in current week
  const getCurrentTimePosition = () => {
    const now = new Date(); // Use actual current time instead of state
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate position in pixels (32px per 30-minute slot)
    // Each hour has 2 slots (0-30min and 30-60min), so 32px per slot
    const totalMinutes = currentHour * 60 + currentMinute;
    const position = (totalMinutes / 30) * 32; // 32px per 30-minute slot
    
    // Check if current time is within the displayed week
    const today = new Date();
    const isInCurrentWeek = weekDates.some(date => 
      date.toDateString() === today.toDateString()
    );
    
    // Find which day index is today
    const todayIndex = weekDates.findIndex(date => 
      date.toDateString() === today.toDateString()
    );
    
    return {
      position,
      isInCurrentWeek,
      todayIndex,
      timeString: now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      currentHour,
      currentMinute
    };
  };

  // Initialize scroll refs array
  useEffect(() => {
    scrollRefs.current = new Array(weekDates.length + 1).fill(null);
  }, [weekDates.length]);

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Update immediately
    updateTime();

    // Set up interval to update every minute
    const interval = setInterval(updateTime, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate scroll position to show current time ± 2.5 hours
    // Each slot is 32px, and we have 2 slots per hour (full hour + half hour)
    const totalMinutes = currentHour * 60 + currentMinute;
    const scrollToMinutes = Math.max(0, totalMinutes - 150); // 2.5 hours = 150 minutes
    const scrollPosition = (scrollToMinutes / 30) * 32; // 30 minutes per slot, 32px per slot
    
    // Scroll all areas to current time
    const scrollAll = () => {
      scrollRefs.current.forEach((ref) => {
        if (ref) {
          ref.scrollTop = scrollPosition;
        }
      });
    };
    
    // Try multiple times to ensure refs are set
    scrollAll();
    setTimeout(scrollAll, 50);
    setTimeout(scrollAll, 100);
    setTimeout(scrollAll, 200);
  }, [scrollRefs]);

  return (
    <div className="space-y-6">
      {/* Calendar Section */}
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
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-600">
              Week of {weekDates[0].toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {weekDates[6].toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <button
              onClick={handleDatePickerToggle}
              className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-600 hover:text-slate-800"
              title="Select date"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

      {/* Calendar Grid */}
      <div 
        className="border border-slate-200 rounded-lg bg-white overflow-hidden"
        onWheel={handleWheel}
      >
        {/* Header Row with Fixed Left Column */}
        <div className="flex">
          <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50">
            <div className="h-16 border-b border-slate-200 flex items-center justify-center">
              <div className="text-sm font-medium text-slate-700">Time</div>
            </div>
          </div>
          <div className="flex-1 flex">
            {weekDates.map((date, dayIndex) => {
              const { dayName, dayNumber, isToday } = formatDateHeader(date);
              
              return (
                <div key={dayIndex} className="flex-1 border-r border-slate-200 last:border-r-0">
                  {/* Day Header */}
                  <div className={`h-16 border-b border-slate-200 flex flex-col items-center justify-center ${
                    isToday ? 'bg-sky-50' : 'bg-slate-50'
                  }`}>
                    <div className={`text-sm font-medium ${
                      isToday ? 'text-sky-700' : 'text-slate-700'
                    }`}>
                      {dayName}
                    </div>
                    <div className={`text-lg font-bold ${
                      isToday ? 'text-sky-800' : 'text-slate-800'
                    }`}>
                      {dayNumber}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slots Row */}
        <div className="flex" onWheel={handleWheel}>
          <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50">
            <div 
              className="overflow-hidden max-h-96"
              ref={(el) => { scrollRefs.current[0] = el; }}
            >
              <div className="relative">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="h-8 flex items-end justify-end pr-2 pb-6"
                  >
                    {slot.display && (
                      <span className="text-xs text-slate-500">
                        {slot.display}
                      </span>
                    )}
                  </div>
                ))}
                
                {/* Current Time Label - positioned absolutely */}
                {(() => {
                  const currentTimePos = getCurrentTimePosition();
                  if (currentTimePos.isInCurrentWeek) {
                    return (
                      <div
                        className="absolute right-2 text-xs text-red-600 font-semibold pointer-events-none"
                        style={{ top: `${currentTimePos.position}px` }}
                      >
                        {currentTimePos.timeString}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Day Columns */}
          <div className="flex-1 flex">
            {weekDates.map((date, dayIndex) => {
              const dayEvents = getEventsForDate(date);
              const isLastColumn = dayIndex === weekDates.length - 1;
              
              return (
                <div key={dayIndex} className="flex-1 border-r border-slate-200 last:border-r-0">
                  <div 
                    className={`relative max-h-96 ${
                      isLastColumn 
                        ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100' 
                        : 'overflow-hidden'
                    }`}
                    ref={(el) => { scrollRefs.current[dayIndex + 1] = el; }}
                    onScroll={isLastColumn ? handleScroll : undefined}
                  >
                    <div className="relative">
                      {/* Current Time Horizontal Line - Only on current day */}
                      {(() => {
                        const currentTimePos = getCurrentTimePosition();
                        if (currentTimePos.isInCurrentWeek && currentTimePos.todayIndex === dayIndex) {
                          return (
                            <div
                              className="absolute left-0 right-0 z-20 pointer-events-none"
                              style={{ top: `${currentTimePos.position}px` }}
                            >
                              <div className="h-0.5 bg-red-500 w-full"></div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {timeSlots.map((slot, slotIndex) => {
                        const slotEvents = getEventsStartingInSlot(date, slot);
                        
                        return (
                          <div
                            key={slotIndex}
                            className="h-8 border-b border-slate-100 relative hover:bg-slate-50 cursor-pointer group"
                            onClick={() => handleTimeSlotClick(date, slot)}
                          >
                            {/* Event Overlay - Only render events that start in this slot */}
                            {slotEvents.map((event, eventIndex) => {
                              const eventStart = new Date(event.startTime);
                              const eventEnd = new Date(event.endTime);
                              const slotStart = new Date(date);
                              slotStart.setHours(slot.hour, slot.minute, 0, 0);
                              
                              // Calculate the height and position of the event block
                              const startOffset = (eventStart.getMinutes() - slotStart.getMinutes()) * (32 / 30); // 32px per 30min slot
                              const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 30); // Duration in 30min slots
                              const eventHeight = duration * 32; // Height in pixels
                              
                              return (
                                <CalendarEventComponent
                                  key={event.id}
                                  event={event}
                                  onClick={handleEventClick}
                                  onEdit={handleEventEdit}
                                  onDelete={handleEventDelete}
                                  isSelected={selectedEvent?.id === event.id}
                                  className="absolute z-10"
                                  style={{
                                    top: `${startOffset}px`,
                                    height: `${eventHeight}px`,
                                    left: '2px',
                                    right: '2px'
                                  }}
                                />
                              );
                            })}
                            
                            {/* Hover indicator */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <div className="h-full w-full bg-sky-100 border-t border-b border-sky-300"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* Fitness Dashboard */}
      <FitnessDashboard />

      {/* Date Picker Popup */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Select Date</h3>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Choose a date to view that week
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                  defaultValue={currentDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleDateSelect(new Date(e.target.value));
                    }
                  }}
                />
              </div>
              
              <div className="text-xs text-slate-500">
                The calendar will switch to the week containing the selected date.
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
