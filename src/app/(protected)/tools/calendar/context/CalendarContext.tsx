'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { CalendarEvent, CalendarContextType, EventType } from '(protected)/tools/calendar/types/calendar.zod';

interface CalendarState {
  events: CalendarEvent[];
  currentDate: Date;
  selectedEvent: CalendarEvent | null;
  viewMode: 'week' | 'month' | 'day';
  isLoading: boolean;
  error: string | null;
}

type CalendarAction =
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_CURRENT_DATE'; payload: Date }
  | { type: 'SET_SELECTED_EVENT'; payload: CalendarEvent | null }
  | { type: 'SET_VIEW_MODE'; payload: 'week' | 'month' | 'day' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: CalendarState = {
  events: [],
  currentDate: new Date(),
  selectedEvent: null,
  viewMode: 'day',
  isLoading: false,
  error: null,
};

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.payload, isLoading: false, error: null };
    
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        selectedEvent: state.selectedEvent?.id === action.payload ? null : state.selectedEvent,
      };
    
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.payload };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    default:
      return state;
  }
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);

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
      notes: 'Focus on form',
      userId: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
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
    {
      id: '3',
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
      id: '4',
      title: 'Hot Tub Recovery',
      type: 'recovery',
      status: 'scheduled',
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 20, 0), // Tomorrow at 8 PM
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 20, 20),
      description: '20 minutes in the hot tub',
      location: 'Home',
      userId: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Initialize with mock data
  React.useEffect(() => {
    dispatch({ type: 'SET_EVENTS', payload: mockEvents });
  }, []);

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // TODO: Replace with actual API call
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_EVENT', payload: newEvent });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create event' });
    }
  };

  const updateEvent = async (event: CalendarEvent) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // TODO: Replace with actual API call
      const updatedEvent = { ...event, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update event' });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // TODO: Replace with actual API call
      dispatch({ type: 'DELETE_EVENT', payload: eventId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete event' });
    }
  };

  const selectEvent = (event: CalendarEvent | null) => {
    dispatch({ type: 'SET_SELECTED_EVENT', payload: event });
  };

  const setCurrentDate = (date: Date) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  };

  const setViewMode = (mode: 'week' | 'month' | 'day') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const refreshEvents = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // TODO: Replace with actual API call
      dispatch({ type: 'SET_EVENTS', payload: mockEvents });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh events' });
    }
  };

  const contextValue: CalendarContextType = {
    ...state,
    addEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    setCurrentDate,
    setViewMode,
    refreshEvents,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
