import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

interface SnowfallProps {
  count?: number;
}

export const Snowfall: React.FC<SnowfallProps> = ({ count = 50 }) => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across screen
      size: Math.random() * 4 + 2, // 2-6px
      duration: Math.random() * 5 + 8, // 8-13s fall time
      delay: Math.random() * 10, // staggered start
      opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8 opacity
      drift: Math.random() * 40 - 20, // -20 to 20px horizontal drift
    }));
    setSnowflakes(flakes);
  }, [count]);

  return (
    <div className="snowfall-container" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            '--drift': `${flake.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        .snowfall-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 5;
          overflow: hidden;
        }
        
        .snowflake {
          position: absolute;
          top: -10px;
          background: radial-gradient(circle at 30% 30%, #ffffff, rgba(255, 255, 255, 0.8));
          border-radius: 50%;
          box-shadow: 
            0 0 6px rgba(255, 255, 255, 0.5),
            0 0 12px rgba(255, 255, 255, 0.3);
          animation: snowfall linear infinite;
        }
        
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: var(--opacity, 0.6);
          }
          50% {
            transform: translateY(50vh) translateX(var(--drift, 20px)) rotate(180deg);
          }
          95% {
            opacity: var(--opacity, 0.6);
          }
          100% {
            transform: translateY(calc(100vh + 10px)) translateX(calc(var(--drift, 20px) * -1)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
