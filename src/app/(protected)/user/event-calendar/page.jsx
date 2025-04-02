'use client';

import dynamic from 'next/dynamic';

const EventCalendarComponent = dynamic(
    () => import('./EventCalendar'),
    { ssr: false }
);

export default function EventCalendarPage() {
    return (
        <div style={{ padding: '20px' }}>
            <EventCalendarComponent />
        </div>
    );
}