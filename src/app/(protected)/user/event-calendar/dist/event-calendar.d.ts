declare namespace eventCalendar{
import * as dateFns from 'date-fns';
export { dateFns };

type TMethodsConfig = IDataMethodsConfig;
type TDispatch$1 = <A extends keyof TMethodsConfig>(action: A, data: TMethodsConfig[A]) => void;
interface IDataConfig {
    events: IEventData[];
    selected: IEventData;
    mode: string;
    date: Date;
    sidebar: {
        show: boolean;
    } | false;
    editorShape?: TEditorShape[];
    calendars?: ICalendar[];
    config: ISchedulerConfig$1;
    colors?: IColorSchema[];
}
interface IBaseViewConfig {
    cellCss?: (date: Date) => string;
    template?: (event: IEventData) => string;
    dateTitle?: (currentDate: Date, bounds: [Date, Date]) => string;
    eventHeight?: number;
    getBounds?: (date: Date, config: IBaseViewConfig) => [Date, Date];
    getNext?: (date: Date, config: IBaseViewConfig) => Date;
    getPrev?: (date: Date, config: IBaseViewConfig) => Date;
}
interface IReadonlyConfig {
    dragResize?: boolean;
    readonly?: boolean;
    dragMove?: boolean;
}
type IViewConfig = IWeekConfig | IMonthConfig | ITimelineConfig | IBaseViewConfig;
interface IViewItem {
    id: TID$1;
    label: string;
    layout: "day" | "week" | "month" | "year" | "agenda" | "timeline";
    config?: IViewConfig;
}
interface ISchedulerConfig$1 extends IReadonlyConfig {
    tableHeaderHeight?: number;
    autoSave?: boolean;
    dimPastEvents?: boolean;
    timeStep?: number;
    dragCreate?: boolean;
    eventInfoOnClick?: boolean;
    eventsOverlay?: boolean;
    eventHeight?: number;
    highlightReadonly?: boolean;
    timeRange?: [number, number];
    editorOnDblClick?: boolean;
    createEventOnDblClick?: boolean;
    eventVerticalSpace?: number;
    defaultEventDuration?: number;
    viewControl?: "auto" | "toggle" | "dropdown" | "none";
    views?: IViewItem[];
    dateClick?: boolean | TID$1;
    weekStartsOn?: number;
    editorValidation?: (event: IEventData) => string | false;
    dateTitle?: (date: Date, bounds: [Date, Date]) => string;
    defaultEditorValues?: (event: Partial<IEventData>) => Partial<IEventData>;
    calendarValidation?: (calendar: ICalendar) => string | false;
}
interface IData {
    events: IEventData[];
    selected: IEventData;
    selectedId: TID$1;
    popupInfo: boolean;
    edit: "add" | "update" | boolean;
    mode: string;
    date: Date;
    bounds: [Date, Date];
    viewSize: {
        width: number;
        height: number;
    };
    viewData: any[];
    viewModel: any;
    editorShape?: TEditorShape[];
    calendars?: ICalendar[];
    config: ISchedulerConfig$1;
    datepicker: TDatepickerConfig;
    sidebar: {
        show: boolean;
    } | false;
    colors: IColorSchema[];
    dateFnsLocale?: any;
}
interface IView {
    /**
     * Gets date bounds for the current view
     *
     * @param date - date that must be visible in the view
     * @returns [start, end] - minimal and maximal visible dates
     */
    getBounds(date: Date, config?: any): [Date, Date];
    /**
     * Get next visible interval
     * @param date - date from the previous visible interval
     * @returns date - next visible interval date
     */
    getNext(date: Date, config?: any): Date;
    /**
     * Get previous visible interval
     * @param date - date from the next visible interval
     * @returns date - prev visible interval date
     */
    getPrev(date: Date, config?: any): Date;
    /**
     * Get title for header
     * @param start - date from the start visible interval
     * @param end - date from the end visible interval
     * @returns string - formatted date
     */
    getTitle(start?: Date, end?: Date): string;
    /**
     * Add event to view
     * @param event - IEventData
     */
    addEvent(event: IEventData): void;
    getEventById(id: TID$1): IEventData;
    /**
     * Return an object that describes the structure of the view for given params and data
     *
     * @param data - data to be displayed in the view
     * @param bounds - minimal and maximal visible dates
     * @param config - scheduler configuration object
     * @param displayedEvents - events to be rendered in the view
     * @returns object - object that describes the structure of the view
     */
    getViewModel: (activeDate: Date, bounds: [Date, Date], config: any, displayedEvents: any[], calendars: ICalendar[]) => any;
}
interface IApi {
    exec: any;
    on: any;
    getState: any;
    getReactiveState: any;
    setNext: (ev: IEventBus) => void;
    getStores: () => {
        state: DataStore;
    };
    intercept: any;
}
interface IEventBus {
    exec(name: string, ev: any): void;
    setNext(next: TDispatch$1): void;
}
type IOption = {
    id: TID$1;
    label?: string;
    [key: string]: any;
};
type TCommonShape = {
    key: string | any;
    label?: string;
    id?: TID$1;
};
type ICommonConfig = {
    disabled?: boolean;
    placeholder?: string;
    [key: string]: any;
};
type TTextFieldShape = TCommonShape & {
    type: "text" | "textarea";
    config?: ICommonConfig & {
        readonly?: boolean;
        focus?: boolean;
        type?: string;
        inputStyle?: string;
    };
};
type TCheckboxShape = TCommonShape & {
    type: "checkbox";
    text?: string;
};
type TRecurringEvent = TCommonShape & {
    type: "recurring";
};
type TRadioShape = TCommonShape & {
    type: "radio";
    options: {
        id: TID$1;
        label?: string;
    }[];
};
type TComboFieldShape = TCommonShape & {
    type: "combo" | "select" | "multiselect";
    options?: IOption[];
    template?: (opt: IOption) => string;
    config?: ICommonConfig;
};
type TColorFieldShape = TCommonShape & {
    type: "color";
    colors?: string[];
    config?: ICommonConfig & {
        clear?: boolean;
    };
};
type TColorSchemaFieldShape = TCommonShape & {
    type: "colorSchema";
    colors?: IColorSchema[];
    config?: ICommonConfig & {
        clear?: boolean;
    };
};
type TDateFieldShape = TCommonShape & {
    type: "date";
    time?: boolean;
    config?: ICommonConfig;
};
type TFilesFieldShape = TCommonShape & {
    type: "files";
    uploadURL?: string;
    config?: IUploaderConfig;
};
interface IUploaderConfig {
    accept?: string;
    disabled?: boolean;
    multiple?: boolean;
    folder?: boolean;
}
type TEditorShape = TTextFieldShape | TComboFieldShape | TColorFieldShape | TDateFieldShape | TCheckboxShape | TRadioShape | TColorSchemaFieldShape | TRecurringEvent | TFilesFieldShape;
type TID$1 = string | number;
interface IColorSchema {
    background?: string;
    border?: string;
    textColor?: string;
    colorpicker?: string;
}
interface IEventData extends IReadonlyConfig {
    start_date: Date;
    end_date: Date;
    id?: TID$1;
    type?: TID$1;
    text?: string;
    details?: string;
    allDay?: boolean;
    color?: IColorSchema;
    recurring?: boolean;
    STDATE?: Date;
    DTEND?: Date;
    RRULE?: string | IRRULEObject;
    EXDATE?: Date[];
    section?: TID$1;
    recurringEventId?: TID$1;
    originalStartTime?: Date;
    status?: string;
    [key: string]: any;
}
interface ICalendar {
    id: TID$1;
    label: string;
    active: boolean;
    color?: IColorSchema;
    readonly?: boolean;
}
type TDatepickerConfig = {
    current: Date;
    markers: (d: Date) => string;
};
interface IAttachment {
    id: TID$1;
    url?: string;
    previewURL?: string;
    coverURL?: string;
    file?: any;
    name?: string;
    status?: any;
    isCover?: boolean;
}
interface IRRULEObject {
    FREQ?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    INTERVAL?: number;
    BYDAY?: string[];
    BYMONTH?: number;
    BYMONTHDAY?: number;
    BYSETPOS?: number;
    UNTIL?: Date;
    COUNT?: number;
    EXDATE?: Date[];
    weekDays?: IWeekDays;
    byset?: string;
    [key: string]: any;
}
type IWeekDays = {
    id: string;
    name: string;
    index: number;
    fullName: string;
}[];
interface IWeekConfig extends IBaseViewConfig {
    timeRange?: [number, number];
    timeStep?: number;
    eventsOverlay?: false;
    eventVerticalSpace?: number;
    eventHorizontalSpace?: string;
    columnPadding?: string;
    weekStartsOn?: number;
    /** @deprecated eventHorizontalSpace field instead */
    eventMargin?: string;
}
interface IMonthConfig extends IBaseViewConfig {
    weekStartsOn?: number;
    maxEventsPerCell?: number;
    eventVerticalSpace?: number;
}
interface ITimelineHeader {
    unit: string;
    format: string;
    step: number;
}
interface ITimelineConfig extends IBaseViewConfig {
    colsCount?: number;
    colsWidth?: number;
    minEventWidth?: number;
    eventVerticalSpace?: number;
    minSectionHeight?: number;
    sectionWidth?: number;
    getBounds?: (date: Date, config: ITimelineConfig) => [Date, Date];
    getNext?: (date: Date, config: ITimelineConfig) => Date;
    getPrev?: (date: Date, config: ITimelineConfig) => Date;
    step?: [number, "day" | "week" | "month" | "year" | "hour" | "minute"];
    header?: ITimelineHeader[];
    sections?: ISection[];
    key?: string;
    unassignedCol?: boolean;
}
interface ISection {
    id: TID$1;
    label?: string;
    [key: string]: any;
}

 type TDataBlock = {
    in: string[];
    out: string[];
    exec: any;
    length?: number;
};
 type TDataConfig = TDataBlock[];
 type TID = number | string;
 type TDispatch<T> = <A extends keyof T>(action: A, data: T[A]) => void;
interface DataHash {
    [key: string]: any;
}
interface IWritable<T> {
    subscribe: (fn: (v: T) => any) => any;
    update: (fn: (v: T) => any) => any;
    set: (val: T) => any;
}
 type TWritableCreator = (val: any) => IWritable<typeof val>;

 type TState<Type> = {
    [Property in keyof Type]: IWritable<Type[Property]>;
};
 class Store<T extends DataHash> {
    private _state;
    private _values;
    private _writable;
    constructor(writable: TWritableCreator);
    setState(data: Partial<T>): void;
    getState(): T;
    getReactive(): TState<T>;
    private _wrapWritable;
}

 class EventBus<T> {
    private _handlers;
    protected _nextHandler: TDispatch<T>;
    constructor();
    on(name: string, handler: any): void;
    exec(name: string, ev: any): void;
    setNext(next: TDispatch<T>): void;
}

 class DataStore extends Store<IData> {
    in: EventBus<TMethodsConfig>;
    private _router;
    private _registeredViews;
    private _uniqueId;
    constructor(w: TWritableCreator);
    init(state: Partial<IDataConfig>): void;
    setState(state: Partial<IData>, ctx?: TDataConfig): void;
    normalizeState(initData: Partial<IData>): {
        editorShape: any[];
        events: IEventData[];
        calendars: ICalendar[];
        selectedId: TID$1;
        edit: boolean | "add" | "update";
        selected: IEventData;
        popupInfo: boolean;
    };
    _checkId(id: TID): void;
}
interface IDataMethodsConfig {
    ["set-date"]: {
        value: Date;
    };
    ["set-mode"]: {
        value: string;
    };
    ["set-bound"]: {
        step: number;
    };
    ["add-event"]: {
        id?: TID;
        event: IEventData;
    };
    ["delete-event"]: {
        id: TID;
    };
    ["update-event"]: {
        event: IEventData;
        id: TID;
        mode?: "all" | "future";
    };
    ["update-calendar"]: {
        calendar: ICalendar;
        id: TID;
    };
    ["add-calendar"]: {
        id?: TID;
        calendar: ICalendar;
    };
    ["delete-calendar"]: {
        id: TID;
    };
    ["toggle-sidebar"]: {
        show: boolean;
    } | null;
    ["select-event"]: {
        id: TID;
        popup?: boolean;
    };
    ["edit-event"]: {
        id?: TID;
        add?: IEventData | Record<string, never>;
    } | null;
    ["close-event-info"]: null;
}

 const defaultColors: IColorSchema[];
 const defaultCalendars: ICalendar[];
 const defaultEditorShape: TEditorShape[];

 const en: any;

 const de: any;

 const ru: any;

 function uid(): string;

 class Events {
    private _api;
    constructor(api: IApi);
    on<K extends keyof TMethodsConfig>(event: K, callback: (config: TMethodsConfig[K]) => any): void;
    exec<K extends keyof TMethodsConfig>(event: K, data: TMethodsConfig[K]): void;
}

/** Callback to inform of a value updates. */
 type Subscriber<T> = (value: T) => void;
/** Unsubscribes from value updates. */
 type Unsubscriber = () => void;
/** Callback to update a value. */
 type Updater<T> = (value: T) => T;
/** Cleanup logic callback. */
 type Invalidator<T> = (value?: T) => void;
/** Readable interface for subscribing. */
interface Readable<T> {
    /**
     * Subscribe on value changes.
     * @param run subscription callback
     * @param invalidate cleanup callback
     */
    subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
}
/** Writable interface for both updating and subscribing. */
interface Writable<T> extends Readable<T> {
    /**
     * Set value and inform subscribers.
     * @param value to set
     */
    set(this: void, value: T): void;
    /**
     * Update value using callback and inform subscribers.
     * @param updater callback
     */
    update(this: void, updater: Updater<T>): void;
}

type IEventTemplate = (event: IEventData, calendar: ICalendar) => string;
type ITheme = "willow" | "material" | "willowDark";
interface ISchedulerConfig extends Partial<IDataConfig> {
    locale?: typeof en;
    theme?: ITheme;
    templates?: {
        monthEvent?: IEventTemplate;
        weekEvent?: IEventTemplate;
        multievent?: IEventTemplate;
        popup?: IEventTemplate;
        header?: (date: Date, dateFormat: string) => string;
    };
}
 class EventCalendar {
    api: IApi;
    events: Events;
    config: ISchedulerConfig;
    container: HTMLElement;
    form: Writable<TEditorShape[]>;
    private _widget;
    constructor(container: HTMLElement | string, config?: ISchedulerConfig);
    destructor(): void;
    setConfig(config: Partial<ISchedulerConfig>): void;
    parse(data: IEventData[] | {
        events: IEventData[];
        calendars: ICalendar[];
    }): void;
    serialize(): {
        events: IEventData[];
        calendars: ICalendar[];
    };
    addEvent(config: TMethodsConfig["add-event"]): void;
    deleteEvent(config: TMethodsConfig["delete-event"]): void;
    updateEvent(config: TMethodsConfig["update-event"]): void;
    updateCalendar(config: TMethodsConfig["update-calendar"]): void;
    addCalendar(config: TMethodsConfig["add-calendar"]): void;
    deleteCalendar(config: TMethodsConfig["delete-calendar"]): void;
    getCalendar(config: {
        id: TID$1;
    }): any;
    toggleSidebar(config?: TMethodsConfig["toggle-sidebar"]): void;
    setMode(config: TMethodsConfig["set-mode"]): void;
    setDate(config: TMethodsConfig["set-date"]): void;
    showEventInfo(config: {
        id: TID$1;
    }): void;
    hideEventInfo(): void;
    createEvent(config?: {
        event: IEventData;
    }): void;
    openEditor(config?: {
        id: TID$1;
    }): void;
    closeEditor(): void;
    getState(): any;
    getEvent(config: {
        id: TID$1;
    }): any;
    setLocale(locale: typeof en): void;
    setTheme(theme: ITheme): void;
    private _init;
    private _reset;
    private _storeConfig;
    private _configToProps;
}

 class RestDataProvider extends EventBus<TMethodsConfig> {
    private _url;
    private _customHeaders;
    private _queue;
    constructor(url?: string);
    getIDResolver(): any;
    getEvents(): Promise<IEventData[]>;
    getCalendars(): Promise<IEventData[]>;
    setHeaders(headers: any): void;
    protected getHandlers(handlers: Partial<Record<keyof TMethodsConfig, any>>): Partial<Record<keyof TMethodsConfig, any>>;
    protected send<T>(url: string, method: string, data?: any, customHeaders?: any): Promise<T>;
    protected parseEvents(data: any[]): any[];
}

 class RemoteEvents {
    protected _remote: any;
    protected _ready: Promise<any>;
    constructor(url: string, token: string);
    protected ready(): Promise<any>;
    protected on(name: string | any, handler?: any): void;
}

 function remoteUpdates(api: any, resolver: any): any;

export { EventCalendar, IApi, IAttachment, IBaseViewConfig, ICalendar, IColorSchema, IData, IDataConfig, IEventBus, IEventData, IMonthConfig, IOption, ISchedulerConfig$1 as ISchedulerConfig, ISection, ITimelineConfig, IUploaderConfig, IView, IViewConfig, IViewItem, IWeekConfig, RemoteEvents, RestDataProvider, TCheckboxShape, TColorSchemaFieldShape, TComboFieldShape, TCommonShape, TDateFieldShape, TDatepickerConfig, TEditorShape, TFilesFieldShape, TID$1 as TID, TRadioShape, TRecurringEvent, TTextFieldShape, de, defaultCalendars, defaultColors, defaultEditorShape, en, remoteUpdates, ru, uid };
}