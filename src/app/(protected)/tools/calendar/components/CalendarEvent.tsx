import { useState } from 'react';
import type { CalendarEvent } from '../types/calendar.zod';

interface CalendarEventProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  isSelected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function CalendarEvent({ 
  event, 
  onClick, 
  onEdit, 
  onDelete, 
  isSelected = false,
  className = '',
  style
}: CalendarEventProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getEventTypeStyles = (type: string) => {
    const baseStyles = 'rounded-md border-l-4 px-2 py-1 text-xs font-medium cursor-pointer transition-all hover:shadow-sm';
    
    switch (type) {
      case 'resistance':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800 hover:bg-blue-100`;
      case 'cme':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800 hover:bg-green-100`;
      case 'recovery':
        return `${baseStyles} bg-purple-50 border-purple-400 text-purple-800 hover:bg-purple-100`;
      case 'goal':
        return `${baseStyles} bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100`;
      case 'milestone':
        return `${baseStyles} bg-orange-50 border-orange-400 text-orange-800 hover:bg-orange-100`;
      case 'event':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800 hover:bg-red-100`;
      default:
        return `${baseStyles} bg-slate-50 border-slate-400 text-slate-800 hover:bg-slate-100`;
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⏳';
      case 'cancelled':
        return '✗';
      default:
        return '';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(event);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(event);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event.id);
  };

  return (
    <div
      className={`${getEventTypeStyles(event.type)} ${isSelected ? 'ring-2 ring-sky-400' : ''} ${className}`}
      style={style}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${event.title} - ${formatTime(event.startTime)} to ${formatTime(event.endTime)}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="truncate">{event.title}</span>
            {getStatusIndicator(event.status) && (
              <span className="text-xs opacity-75">{getStatusIndicator(event.status)}</span>
            )}
          </div>
          {event.programName && (
            <div className="text-xs opacity-75 truncate">
              {event.programName}
            </div>
          )}
        </div>
        
        {isHovered && (
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-white/50 rounded text-xs"
              title="Edit event"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-white/50 rounded text-xs"
              title="Delete event"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
