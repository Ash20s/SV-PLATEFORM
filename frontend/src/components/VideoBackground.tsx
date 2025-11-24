import { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  fallbackImage?: string;
  opacity?: number;
  blur?: number;
  overlay?: boolean;
  overlayOpacity?: number;
}

export default function VideoBackground({ 
  videoUrl, 
  fallbackImage,
  opacity = 0.3,
  blur = 0,
  overlay = true,
  overlayOpacity = 0.7
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays (some browsers block autoplay)
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: opacity,
          filter: blur > 0 ? `blur(${blur}px)` : 'none'
        }}
        poster={fallbackImage}
      >
        <source src={videoUrl} type="video/webm" />
        {/* Fallback image if video doesn't load */}
        {fallbackImage && (
          <img 
            src={fallbackImage} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </video>

      {/* Dark overlay for readability */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Animated gradient orbs (pour garder l'esthétique Supervise) */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 198, 0.15) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(25, 249, 169, 0.1) 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
            animation: 'float 15s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%)'
        }}
      />
    </div>
  );
}
