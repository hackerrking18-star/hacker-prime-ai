import React from 'react';

// Ball Image mappings provided by user
export const BALL_IMAGES: Record<number, string> = {
  0: "https://i.postimg.cc/vZsq9nGm/num0-4-10.png",
  1: "https://i.postimg.cc/mDt8RNyD/num0-4-6.png",
  2: "https://i.postimg.cc/ryRQPjmw/num0-4-9.png",
  3: "https://i.postimg.cc/HLP9S81T/num0-4-1.png",
  4: "https://i.postimg.cc/K80Pz3zL/num0-4-2.png",
  5: "https://i.postimg.cc/jj9y6Vyd/num0-4-11.png",
  6: "https://i.postimg.cc/gjyRPnQV/num0-4-12.png",
  7: "https://i.postimg.cc/NfYmkk2T/num0-4-4.png",
  8: "https://i.postimg.cc/vHz9qxWb/num0-4-5.png",
  9: "https://i.postimg.cc/wBtmjWnY/num0-4-7.png"
};

interface FireCircleBallProps {
  number: number | null;
  size?: 'sm' | 'md' | 'lg';
  isAnalysing?: boolean;
  label?: string;
  showFireRing?: boolean;
}

export const FireCircleBall: React.FC<FireCircleBallProps> = ({
  number,
  size = 'lg',
  isAnalysing = false,
  label,
  showFireRing = true
}) => {
  const ballNum = number !== null && number !== undefined && !isNaN(number) ? number : null;
  const imgSrc = ballNum !== null ? BALL_IMAGES[ballNum] || BALL_IMAGES[0] : null;

  const sizeConfigs = {
    sm: {
      wrapper: 'w-12 h-12',
      img: 'w-8 h-8',
      ringPad: 'p-0.5',
      badgeText: 'text-[8px] px-1.5 py-0.5',
      fireThickness: '1.5px',
      glowSpread: '8px'
    },
    md: {
      wrapper: 'w-16 h-16 sm:w-20 sm:h-20',
      img: 'w-11 h-11 sm:w-13 sm:h-13',
      ringPad: 'p-1',
      badgeText: 'text-[10px] px-2 py-0.5',
      fireThickness: '2px',
      glowSpread: '14px'
    },
    lg: {
      wrapper: 'w-24 h-24 sm:w-28 sm:h-28',
      img: 'w-15 h-15 sm:w-18 sm:h-18',
      ringPad: 'p-2',
      badgeText: 'text-[11px] sm:text-xs px-2.5 py-0.5',
      fireThickness: '3px',
      glowSpread: '18px'
    }
  };

  const cfg = sizeConfigs[size];

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none my-1">
      {/* Container for Fire Circle & Ball */}
      <div className={`relative ${cfg.wrapper} flex items-center justify-center`}>
        
        {/* Animated Fire Rings (multi-layered rotating plasma fire) */}
        {showFireRing && (
          <>
            {/* Outer Blazing Glow */}
            <div 
              className="absolute inset-0 rounded-full animate-pulse pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,100,0,0.4) 0%, rgba(255,30,0,0.18) 55%, transparent 75%)',
                filter: `blur(${size === 'lg' ? '8px' : '5px'})`,
              }}
            />

            {/* Spinning Outer Fire Flame Ring */}
            <div 
              className="absolute -inset-1 sm:-inset-1.5 rounded-full pointer-events-none animate-spin"
              style={{
                animationDuration: '4s',
                background: 'conic-gradient(from 0deg, #ff0055, #ff5500, #ffcc00, #ff0055, #ff9900, #ff0055)',
                filter: `drop-shadow(0 0 ${cfg.glowSpread} #ff5500)`,
                opacity: isAnalysing ? 0.4 : 0.85
              }}
            />

            {/* Counter-Spinning Inner Flame Corona */}
            <div 
              className="absolute inset-0.5 rounded-full pointer-events-none"
              style={{
                animation: 'spin 2.5s linear infinite reverse',
                background: 'conic-gradient(from 180deg, rgba(255,200,0,0.9), rgba(255,50,0,0.8), rgba(255,0,100,0.7), rgba(255,220,0,0.95))',
                maskImage: 'radial-gradient(circle, transparent 62%, black 65%)',
                WebkitMaskImage: 'radial-gradient(circle, transparent 62%, black 65%)',
              }}
            />

            {/* Inner Dark Heat Shield */}
            <div className="absolute inset-1.5 sm:inset-2 rounded-full bg-[#050612]/90 border border-orange-500/40 shadow-inner" />
          </>
        )}

        {/* The Ball Image */}
        {ballNum !== null && imgSrc ? (
          <img
            src={imgSrc}
            alt={`Ball ${ballNum}`}
            className={`relative z-10 ${cfg.img} object-contain transition-transform duration-300 drop-shadow-[0_4px_16px_rgba(255,80,0,0.65)] ${
              isAnalysing ? 'animate-spin opacity-40 blur-[1px]' : 'hover:scale-105'
            }`}
            style={{
              animation: isAnalysing ? 'spin 1s linear infinite' : 'ballFloat 3.2s ease-in-out infinite'
            }}
          />
        ) : (
          <div className="relative z-10 flex items-center justify-center text-slate-400 font-mono font-bold text-xl sm:text-2xl animate-pulse">
            {isAnalysing ? '•••' : '?'}
          </div>
        )}

        {/* Floating Embers Sparkle Aura */}
        <div className="absolute -top-1.5 left-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping pointer-events-none opacity-75" />
        <div className="absolute -bottom-1 right-1/4 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping pointer-events-none opacity-60" style={{ animationDelay: '1s' }} />
      </div>

      {/* Styled Fire Number Badge */}
      <div 
        className={`relative -mt-1.5 z-20 font-orbitron font-extrabold uppercase tracking-wider rounded-full border shadow-lg flex items-center gap-1.5 ${cfg.badgeText}`}
        style={{
          background: 'linear-gradient(135deg, #180902, #0c0517)',
          borderColor: '#ff6600',
          color: '#ffcc00',
          boxShadow: '0 0 14px rgba(255,102,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
        <span>{label ? label : (ballNum !== null ? `BALL • ${ballNum}` : 'BALL • --')}</span>
      </div>
    </div>
  );
};
