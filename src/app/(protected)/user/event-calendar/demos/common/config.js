const eventMargin = "3px";
const views = [
	{
		id: "week",
		label: "Week",
		value: "Week",
		layout: "week",
		config: {},
	},
	{
		id: "day",
		label: "Day",
		value: "Day",
		layout: "day",
		config: {},
	},
	{
		id: "month",
		label: "Month",
		value: "Month",
		layout: "month",
	},
	{ id: "year", label: "Year", layout: "year", value: "Year" },
	{
		id: "agenda",
		label: "Agenda",
		layout: "agenda",
		value: "Agenda",
	},
	{
		id: "timeline",
		label: "Month Timeline",
		layout: "timeline",
		value: "Timeline",
	},
	{
		id: "timeline2",
		label: "Hour Timeline",
		value: "Hour Timeline",
		layout: "timeline",
		config: {
			step: [1, "hour"],
			header: [
				{ unit: "day", step: 1, format: "d MMM" },
				{ unit: "hour", step: 1, format: "H" },
			],
		},
	},
];
const initConfig = {
	eventsOverlay: true,
	dimPastEvents: true,
	autosave: true,
	eventInfoOnClick: true,
	editorOnDblClick: true,
	createEventOnDblClick: true,
	dragMove: true,
	dragResize: true,
	dragCreate: true,
	start: 0,
	end: 24,
	viewControl: "auto",
	views: views,
};
const formControls = [
	{
		title: "Config: ",
		rows: [],
	},
	{
		label: "Config: ",
		labelPosition: "top",
		css: "checkbox-group",
		cols: [
			{
				type: "checkbox",
				name: "eventsOverlay",
				text: "Overlay",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "dimPastEvents",
				text: "Dim events",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "autosave",
				text: "Autosave",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "eventInfoOnClick",
				text: "Info on click",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "editorOnDblClick",
				text: "Editor on dblClick",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "createEventOnDblClick",
				text: "Create on dblClick",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "dragMove",
				text: "Drag Move",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "dragResize",
				text: "Drag Resize",
				width: "50%",
			},
			{
				type: "checkbox",
				name: "dragCreate",
				text: "Drag Create",
				width: "50%",
			},
		],
	},
	{
		title: "Time Range: ",
		cols: [
			{
				type: "input",
				inputType: "number",
				name: "start",
				width: "45%",
				min: 0,
				max: 24,
			},
			{
				type: "spacer",
			},
			{
				type: "input",
				name: "end",
				inputType: "number",
				width: "45%",
				min: 0,
				max: 24,
			},
		],
	},
	{
		label: "View Control: ",
		labelPosition: "top",
		name: "viewControl",
		type: "select",
		options: [
			{
				value: "auto",
				content: "Auto",
			},
			{
				value: "toggle",
				content: "Toggle",
			},
			{
				value: "dropdown",
				content: "Dropdown",
			},
			{
				value: "none",
				content: "None",
			},
		],
	},
	{
		label: "Views: ",
		labelPosition: "top",
		type: "combo",
		name: "views",
		multiselection: true,
		selectAllButton: true,
		data: views,
	},
];
