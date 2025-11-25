import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Megaphone, Search, Users, Swords } from 'lucide-react';
import { useState } from 'react';
import EventCalendar, { type CalendarEvent } from '@/components/EventCalendar';
import EventDetailsModal from '@/components/EventDetailsModal';
import TwitchStreamsCarousel from '@/components/TwitchStreamsCarousel';
import { useI18n } from '@/i18n/i18n';

export default function Home() {
  const { t } = useI18n();
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'tournament' | 'scrim'; data: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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


  // Get featured tournament (first open tournament)
  const featuredTournament = upcomingTournaments?.tournaments?.[0];

  return (
    <div className="space-y-8">
      {/* Hero Section with Search - CENTERED */}
      <section className="text-center py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-primary text-sm font-bold mb-2 uppercase tracking-widest">HUB CENTRALE</p>
          <h1 className="text-5xl font-bold">
            PROJECT <span className="text-primary">SUPERVIVE</span>
          </h1>
        </div>
        
        {/* Search Bar - CENTERED */}
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search a player, a team or a hunter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-card/50 border border-primary/30 rounded focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground text-sm text-center"
            />
          </div>
        </div>
      </section>

      {/* MAIN HUB Section */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Featured Tournament - LEFT (2 cols) */}
          <div className="lg:col-span-2 lg:row-span-2 bg-[hsla(0,0%,0%,0.54)] border border-border/10 clip-corner overflow-hidden hover:border-border/20 transition-all">
            {featuredTournament ? (
              <Link 
                to={`/tournaments/${featuredTournament._id}`}
                className="block group"
              >
                {/* Image en haut */}
                <div className="relative overflow-hidden">
                  {featuredTournament.bannerImage ? (
                    <img 
                      src={featuredTournament.bannerImage} 
                      alt={featuredTournament.name}
                      className="w-full h-[250px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[250px] bg-gradient-to-br from-primary/30 to-primary/10" />
                  )}
                </div>
                
                {/* Contenu */}
                <div className="p-6">
                  <p className="text-[#FFBE0B] text-xs font-bold mb-2 uppercase tracking-widest">UPCOMING EVENT</p>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {featuredTournament.name}
                  </h3>
                  <p className="text-[#FFBE0B] text-sm font-semibold mb-6">
                    {featuredTournament.prizePool && `$${featuredTournament.prizePool} •`} {featuredTournament.region || 'Global'} • {featuredTournament.format || 'Squads'}
                  </p>
                  
                  <button className="bg-primary text-white px-8 py-3 rounded font-bold hover:bg-primary/90 transition-colors w-full text-sm uppercase tracking-wider">
                    REGISTER NOW
                  </button>
                </div>
              </Link>
            ) : (
              <div className="relative p-8 h-full flex items-center justify-center min-h-[300px]">
                <p className="text-muted-foreground">No featured tournament available</p>
              </div>
            )}
          </div>

          {/* Calendar Preview - TOP RIGHT */}
          <div className="bg-[hsla(0,0%,0%,0.54)] border border-border/10 clip-corner p-5 hover:border-border/20 transition-all h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-primary" size={20} />
              <h3 className="text-lg font-bold uppercase">Calendar</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              {calendarEvents.slice(0, 2).map((event) => (
                <div 
                  key={event.id}
                  className="bg-card/20 border border-border/10 rounded p-2.5 hover:border-border/20 transition-all"
                >
                  <p className="font-semibold text-xs mb-1 truncate">{event.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Today, {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      event.subtitle === 'TIER 1' || event.subtitle === 'Tier 1'
                        ? 'bg-cyan-500/80 text-black' 
                        : event.type === 'tournament'
                        ? 'bg-cyan-500/60 text-black'
                        : 'bg-cyan-500/40 text-black'
                    }`}>
                      {(event.subtitle === 'TIER 1' || event.subtitle === 'Tier 1') ? 'T1' : (event.type === 'tournament' ? 'T1' : 'OPEN')}
                    </span>
                  </div>
                </div>
              ))}
              
              {calendarEvents.length === 0 && (
                <p className="text-muted-foreground text-xs py-8 text-center">
                  No upcoming events
                </p>
              )}
            </div>

            <Link 
              to="/calendar" 
              className="block w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded text-center transition-colors text-xs uppercase tracking-wider"
            >
              View Calendar
            </Link>
          </div>

          {/* Scrims Preview - BOTTOM RIGHT */}
          <div className="bg-[hsla(0,0%,0%,0.54)] border border-border/10 clip-corner p-5 hover:border-border/20 transition-all h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Swords className="text-primary" size={20} />
              <h3 className="text-lg font-bold uppercase">Scrims</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              {upcomingScrims?.scrims?.slice(0, 2).map((scrim: any) => (
                <Link 
                  key={scrim._id}
                  to="/scrims"
                  className="block bg-card/20 border border-border/10 rounded p-2.5 hover:border-border/20 transition-all"
                >
                  <p className="font-semibold text-xs mb-1 truncate">
                    Scrim - {scrim.organizer?.username || 'Unknown'}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(scrim.date).toLocaleDateString()}
                    </p>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/60 text-black">
                      {scrim.tier || 'OPEN'}
                    </span>
                  </div>
                </Link>
              ))}
              
              {(!upcomingScrims?.scrims || upcomingScrims.scrims.length === 0) && (
                <p className="text-muted-foreground text-xs py-8 text-center">
                  No upcoming scrims
                </p>
              )}
            </div>

            <Link 
              to="/scrims" 
              className="block w-full bg-primary/80 hover:bg-primary text-white font-bold py-2.5 rounded text-center transition-colors text-xs uppercase tracking-wider"
            >
              View Scrims
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded">
            <Megaphone className="text-primary" size={24} />
          </div>
          <h2 className="text-2xl font-bold italic">Latest Annoucements</h2>
        </div>
        <div className="space-y-4">
          {announcements?.announcements?.map((announcement: any) => (
            <div key={announcement._id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-start gap-4">
                <div className="bg-[#00D4FF] text-black px-3 py-1 rounded text-xs font-bold shrink-0 mt-0.5">
                  {new Date(announcement.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {(!announcements?.announcements || announcements.announcements.length === 0) && (
            <p className="text-muted-foreground text-center py-4">{t('home.announcements.none')}</p>
          )}
        </div>
      </section>

      {/* Upcoming Tournaments - Two Columns */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold">Upcomming Tournaments</h2>
          </div>
          <Link 
            to="/tournaments" 
            className="bg-[#00FFE5] text-black px-4 py-2 rounded font-bold text-sm hover:opacity-90 transition-all"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {upcomingTournaments?.tournaments?.slice(0, 6).map((tournament: any) => (
            <Link 
              key={tournament._id}
              to={`/tournaments/${tournament._id}`}
              className="bg-[hsla(0,0%,0%,0.54)] border border-primary/20 clip-corner-sm p-4 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors truncate">
                    {tournament.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="font-semibold">
                    {tournament.registeredTeams?.length || 0}/{tournament.maxTeams || 12}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  tournament.status === 'open' 
                    ? 'bg-green-500 text-white' 
                    : tournament.status === 'pending'
                    ? 'bg-[#FFB800] text-black'
                    : 'bg-gray-500 text-white'
                }`}>
                  {tournament.status?.toUpperCase()}
                </span>
                {tournament.prizePool && (
                  <span className="bg-[#FFBE0B] text-black px-2.5 py-1 rounded font-bold text-xs">
                    ${tournament.prizePool}
                  </span>
                )}
              </div>
            </Link>
          ))}
          
          {(!upcomingTournaments?.tournaments || upcomingTournaments.tournaments.length === 0) && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No upcoming tournaments
            </div>
          )}
        </div>
      </section>

      {/* Twitch Streams Carousel */}
      <TwitchStreamsCarousel />

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
