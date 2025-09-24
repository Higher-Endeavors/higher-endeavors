'use client';

import { SessionProvider } from 'next-auth/react';
import { CalendarProvider } from '(protected)/tools/calendar/context/CalendarContext';
import Calendar from '(protected)/tools/calendar/components/Calendar';
import DemoBanner from '(protected)/tools/(components)/DemoBanner';

export default function CalendarPage() {
  return (
    <SessionProvider>
      <CalendarProvider>
        <div className="w-full min-h-screen p-4">
          <div className="mx-auto max-w-7xl space-y-4">
            <DemoBanner />
            <Calendar />
          </div>
        </div>
      </CalendarProvider>
    </SessionProvider>
  );
}
