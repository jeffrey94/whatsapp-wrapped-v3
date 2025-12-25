import React, { useState, useEffect, useMemo } from 'react';
import { Quote, Trophy, Zap, TrendingUp, MessageCircle, AlertTriangle, Crown, Calendar, Heart, Clock, Ghost, BatteryWarning, Search } from 'lucide-react';

// --- Satirical Content Data ---

const SATIRE_CONTENT = [
  // Awards & Personality
  {
    icon: Ghost,
    title: "Award: The Ghost",
    text: "Seen Feb 14th. Replied: Never.",
    color: "text-purple-400",
    bg: "bg-purple-900/40 border-purple-500/30"
  },
  {
    icon: Crown,
    title: "Award: Chief Yapper",
    text: "14,000 messages. 0 important info.",
    color: "text-yellow-400",
    bg: "bg-yellow-900/40 border-yellow-500/30"
  },
  {
    icon: BatteryWarning,
    title: "Vibe: Low Battery",
    text: "Only replies with 'lol' or 'k'.",
    color: "text-gray-400",
    bg: "bg-gray-800/60 border-gray-500/30"
  },
  {
    icon: AlertTriangle,
    title: "Toxic Trait",
    text: "Starts drama at 11:59 PM.",
    color: "text-red-400",
    bg: "bg-red-900/40 border-red-500/30"
  },
  
  // Stats & Metrics
  {
    icon: Heart,
    title: "Simp Metrics",
    text: "Avg Reply: You (8s) vs Them (3 days).",
    color: "text-pink-400",
    bg: "bg-pink-900/40 border-pink-500/30"
  },
  {
    icon: Clock,
    title: "The Insomniac",
    text: "Most active time: 4:12 AM.",
    color: "text-indigo-400",
    bg: "bg-indigo-900/40 border-indigo-500/30"
  },
  {
    icon: TrendingUp,
    title: "Data Hoarder",
    text: "Sent 4,000 screenshots. 0 context.",
    color: "text-green-400",
    bg: "bg-green-900/40 border-green-500/30"
  },

  // Quotes & Moments
  {
    icon: Quote,
    title: "Top Lie",
    text: "'I'm 5 mins away' (Narrator: He wasn't)",
    color: "text-cyan-400",
    bg: "bg-cyan-900/40 border-cyan-500/30"
  },
  {
    icon: Search,
    title: "Search History",
    text: "Top topic: 'Where are we eating?'",
    color: "text-orange-400",
    bg: "bg-orange-900/40 border-orange-500/30"
  },
  {
    icon: Zap,
    title: "The Incident",
    text: "The argument over $2.50 on Aug 12th.",
    color: "text-rose-400",
    bg: "bg-rose-900/40 border-rose-500/30"
  }
];

// --- Utilities for Randomness ---

// Generate a random integer between min and max
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Pick a random item from an array
const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface WidgetStyle {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform: string;
}

interface FloatingWidgetProps {
  quadrant: 'TL' | 'TR' | 'BL' | 'BR'; // Top-Left, Top-Right, etc.
  delayMs: number;
}

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ quadrant, delayMs }) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState(SATIRE_CONTENT[0]);
  const [style, setStyle] = useState<WidgetStyle>({ transform: 'scale(0)' });

  // Generate a new random position based on the quadrant
  const generateRandomPosition = () => {
    const rotation = randomInt(-12, 12);
    const scale = 0.9 + Math.random() * 0.15; // 0.9 to 1.05
    
    // Define "Safe Zones" percentages to avoid the center upload box
    // Center is roughly 30% to 70% width and 30% to 70% height
    let pos: WidgetStyle = { 
        transform: `rotate(${rotation}deg) scale(${scale})` 
    };

    const hOffset = randomInt(5, 20); // 5% to 20% from edge
    const vOffset = randomInt(10, 35); // 10% to 35% from top/bottom

    if (quadrant === 'TL') {
        pos.top = `${vOffset}%`;
        pos.left = `${hOffset}%`;
    } else if (quadrant === 'TR') {
        pos.top = `${vOffset}%`;
        pos.right = `${hOffset}%`;
    } else if (quadrant === 'BL') {
        pos.bottom = `${vOffset}%`;
        pos.left = `${hOffset}%`;
    } else if (quadrant === 'BR') {
        pos.bottom = `${vOffset}%`;
        pos.right = `${hOffset}%`;
    }

    return pos;
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Initial start delay
    const startTimeout = setTimeout(() => {
      
      const cycle = () => {
        // 1. Prepare new content and position while invisible
        setContent(randomItem(SATIRE_CONTENT));
        setStyle(generateRandomPosition());
        
        // 2. Make visible
        setVisible(true);

        // 3. Wait, then hide
        const displayDuration = randomInt(4000, 6000);
        timeoutId = setTimeout(() => {
          setVisible(false);
          
          // 4. Wait for exit animation, then restart
          timeoutId = setTimeout(cycle, 1000); 
        }, displayDuration);
      };

      cycle();

    }, delayMs);

    return () => {
        clearTimeout(startTimeout);
        clearTimeout(timeoutId);
    };
  }, [quadrant, delayMs]); // Dependencies are static, so this runs once on mount

  const Icon = content.icon;

  return (
    <div 
        className={`absolute transition-all duration-1000 ease-in-out z-0`}
        style={{ 
            ...style,
            opacity: visible ? 1 : 0,
            // Add a slight translation when fading out to make it look like it's drifting away
            transform: visible 
                ? `${style.transform} translateY(0px)` 
                : `${style.transform} translateY(-30px)`
        }}
    >
        <div className={`
            w-[260px] md:w-[320px] p-5 rounded-[2rem] backdrop-blur-xl border shadow-2xl
            flex flex-col gap-3 transition-colors duration-500
            ${content.bg}
        `}>
            <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl bg-black/40 ${content.color} shrink-0 shadow-inner mt-1`}>
                    <Icon size={22} strokeWidth={2.5} />
                </div>
                <h3 className="font-display font-bold text-lg text-white leading-tight drop-shadow-md">
                    {content.title}
                </h3>
            </div>
            <p className="text-sm text-gray-100 font-medium leading-relaxed opacity-90 pl-1">
                {content.text}
            </p>
        </div>
    </div>
  );
};

export const SneakPeekCarousel: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
       {/* Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* 
        We render 4 independent widgets, one for each "quadrant" of the screen.
        They handle their own random positioning within that quadrant.
      */}
      <FloatingWidget quadrant="TL" delayMs={100} />
      <FloatingWidget quadrant="TR" delayMs={2000} />
      <FloatingWidget quadrant="BL" delayMs={1200} />
      <FloatingWidget quadrant="BR" delayMs={3500} />
      
    </div>
  );
};