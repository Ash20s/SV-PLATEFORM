import { useState } from 'react';
import VideoBackground from './VideoBackground';

interface BackgroundVideo {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}

// Configuration des vidéos disponibles
export const BACKGROUND_VIDEOS: BackgroundVideo[] = [
  {
    id: 'gameplay1',
    name: 'Gameplay 1',
    url: '/videos/bg-gameplay-1.webm',
    thumbnail: '/images/thumb-gameplay-1.jpg'
  },
  {
    id: 'gameplay2',
    name: 'Gameplay 2',
    url: '/videos/bg-gameplay-2.webm',
    thumbnail: '/images/thumb-gameplay-2.jpg'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    url: '/videos/bg-cinematic.webm',
    thumbnail: '/images/thumb-cinematic.jpg'
  },
  // Ajoutez vos vidéos ici
];

interface DynamicVideoBackgroundProps {
  defaultVideoId?: string;
  opacity?: number;
  blur?: number;
  showSelector?: boolean;
}

export default function DynamicVideoBackground({ 
  defaultVideoId = BACKGROUND_VIDEOS[0]?.id,
  opacity = 0.3,
  blur = 0,
  showSelector = false
}: DynamicVideoBackgroundProps) {
  const [selectedVideoId, setSelectedVideoId] = useState(defaultVideoId);

  const selectedVideo = BACKGROUND_VIDEOS.find(v => v.id === selectedVideoId) || BACKGROUND_VIDEOS[0];

  if (!selectedVideo) {
    return null;
  }

  return (
    <>
      <VideoBackground
        videoUrl={selectedVideo.url}
        fallbackImage={selectedVideo.thumbnail}
        opacity={opacity}
        blur={blur}
      />

      {/* Sélecteur de vidéo (optionnel) */}
      {showSelector && BACKGROUND_VIDEOS.length > 1 && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="card-game p-3 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Background</p>
            <div className="flex flex-col gap-2">
              {BACKGROUND_VIDEOS.map(video => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideoId(video.id)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    selectedVideoId === video.id
                      ? 'bg-primary text-background'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {video.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
