import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Users } from 'lucide-react';
import { twitchService, TwitchStream } from '@/services/twitchService';
import { useI18n } from '@/i18n/i18n';

export default function TwitchStreamsCarousel() {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['twitch-streams'],
    queryFn: async () => {
      // Mode TEST : utiliser l'endpoint mock
      const response = await fetch('http://localhost:5000/api/mock-twitch/live-streams');
      const data = await response.json();
      return data.streams || [];
      
      // Mode PROD : décommenter la ligne ci-dessous et commenter les 3 lignes au-dessus
      // return twitchService.getLiveStreams();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              LIVE
            </span>
            LIVE CHANNELS
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const visibleStreams = 3;
  const maxIndex = Math.max(0, streams.length - visibleStreams);

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    
    // If moved more than 5px, consider it a drag
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
    // Reset hasDragged after a short delay to allow click prevention
    setTimeout(() => setHasDragged(false), 100);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab';
      }
      setTimeout(() => setHasDragged(false), 100);
    }
  };

  // Arrow button handlers with smooth scroll
  const handlePrev = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.offsetWidth / 3; // Width of one card
    scrollContainerRef.current.scrollBy({
      left: -cardWidth - 16, // Card width + gap
      behavior: 'smooth'
    });
  };

  const handleNext = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.offsetWidth / 3;
    scrollContainerRef.current.scrollBy({
      left: cardWidth + 16,
      behavior: 'smooth'
    });
  };

  const displayedStreams = streams;

  const formatViewerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
            LIVE
          </span>
          LIVE CHANNELS
        </h2>
        {streams.length > visibleStreams && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded bg-card border border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous streams"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded bg-card border border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next streams"
            >
              <ChevronRight size={20} />
            </button>
            <span className="text-sm text-muted-foreground ml-2">
              See all →
            </span>
          </div>
        )}
      </div>

      {streams.length === 0 ? (
        // Message quand aucun stream
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <div className="mb-4">
            <span className="text-6xl">📺</span>
          </div>
          <h3 className="text-xl font-bold mb-2">No Live Streams Right Now</h3>
          <p className="text-muted-foreground mb-4">
            When community members go live on Twitch, their streams will appear here!
          </p>
          <p className="text-sm text-muted-foreground">
            Want to be featured? Link your Twitch account in <a href="/settings" className="text-primary hover:underline">Settings</a>
          </p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab select-none scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {displayedStreams.map((stream) => (
          <a
            key={stream.userId}
            href={`https://twitch.tv/${stream.userName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:scale-[1.02] flex-shrink-0 w-full md:w-[calc(33.333%-0.66rem)]"
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => {
              if (hasDragged) {
                e.preventDefault();
              }
            }}
          >
            {/* Thumbnail with LIVE badge */}
            <div className="relative aspect-video overflow-hidden bg-black">
              <img
                src={stream.thumbnailUrl}
                alt={stream.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                <Eye size={12} />
                {formatViewerCount(stream.viewerCount)}
              </div>
            </div>

            {/* Stream Info */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Platform user avatar */}
                <div className="flex-shrink-0">
                  {stream.platformUser.avatar ? (
                    <img
                      src={stream.platformUser.avatar}
                      alt={stream.platformUser.username}
                      className="w-10 h-10 rounded-full border-2 border-primary"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Stream title */}
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {stream.title}
                  </h3>
                  
                  {/* Streamer name */}
                  <p className="text-xs text-muted-foreground mb-1">
                    {stream.userDisplayName}
                  </p>

                  {/* Platform username */}
                  <p className="text-xs text-primary font-medium">
                    @{stream.platformUser.username}
                  </p>

                  {/* Game name */}
                  {stream.gameName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stream.gameName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
        </div>
      )}

      {streams.length > visibleStreams && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {streams.length} live streams • Drag to scroll or use arrows
          </p>
        </div>
      )}
    </section>
  );
}

