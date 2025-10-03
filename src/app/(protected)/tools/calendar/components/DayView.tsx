import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { CalendarEvent, DayViewProps, TimeSlot } from '(protected)/tools/calendar/types/calendar.zod';
import CalendarEventComponent from '(protected)/tools/calendar/components/CalendarEvent';
import DailyMetrics from '(protected)/user/widgets/DailyMetrics';

export default function DayView({
  events,
  currentDate,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateChange,
  onNavigate
}: DayViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
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

  // Get events for the current day
  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === currentDate.toDateString();
    });
  }, [events, currentDate]);

  // Get events for a specific time slot
  const getEventsForSlot = (timeSlot: TimeSlot) => {
    const slotStart = new Date(currentDate);
    slotStart.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return dayEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      // Check if event overlaps with this time slot
      return eventStart < slotEnd && eventEnd > slotStart;
    });
  };

  // Get events that start in a specific time slot (for continuous rendering)
  const getEventsStartingInSlot = (timeSlot: TimeSlot) => {
    const slotStart = new Date(currentDate);
    slotStart.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return dayEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventDate = new Date(eventStart);
      eventDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(currentDate);
      checkDate.setHours(0, 0, 0, 0);
      
      // Check if event starts in this exact time slot and is on the same date
      return eventDate.getTime() === checkDate.getTime() && 
             eventStart >= slotStart && eventStart < slotEnd;
    });
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    const timeString = `${timeSlot.hour.toString().padStart(2, '0')}:00`;
    onEventCreate(currentDate, timeString);
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
      // Find the scrollable area (main content area) and scroll it
      const scrollableRef = scrollRefs.current[1]; // Main content area index
      if (scrollableRef) {
        const delta = e.deltaY;
        scrollableRef.scrollTop += delta;
      }
    }
  }, []);

  const handlePreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    onDateChange(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Calculate current time position and check if it's the current day
  const getCurrentTimePosition = () => {
    const now = new Date(); // Use actual current time instead of state
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate position in pixels (32px per 30-minute slot)
    const totalMinutes = currentHour * 60 + currentMinute;
    const position = (totalMinutes / 30) * 32; // 32px per 30-minute slot
    
    // Check if current time is on the displayed day
    const today = new Date();
    const isCurrentDay = currentDate.toDateString() === today.toDateString();
    
    return {
      position,
      isCurrentDay,
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
    scrollRefs.current = new Array(2).fill(null); // Time column + Main content area
  }, []);

  // Update current time every minute to trigger re-renders
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
  }, [scrollRefs, currentDate]);

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'long' }),
      year: date.getFullYear(),
      isToday
    };
  };

  const { dayName, dayNumber, monthName, year, isToday } = formatDateHeader(currentDate);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {dayName}, {monthName} {dayNumber}, {year}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousDay}
                className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-700 hover:text-slate-900"
              >
                ←
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-sm bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-700 hover:text-slate-900"
              >
                →
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`text-sm px-3 py-1 rounded-full ${
              isToday ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {isToday ? 'Today' : 'Selected Day'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 50/50 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calendar - Left Side */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div 
            className="border border-slate-200 rounded-lg bg-white overflow-hidden"
            onWheel={handleWheel}
          >
            <div className="flex">
              {/* Time Column */}
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
                      if (currentTimePos.isCurrentDay) {
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

              {/* Main Content Area */}
              <div className="flex-1 relative">
                <div 
                  className="relative max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
                  ref={(el) => { scrollRefs.current[1] = el; }}
                  onScroll={handleScroll}
                >
                  <div className="relative">
                    {/* Current Time Horizontal Line */}
                    {(() => {
                      const currentTimePos = getCurrentTimePosition();
                      if (currentTimePos.isCurrentDay) {
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
                      const slotEvents = getEventsStartingInSlot(slot);
                      
                      return (
                        <div
                          key={slotIndex}
                          className="h-8 border-b border-slate-100 relative hover:bg-slate-50 cursor-pointer group"
                          onClick={() => handleTimeSlotClick(slot)}
                        >
                          {/* Event Overlay - Only render events that start in this slot */}
                          {slotEvents.map((event, eventIndex) => {
                            const eventStart = new Date(event.startTime);
                            const eventEnd = new Date(event.endTime);
                            const slotStart = new Date(currentDate);
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
            </div>
          </div>
        </div>

        {/* Daily Metrics - Right Side */}
        <div className="lg:max-h-96">
          <DailyMetrics />
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
