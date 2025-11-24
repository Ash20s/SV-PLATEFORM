interface GameBackgroundProps {
  imageUrl?: string; // URL de l'image du jeu Supervise
  opacity?: number;
}

export default function GameBackground({ imageUrl, opacity = 0.15 }: GameBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Game image background (si disponible) */}
      {imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            opacity: opacity,
            filter: 'blur(2px) brightness(0.7)',
          }}
        />
      )}

      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Turquoise orb - top left */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-[0.12] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 198, 0.4) 0%, transparent 70%)',
            top: '-10%',
            left: '-5%',
            animation: 'float-slow 25s ease-in-out infinite',
          }}
        />
        
        {/* Green accent orb - bottom right */}
        <div 
          className="absolute w-[700px] h-[700px] rounded-full opacity-[0.1] blur-[110px]"
          style={{
            background: 'radial-gradient(circle, rgba(25, 249, 169, 0.4) 0%, transparent 70%)',
            bottom: '-10%',
            right: '-5%',
            animation: 'float-slow 20s ease-in-out infinite reverse',
          }}
        />
        
        {/* Center glow */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 198, 0.5) 0%, transparent 70%)',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse-slow 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Tech grid overlay */}
      <div className="absolute inset-0 opacity-[0.025]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 198, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 198, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Diagonal lines effect */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                rgba(0, 255, 198, 0.2) 20px,
                rgba(0, 255, 198, 0.2) 21px
              )
            `,
          }}
        />
      </div>

      {/* Vignette effect for focus on center */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(28, 28, 30, 0.6) 100%)',
        }}
      />

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />

      {/* Subtle scanline effect (optional - for extra tech feel) */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            )
          `,
          animation: 'scan 8s linear infinite',
        }}
      />

      {/* Keyframes */}
      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -50px) scale(1.08);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.92);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.06;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}
