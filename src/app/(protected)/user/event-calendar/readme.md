# DHTMLX Event Calendar

## Getting started

To get information on how to configure Event Calendar, explore our documentation: https://docs.dhtmlx.com/eventcalendar/how_to_start/.

You can import DHTMLX Event Calendar into your projects using yarn or npm package manager. To get the trial version of Event Calendar, run the following commands:

```
// yarn
yarn config set @dhx:registry https://npm.dhtmlx.com
yarn add @dhx/trial-eventcalendar
```

Or

```
// npm
npm config set @dhx:registry https://npm.dhtmlx.com
npm i @dhx/trial-eventcalendar
```

Start calendar:

```
import { EventCalendar } from "@dhx/trial-eventcalendar";
import "@dhx/trial-eventcalendar/dist/event-calendar.css";

//...

const calendar = new EventCalendar(container, {
	// configuration properties
	mode: "month",
	date: new Date("2023-03-12T00:00:00"),
	events: [
		{
			id: "1",
			type: "work",
			start_date: new Date("2023-03-23T08:00:00"),
			end_date: new Date("2023-03-23T10:25:00"),
			text: "French Open",
			details: "Philippe-Chatrier Court\n Paris, FRA"
		},
		{
			id: "2",
			type: "work",
			start_date: new Date("2023-03-08T00:00:00"),
			end_date: new Date("2023-03-13T00:00:00"),
			text: "French Open",
			details: "Philippe-Chatrier Court\n Paris, FRA",
		},
		{
			id: "3",
			type: "work",
			start_date: new Date("2023-02-21T00:00:00"),
			end_date: new Date("2023-03-16T00:00:00"),
			text: "Wimbledon",
			details: "Wimbledon\n June 21, 2009 - July 5, 2009",
			color: {
				background: "#BD69BC",
				border: "#AD44AB",
				textColor: "#FFFFFF"
			},
		}
	]
});

```

==> [Check the full guide](https://docs.dhtmlx.com/eventcalendar/how_to_start/)

## License


@license

DHTMLX Event Calendar v.2.3.0 

This software is covered by DHTMLX Evaluation License and purposed only for evaluation.
Contact sales@dhtmlx.com to get a proprietary license.
Usage without proper license is prohibited.

(c) XB Software.

## Useful links

-   [DHTMLX Event Calendar product page](https://dhtmlx.com/docs/products/dhtmlxEventCalendar/)
-   [Official documentation](https://docs.dhtmlx.com/eventcalendar/)
-   [Online samples](https://snippet.dhtmlx.com/qw45r367?tag=event_calendar&mode=wide)
-   [Support forum](https://forum.dhtmlx.com/c/event-calendar/52)
