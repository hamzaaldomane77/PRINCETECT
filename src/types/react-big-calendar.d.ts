declare module 'react-big-calendar' {
  import { ComponentType, CSSProperties } from 'react';

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

  export interface Event {
    start: Date;
    end: Date;
    title?: string;
    [key: string]: any;
  }

  export interface CalendarProps<TEvent extends Event = Event> {
    localizer: any;
    events: TEvent[];
    startAccessor?: string | ((event: TEvent) => Date);
    endAccessor?: string | ((event: TEvent) => Date);
    style?: CSSProperties;
    onSelectEvent?: (event: TEvent) => void;
    eventPropGetter?: (event: TEvent) => { style?: CSSProperties; className?: string };
    messages?: Record<string, any>;
    view?: View;
    onView?: (view: View) => void;
    date?: Date;
    onNavigate?: (date: Date) => void;
    rtl?: boolean;
    culture?: string;
    [key: string]: any;
  }

  export const Calendar: ComponentType<CalendarProps<any>>;

  export interface LocalizerOptions {
    format: any;
    parse: any;
    startOfWeek: () => Date;
    getDay: (date: Date) => number;
    locales: Record<string, any>;
  }

  export function dateFnsLocalizer(options: LocalizerOptions): any;
}

