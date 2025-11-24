export default function SimpleAnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Turquoise orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[100px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 198, 0.3) 0%, transparent 70%)',
            top: '10%',
            left: '15%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        
        {/* Green accent orb */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[90px]"
          style={{
            background: 'radial-gradient(circle, rgba(25, 249, 169, 0.3) 0%, transparent 70%)',
            bottom: '15%',
            right: '10%',
            animation: 'float 15s ease-in-out infinite reverse',
          }}
        />
        
        {/* Center accent */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 198, 0.4) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 10s ease-in-out infinite',
          }}
        />
      </div>

      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 198, 0.1) 2px, rgba(0, 255, 198, 0.1) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 255, 198, 0.1) 2px, rgba(0, 255, 198, 0.1) 4px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFC6" stopOpacity="0" />
            <stop offset="50%" stopColor="#00FFC6" stopOpacity="1" />
            <stop offset="100%" stopColor="#19F9A9" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <line x1="0" y1="20%" x2="100%" y2="25%" stroke="url(#line-gradient)" strokeWidth="1">
          <animate attributeName="y1" values="20%;25%;20%" dur="10s" repeatCount="indefinite" />
          <animate attributeName="y2" values="25%;20%;25%" dur="10s" repeatCount="indefinite" />
        </line>
        
        <line x1="0" y1="60%" x2="100%" y2="55%" stroke="url(#line-gradient)" strokeWidth="1">
          <animate attributeName="y1" values="60%;55%;60%" dur="15s" repeatCount="indefinite" />
          <animate attributeName="y2" values="55%;60%;55%" dur="15s" repeatCount="indefinite" />
        </line>
      </svg>

      {/* Dark overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />

      {/* Add keyframes for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(20px, 10px) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
