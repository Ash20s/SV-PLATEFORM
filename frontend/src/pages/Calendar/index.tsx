import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trophy, Swords } from 'lucide-react';
import { useI18n } from '@/i18n/i18n';
import EventDetailsModal from '@/components/EventDetailsModal';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'tournament' | 'scrim';
  subtitle?: string;
  data?: any;
}

export default function Calendar() {
  const { t } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'tournament' | 'scrim'; data: any } | null>(null);

  // Récupérer tous les tournois
  const { data: tournamentsData } = useQuery({
    queryKey: ['tournaments', 'all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/tournaments');
      return res.json();
    }
  });

  // Récupérer tous les scrims
  const { data: scrimsData } = useQuery({
    queryKey: ['scrims', 'all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/scrims');
      return res.json();
    }
  });

  // Transformer les données en événements calendrier
  const allEvents: CalendarEvent[] = [
    ...(tournamentsData?.tournaments || []).map((tournament: any) => ({
      id: tournament._id,
      title: tournament.name,
      date: tournament.startDate,
      type: 'tournament' as const,
      subtitle: tournament.tier || tournament.status,
      data: tournament
    })),
    ...(scrimsData?.scrims || []).map((scrim: any) => ({
      id: scrim._id,
      title: scrim.organizer?.username ? `Scrim - ${scrim.organizer.username}` : 'Scrim',
      date: scrim.date,
      type: 'scrim' as const,
      subtitle: scrim.tier || scrim.status,
      data: scrim
    }))
  ];

  // Fonctions de navigation de mois
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false, events: [] });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Trouver les événements pour ce jour
      const dayEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === dateStr;
      });

      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        events: dayEvents
      });
    }

    return days;
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent({ type: event.type, data: event.data });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">Event Calendar</h1>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="text-2xl font-bold">{monthName}</h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border rounded-lg ${
                day.isCurrentMonth
                  ? day.isToday
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-background'
                  : 'border-border/50 bg-background/50 opacity-50'
              } transition-colors`}
            >
              {day.day && (
                <>
                  <div className={`text-sm font-semibold mb-2 ${
                    day.isToday ? 'text-primary' : 'text-foreground'
                  }`}>
                    {day.day}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {day.events.map((event: CalendarEvent) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`w-full text-left text-xs p-1 rounded truncate ${
                          event.type === 'tournament'
                            ? 'bg-[#FFB800]/20 hover:bg-[#FFB800]/30 text-[#FFB800] border-l-2 border-[#FFB800]'
                            : 'bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border-l-2 border-[#00D4FF]'
                        } transition-colors flex items-center gap-1`}
                      >
                        {event.type === 'tournament' ? (
                          <Trophy size={10} />
                        ) : (
                          <Swords size={10} />
                        )}
                        <span className="truncate">{event.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FFB800]/20 border-l-2 border-[#FFB800] rounded" />
            <span className="text-sm text-muted-foreground">Tournament</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#00D4FF]/20 border-l-2 border-[#00D4FF] rounded" />
            <span className="text-sm text-muted-foreground">Scrim</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {allEvents
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 10)
            .map(event => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="w-full text-left p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {event.type === 'tournament' ? (
                      <Trophy className="text-[#FFB800] mt-1" size={20} />
                    ) : (
                      <Swords className="text-[#00D4FF] mt-1" size={20} />
                    )}
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {event.subtitle && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          event.type === 'tournament'
                            ? 'bg-[#FFB800]/10 text-[#FFB800]'
                            : 'bg-[#00D4FF]/10 text-[#00D4FF]'
                        }`}>
                          {event.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          
          {allEvents.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Modal de détails d'événement */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

