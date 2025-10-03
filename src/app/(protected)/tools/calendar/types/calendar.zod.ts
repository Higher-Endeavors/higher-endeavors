import { z } from 'zod';

// Event Types
export const EventTypeSchema = z.enum(['resistance', 'cme', 'recovery', 'goal', 'milestone', 'event']);
export const EventStatusSchema = z.enum(['scheduled', 'completed', 'cancelled', 'in-progress']);

// Recurring Pattern Schema
export const RecurringPatternSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  interval: z.number().int().positive(), // Every X days/weeks/months
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0=Sunday, 1=Monday, etc.
  endDate: z.date().optional(),
  occurrences: z.number().int().positive().optional(),
});

// Calendar Event Schema
export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: EventTypeSchema,
  status: EventStatusSchema,
  startTime: z.date(),
  endTime: z.date(),
  description: z.string().optional(),
  programId: z.string().optional(), // Links to resistance/CME programs
  programName: z.string().optional(),
  programType: z.enum(['resistance', 'cme', 'recovery']).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: RecurringPatternSchema.optional(),
  color: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Time Slot Schema
export const TimeSlotSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  display: z.string(),
});

// Week View Props Schema - Note: Function props are not validated by Zod
export const WeekViewPropsSchema = z.object({
  events: z.array(CalendarEventSchema),
  currentDate: z.date(),
});

// Calendar Context Type Schema - Note: Function props are not validated by Zod
export const CalendarContextTypeSchema = z.object({
  events: z.array(CalendarEventSchema),
  currentDate: z.date(),
  selectedEvent: CalendarEventSchema.nullable(),
  viewMode: z.enum(['week', 'month', 'day']),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

// Event Form Data Schema
export const EventFormDataSchema = z.object({
  title: z.string().min(1),
  type: z.union([EventTypeSchema, z.literal('')]), // Allow empty string for placeholder
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().optional(),
  programId: z.string().optional(),
  programName: z.string().optional(),
  programType: z.enum(['resistance', 'cme', 'recovery']).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: RecurringPatternSchema.optional(),
  color: z.string().optional(),
});

// Calendar Settings Schema
export const CalendarSettingsSchema = z.object({
  startHour: z.number().int().min(0).max(23), // Default start hour (e.g., 6 for 6 AM)
  endHour: z.number().int().min(0).max(23), // Default end hour (e.g., 22 for 10 PM)
  timeSlotDuration: z.number().int().positive(), // Minutes per time slot (e.g., 30)
  showWeekends: z.boolean(),
  defaultEventDuration: z.number().int().positive(), // Minutes
  workingHours: z.object({
    start: z.number().int().min(0).max(23),
    end: z.number().int().min(0).max(23),
  }),
});

// Infer TypeScript types from Zod schemas
export type EventType = z.infer<typeof EventTypeSchema>;
export type EventStatus = z.infer<typeof EventStatusSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type RecurringPattern = z.infer<typeof RecurringPatternSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type EventFormData = z.infer<typeof EventFormDataSchema>;
export type CalendarSettings = z.infer<typeof CalendarSettingsSchema>;

// Manual TypeScript interfaces for props with functions
export interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventCreate: (date: Date, time: string) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  garminAttribution: string;
}

export interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventCreate: (date: Date, time: string) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventCreate: (date: Date, time: string) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  garminAttribution: string;
}

export interface CalendarContextType {
  events: CalendarEvent[];
  currentDate: Date;
  selectedEvent: CalendarEvent | null;
  viewMode: 'week' | 'month' | 'day';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  selectEvent: (event: CalendarEvent | null) => void;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: 'week' | 'month' | 'day') => void;
  refreshEvents: () => Promise<void>;
}
