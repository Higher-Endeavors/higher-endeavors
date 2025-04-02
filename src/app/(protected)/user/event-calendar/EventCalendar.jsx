'use client';

import { useEffect, useRef } from "react";
import { EventCalendar } from "@dhx/trial-eventcalendar";
import "@dhx/trial-eventcalendar/dist/event-calendar.css";

export default function EventCalendarComponent(props) {
    let container = useRef(); 

    let events = props.events;
    let date = props.date;

    useEffect(() => {
        const calendar = new EventCalendar(container.current, {});

        calendar.parse({ events, date });

        return () => {
            calendar.destructor();
        }
    }, []);

    return <div ref={container} className="widget"></div>;
}