import { useState } from 'react';
import type { CalendarEvent, EventFormData, EventType } from '(protected)/tools/calendar/types/calendar.zod';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  defaultDate?: Date;
  defaultTime?: string;
}

export default function EventModal({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  defaultDate,
  defaultTime
}: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>(() => {
    if (event) {
      return {
        title: event.title,
        type: event.type,
        startTime: event.startTime.toTimeString().slice(0, 5),
        endTime: event.endTime.toTimeString().slice(0, 5),
        description: event.description || '',
        programId: event.programId || '',
        programName: event.programName || '',
        programType: event.programType || 'resistance',
        location: event.location || '',
        notes: event.notes || '',
        isRecurring: event.isRecurring || false,
        color: event.color || ''
      };
    } else if (defaultDate && defaultTime) {
      const startTime = new Date(defaultDate);
      const [hours, minutes] = defaultTime.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 60); // Default 1 hour duration
      
      return {
        title: '',
        type: '', // Empty for new events - user must select
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        description: '',
        programId: '',
        programName: '',
        programType: 'resistance',
        location: '',
        notes: '',
        isRecurring: false,
        color: ''
      };
    }
    
    return {
      title: '',
      type: '', // Empty by default - user must select
      startTime: '',
      endTime: '',
      description: '',
      programId: '',
      programName: '',
      programType: 'resistance',
      location: '',
      notes: '',
      isRecurring: false,
      color: ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const startDateTime = new Date(defaultDate || event?.startTime || new Date());
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const updatedEvent: CalendarEvent = {
      id: event?.id || `event-${Date.now()}`,
      title: formData.title,
      type: formData.type as EventType,
      status: event?.status || 'scheduled',
      startTime: startDateTime,
      endTime: endDateTime,
      description: formData.description,
      programId: formData.programId,
      programName: formData.programName,
      programType: formData.programType,
      location: formData.location,
      notes: formData.notes,
      isRecurring: formData.isRecurring,
      color: formData.color,
      userId: event?.userId || 'current-user', // TODO: Get from context
      createdAt: event?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(updatedEvent);
    onClose();
  };

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {event ? 'Edit Event' : 'Create Event'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 ${
                errors.title ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Event Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as EventType)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 ${
                errors.type ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="" disabled>Choose Event Type</option>
              <optgroup label="Lifestyle">
                <option value="goal">Goal</option>
                <option value="milestone">Milestone</option>
                <option value="event">Event</option>
              </optgroup>
              <optgroup label="Fitness">
                <option value="resistance">Resistance Training</option>
                <option value="cme">CardioMetabolic Endurance</option>
                <option value="recovery">Recovery & Rest</option>
              </optgroup>
            </select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type}</p>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 ${
                  errors.startTime ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.startTime && (
                <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 ${
                  errors.endTime ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.endTime && (
                <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>


          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700"
              rows={3}
              placeholder="Enter event description"
            />
          </div>


          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700"
              rows={2}
              placeholder="Additional notes"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            {event && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
            >
              {event ? 'Update' : 'Create'} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
