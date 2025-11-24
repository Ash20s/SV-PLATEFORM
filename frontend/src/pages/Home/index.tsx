import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Swords, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import EventCalendar, { type CalendarEvent } from '@/components/EventCalendar';
import EventDetailsModal from '@/components/EventDetailsModal';
import { useI18n } from '@/i18n/i18n';

export default function Home() {
  const { t } = useI18n();
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'tournament' | 'scrim'; data: any } | null>(null);

  const { data: upcomingTournaments } = useQuery({
    queryKey: ['tournaments', 'upcoming'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/tournaments?limit=3');
      return res.json();
    }
  });

  const { data: upcomingScrims } = useQuery({
    queryKey: ['scrims', 'upcoming'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/scrims?upcoming=true&limit=5');
      return res.json();
    }
  });

  // Récupérer tous les événements pour le calendrier
  const { data: allTournaments } = useQuery({
    queryKey: ['tournaments', 'all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/tournaments');
      return res.json();
    }
  });

  const { data: allScrims } = useQuery({
    queryKey: ['scrims', 'all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/scrims');
      return res.json();
    }
  });

  // Transformer les données en événements calendrier
  const calendarEvents: CalendarEvent[] = [
    ...(allTournaments?.tournaments || []).map((tournament: any) => ({
      id: tournament._id,
      title: tournament.name,
      date: tournament.startDate,
      type: 'tournament' as const,
      subtitle: tournament.tier || tournament.status
    })),
    ...(allScrims?.scrims || []).map((scrim: any) => ({
      id: scrim._id,
      title: scrim.organizer?.username ? `Scrim - ${scrim.organizer.username}` : 'Scrim',
      date: scrim.date,
      type: 'scrim' as const,
      subtitle: scrim.tier || scrim.status
    }))
  ];

  const handleEventSelect = (event: CalendarEvent) => {
    if (event.type === 'tournament') {
      const tournament = allTournaments?.tournaments?.find((t: any) => t._id === event.id);
      if (tournament) {
        setSelectedEvent({ type: 'tournament', data: tournament });
      }
    } else {
      const scrim = allScrims?.scrims?.find((s: any) => s._id === event.id);
      if (scrim) {
        setSelectedEvent({ type: 'scrim', data: scrim });
      }
    }
  };

  const { data: announcements } = useQuery({
    queryKey: ['announcements', 'recent'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/announcements?limit=3');
      return res.json();
    }
  });


  return (
    <div className="space-y-8">
      <section className="text-center py-20 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
        <h1 className="text-5xl font-bold mb-4">{t('home.title')}</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {t('home.subtitle')}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            to="/teams" 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {t('home.explore.teams')}
          </Link>
          <Link 
            to="/tournaments" 
            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            {t('home.view.tournaments')}
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-primary" size={24} />
            <h3 className="font-semibold">{t('home.stats.teams')}</h3>
          </div>
          <p className="text-3xl font-bold">—</p>
          <p className="text-sm text-muted-foreground">{t('home.stats.active.teams')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-yellow-500" size={24} />
            <h3 className="font-semibold">{t('home.stats.tournaments')}</h3>
          </div>
          <p className="text-3xl font-bold">{upcomingTournaments?.tournaments?.length || 0}</p>
          <p className="text-sm text-muted-foreground">{t('home.stats.upcoming')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="text-blue-500" size={24} />
            <h3 className="font-semibold">{t('home.stats.scrims')}</h3>
          </div>
          <p className="text-3xl font-bold">{upcomingScrims?.scrims?.length || 0}</p>
          <p className="text-sm text-muted-foreground">{t('home.stats.scheduled')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-500" size={24} />
            <h3 className="font-semibold">{t('home.stats.activity')}</h3>
          </div>
          <p className="text-3xl font-bold">High</p>
          <p className="text-sm text-muted-foreground">{t('home.stats.community.engagement')}</p>
        </div>
      </div>

      <section className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-2xl font-bold mb-4">{t('home.announcements')}</h2>
        <div className="space-y-4">
          {announcements?.announcements?.map((announcement: any) => (
            <div key={announcement._id} className="border-b border-border pb-4 last:border-0">
              <h3 className="font-semibold mb-2">{announcement.title}</h3>
              <p className="text-muted-foreground text-sm">{announcement.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {(!announcements?.announcements || announcements.announcements.length === 0) && (
            <p className="text-muted-foreground">{t('home.announcements.none')}</p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={24} className="text-yellow-500" />
              <h2 className="text-2xl font-bold">{t('home.upcoming.tournaments')}</h2>
            </div>
            <Link to="/tournaments" className="text-primary hover:underline">
              {t('home.view.all')} →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingTournaments?.tournaments?.map((tournament: any) => (
              <div 
                key={tournament._id} 
                className="bg-card p-4 rounded-lg border border-border hover:border-yellow-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{tournament.name}</h3>
                    {tournament.tier && (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        tournament.tier === 'Tier 1' 
                          ? 'bg-purple-500/10 text-purple-500' 
                          : tournament.tier === 'Tier 2'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {tournament.tier}
                      </span>
                    )}
                  </div>
                  <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-semibold">
                    {tournament.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {tournament.registeredTeams?.length || 0} {t('home.teams')}
                  </span>
                </div>
                {tournament.prizePool && (
                  <p className="text-primary font-semibold mt-2">
                    Prize: {tournament.prizePool}€
                  </p>
                )}
              </div>
            ))}
            {(!upcomingTournaments?.tournaments || upcomingTournaments.tournaments.length === 0) && (
              <p className="text-muted-foreground text-center py-8">{t('home.upcoming.tournaments.none')}</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Swords size={24} className="text-blue-500" />
              <h2 className="text-2xl font-bold">{t('home.upcoming.scrims')}</h2>
            </div>
            <Link to="/scrims" className="text-primary hover:underline">
              {t('home.view.all')} →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingScrims?.scrims?.map((scrim: any) => (
              <div 
                key={scrim._id} 
                className="bg-card p-4 rounded-lg border border-border hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {t('common.organized.by')} {scrim.organizer?.username || t('common.unknown')}
                    </h3>
                    {scrim.tier && (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        scrim.tier === 'Tier 1' 
                          ? 'bg-purple-500/10 text-purple-500' 
                          : scrim.tier === 'Tier 2'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {scrim.tier}
                      </span>
                    )}
                  </div>
                  <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-semibold">
                    {scrim.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(scrim.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {scrim.participants?.length || 0}/{scrim.maxTeams} {t('home.teams')}
                  </span>
                </div>
              </div>
            ))}
            {(!upcomingScrims?.scrims || upcomingScrims.scrims.length === 0) && (
              <p className="text-muted-foreground text-center py-8">{t('home.upcoming.scrims.none') || 'No upcoming scrims'}</p>
            )}
          </div>
        </section>
      </div>

      {/* Calendrier des événements */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="text-primary" size={32} />
            {t('home.calendar.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('home.calendar.desc')}
          </p>
        </div>
        <EventCalendar
          events={calendarEvents}
          title={t('home.calendar.title')}
          onEventSelect={handleEventSelect}
        />
      </section>

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
