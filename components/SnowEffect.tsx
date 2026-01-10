import React, { useEffect, useState } from 'react';

export const SnowEffect: React.FC = () => {
  const [flakes, setFlakes] = useState<
    Array<{
      id: number;
      left: number;
      animationDuration: number;
      animationDelay: number;
      size: number;
      opacity: number;
    }>
  >([]);

  useEffect(() => {
    // Generate static flakes on mount
    const count = 50;
    const newFlakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position
      animationDuration: Math.random() * 10 + 10, // 10-20s fall duration
      animationDelay: Math.random() * -20, // Start at random times
      size: Math.random() * 4 + 2, // 2-6px size
      opacity: Math.random() * 0.4 + 0.1, // 0.1-0.5 opacity for subtle effect
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden" aria-hidden="true">
      <style>
        {`
          @keyframes snowfall {
            0% {
              transform: translate3d(0, -10px, 0);
            }
            25% {
              transform: translate3d(15px, 25vh, 0);
            }
            50% {
              transform: translate3d(-15px, 50vh, 0);
            }
            75% {
              transform: translate3d(15px, 75vh, 0);
            }
            100% {
              transform: translate3d(0, 110vh, 0);
            }
          }
        `}
      </style>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.4)]"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.animationDelay}s`,
            top: '-10px',
          }}
        />
      ))}
    </div>
  );
};
