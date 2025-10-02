'use client';

import { useState } from 'react';
import { useCalendar } from '(protected)/tools/calendar/context/CalendarContext';
import WeekView from '(protected)/tools/calendar/components/WeekView';
import MonthView from '(protected)/tools/calendar/components/MonthView';
import DayView from '(protected)/tools/calendar/components/DayView';
import EventModal from '(protected)/tools/calendar/components/EventModal';
import type { CalendarEvent } from '(protected)/tools/calendar/types/calendar.zod';

interface CalendarProps {
  className?: string;
  showHeader?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function Calendar({ 
  className = '', 
  showHeader = true,
  onEventClick 
}: CalendarProps) {
  const {
    events,
    currentDate,
    selectedEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    setCurrentDate,
    setViewMode,
    viewMode
  } = useCalendar();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventModalDefaultDate, setEventModalDefaultDate] = useState<Date | undefined>();
  const [eventModalDefaultTime, setEventModalDefaultTime] = useState<string | undefined>();

  const handleEventClick = (event: CalendarEvent) => {
    selectEvent(event);
    onEventClick?.(event);
  };

  const handleEventCreate = (date: Date, time: string) => {
    setEventModalDefaultDate(date);
    setEventModalDefaultTime(time);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventUpdate = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventDelete = (eventId: string) => {
    deleteEvent(eventId);
  };

  const handleEventSave = (event: CalendarEvent) => {
    if (editingEvent) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
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

  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setEventModalDefaultDate(undefined);
    setEventModalDefaultTime(undefined);
  };

  return (
    <div className={`calendar-container ${className}`}>
      {showHeader && (
        <div className="mb-4">
          <div className="flex justify-end">
            <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'day'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <WeekView
          events={events}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onDateChange={handleDateChange}
          onNavigate={handleNavigate}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          events={events}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onDateChange={handleDateChange}
          onNavigate={handleNavigate}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          events={events}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onDateChange={handleDateChange}
          onNavigate={handleNavigate}
        />
      )}

      <EventModal
        key={editingEvent?.id || 'new'}
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        defaultDate={eventModalDefaultDate}
        defaultTime={eventModalDefaultTime}
      />
    </div>
  );
}
