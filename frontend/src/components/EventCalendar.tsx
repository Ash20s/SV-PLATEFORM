
import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  format,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Trophy, Swords } from 'lucide-react';

type CalendarEventType = 'tournament' | 'scrim';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  subtitle?: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  title?: string;
  onEventSelect?: (event: CalendarEvent) => void;
}

const typeConfig: Record<CalendarEventType, { icon: JSX.Element; color: string; bg: string }> = {
  tournament: {
    icon: <Trophy size={14} />,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10'
  },
  scrim: {
    icon: <Swords size={14} />,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  }
};

export default function EventCalendar({ events, title, onEventSelect }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const eventDate = parseISO(event.date);
      if (isNaN(eventDate.getTime())) return;
      const key = format(eventDate, 'yyyy-MM-dd');
      const list = groups.get(key) ?? [];
      list.push(event);
      groups.set(key, list);
    });
    return groups;
  }, [events]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const todayKey = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {format(currentMonth, 'LLLL yyyy')}
          </p>
          <h2 className="text-xl font-semibold">{title ?? 'Events Calendar'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border/30">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="bg-background py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {calendarDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(key) ?? [];
          const outsideMonth = !isSameMonth(day, currentMonth);
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              className={`relative min-h-[110px] bg-background px-2 py-2 text-sm border-t border-border/40
              ${outsideMonth ? 'text-muted-foreground/60 bg-muted/20' : ''}
              ${isToday ? 'ring-2 ring-primary/60' : ''}`}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </span>

              <div className="mt-2 space-y-1">
                {dayEvents.map((event) => {
                  const config = typeConfig[event.type];
                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={() => onEventSelect?.(event)}
                      className="group flex w-full items-start gap-2 rounded-lg border border-border/60 px-2 py-1 text-left text-xs transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${config.bg} ${config.color}`}
                      >
                        {config.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{event.title}</p>
                        {event.subtitle && <p className="truncate text-muted-foreground">{event.subtitle}</p>}
                      </div>
                    </button>
                  );
                })}
                {dayEvents.length === 0 && (
                  <div className="py-5 text-center text-[11px] text-muted-foreground/20">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-4 border-t border-border bg-muted/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Légende</p>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-md bg-yellow-500/20 border border-yellow-500/40">
              <Trophy size={12} className="text-yellow-500" />
            </div>
            <span className="font-medium">Tournois</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-md bg-blue-500/20 border border-blue-500/40">
              <Swords size={12} className="text-blue-500" />
            </div>
            <span className="font-medium">Scrims</span>
          </div>
        </div>
      </div>
    </div>
  );
}


