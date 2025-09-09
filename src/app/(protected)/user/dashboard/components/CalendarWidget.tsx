'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarProvider } from '../../../tools/calendar/context/CalendarContext';
import type { CalendarEvent } from '../../../tools/calendar/types/calendar.zod';
import CalendarEventComponent from '../../../tools/calendar/components/CalendarEvent';
import EventModal from '../../../tools/calendar/components/EventModal';

interface CalendarWidgetProps {
  className?: string;
}

function CalendarWidgetContent({ className = '' }: CalendarWidgetProps) {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Mock events for dashboard - fewer and more focused
  // Mock data for development - using current day for visibility
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Upper Body Strength',
      type: 'resistance',
      status: 'scheduled',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), // Today at 4 PM
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
      description: 'Focus on chest, shoulders, and triceps',
      programId: 'program-123',
      programName: 'Upper Body Strength Program',
      programType: 'resistance',
      location: 'Home Gym',
      userId: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Zone 2 Run',
      type: 'cme',
      status: 'scheduled',
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0), // Tomorrow at 4 PM
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 45),
      description: '45 minutes easy pace',
      programId: 'program-456',
      programName: 'Base Building Phase',
      programType: 'cme',
      location: 'Local Park',
      userId: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Sauna Session',
      type: 'recovery',
      status: 'scheduled',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0), // Today at 8 PM
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 20),
      description: '20 minutes in the sauna',
      location: 'Home',
      userId: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventCreate = (date: Date) => {
    // Create a new event for the clicked date
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: 'New Event',
      type: 'resistance',
      status: 'scheduled',
      startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0),
      endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0),
      userId: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEditingEvent(newEvent);
    setIsEventModalOpen(true);
  };

  const handleEventSave = (event: CalendarEvent) => {
    // TODO: Implement actual save functionality
    console.log('Saving event:', event);
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    // TODO: Implement actual delete functionality
    console.log('Deleting event:', eventId);
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
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

  // Get current date for the calendar title
  const calendarTitle = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {calendarTitle}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('prev')}
              className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-700 hover:text-slate-900"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 text-xs bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handleNavigate('next')}
              className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-700 hover:text-slate-900"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="text-sm text-slate-600">
          {currentDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Compact Week View with Column Separators */}
      <div className="flex">
        {/* Day Columns */}
        <div className="flex-1 flex">
          {weekDates.map((date, dayIndex) => {
            const { dayName, dayNumber, isToday } = formatDateHeader(date);
            const dayEvents = getEventsForDate(date);
            
            return (
              <div key={dayIndex} className="flex-1 border-r border-slate-200 last:border-r-0">
                {/* Day Header */}
                <div className={`h-12 border-b border-slate-200 flex flex-col items-center justify-center ${
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

                {/* Events Column */}
                <div className="p-2 min-h-[120px]">
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity border-l-4"
                        style={{
                          backgroundColor: event.type === 'resistance' ? '#dbeafe' : 
                                          event.type === 'cme' ? '#dcfce7' : 
                                          event.type === 'recovery' ? '#f3e8ff' : '#fef3c7',
                          color: event.type === 'resistance' ? '#1e40af' : 
                                 event.type === 'cme' ? '#166534' : 
                                 event.type === 'recovery' ? '#7c3aed' : '#92400e',
                          borderLeftColor: event.type === 'resistance' ? '#3b82f6' : 
                                         event.type === 'cme' ? '#22c55e' : 
                                         event.type === 'recovery' ? '#a855f7' : '#f59e0b'
                        }}
                      >
                        <div className="truncate font-medium">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {event.startTime.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-500 text-center py-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        
      {/* Quick Actions */}
      <div className="flex justify-between items-center p-4 pt-2 border-t border-slate-200">
        <button
          onClick={() => window.location.href = '/tools/calendar'}
          className="text-sm text-sky-600 hover:text-sky-800 font-medium"
        >
          View Full Calendar →
        </button>
        <div className="text-xs text-slate-500">
          Week of {weekDates[0].toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })} - {weekDates[6].toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
      />
    </div>
  );
}

export default function CalendarWidget({ className = '' }: CalendarWidgetProps) {
  return (
    <CalendarProvider>
      <CalendarWidgetContent className={className} />
    </CalendarProvider>
  );
}
