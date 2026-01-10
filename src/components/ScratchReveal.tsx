import React, { useRef, useEffect, useState } from 'react';

interface ScratchRevealProps {
  children: React.ReactNode;
  width?: number; // Optional, defaults to 100% of container
  height?: number; // Optional, defaults to 100% of container
  onComplete?: () => void;
  threshold?: number; // Percentage revealed to auto-complete (0-100), default 50
  brushSize?: number;
  coverColor?: string;
}

export const ScratchReveal: React.FC<ScratchRevealProps> = ({
  children,
  width,
  height,
  onComplete,
  threshold = 50,
  brushSize = 40,
  coverColor = 'rgba(200, 180, 220, 0.9)', // Foggy purple-white
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const updateSize = () => {
      if (containerRef.current) {
        canvas.width = width || containerRef.current.offsetWidth;
        canvas.height = height || containerRef.current.offsetHeight;

        // Fill properly
        ctx.fillStyle = coverColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add "Fog" texture/noise (optional, simple noise)
        // For now just solid color, maybe add text "Rub to reveal"
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = 'rgba(88, 28, 135, 0.8)'; // Dark purple text
        ctx.textAlign = 'center';

        // Draw centered text
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.fillText('✨ Rub to Reveal ✨', 0, 0);
        ctx.restore();
      }
    };

    updateSize();
    // In a real app we might want ResizeObserver, but for now simple mount is okay
  }, [width, height, coverColor]);

  const checkRevealProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get raw pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Check alpha channel (every 4th byte)
    // We can sample every 10th pixel for performance
    const step = 10;
    const totalPixels = pixels.length / 4;

    for (let i = 0; i < totalPixels; i += step) {
      if (pixels[i * 4 + 3] < 128) {
        transparentPixels++;
      }
    }

    const percentRevealed = (transparentPixels / (totalPixels / step)) * 100;

    if (percentRevealed > threshold) {
      setIsRevealed(true);
      // Clear entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onComplete?.();
    }
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Add "drip" or irregularity? For now circle is fine for "finger rubbing"
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent event from bubbling up to parent swipe handlers
    e.stopPropagation();
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDrawing(false);
    checkRevealProgress();
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Always stop propagation to prevent swipe navigation while scratching
    e.stopPropagation();

    if (!isDrawing && e.type !== 'touchmove') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    draw(x, y);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* The content to be revealed */}
      <div className="w-full h-full">{children}</div>

      {/* The scratch canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 cursor-crosshair touch-none transition-opacity duration-700 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleMouseMove}
        style={{ borderRadius: 'inherit' }} // Inherit border radius from parent
      />
    </div>
  );
};
