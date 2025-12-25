import React, { useEffect, useState, useMemo } from 'react';
import { WrappedData, ParticipantStats } from '../types';
import { BarChart, Bar, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie, Tooltip, XAxis } from 'recharts';
import { Clock, Calendar, Trophy, Heart, Quote, Sparkles, Flame, Users, Zap, Brain, MessageSquare, ArrowRight, Play, Star, Moon, Sun, Sunrise, Sunset, Coffee, Share2, Activity, Anchor } from 'lucide-react';

interface SlideProps {
  data: WrappedData;
}

interface GradientBgProps {
  children?: React.ReactNode;
  variant?: 'default' | 'stats' | 'warm' | 'cool' | 'dark' | 'neon';
}

const GradientBg: React.FC<GradientBgProps> = ({ children, variant = 'default' }) => {
  const gradients = {
    default: "from-purple-900 via-indigo-900 to-blue-900",
    stats: "from-pink-600 to-rose-600",
    warm: "from-orange-500 to-yellow-500",
    cool: "from-cyan-500 to-blue-600",
    dark: "from-gray-900 to-slate-800",
    neon: "from-violet-600 to-fuchsia-600"
  };
  
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradients[variant]} p-4 md:p-8 lg:p-12 flex flex-col relative overflow-hidden text-white`}>
      {/* Animated Noise/Grain texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
      
      {/* Ambient background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="relative z-10 h-full flex flex-col w-full max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

// Helper for counting up numbers
const AnimatedCounter = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        setCount(Math.min(end, Math.floor((progress / duration) * end)));
        animationFrame = requestAnimationFrame(update);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export const CoverSlide: React.FC<SlideProps> = ({ data }) => {
  const participants = data.analytics.participants;
  // Get top 5 names for the "Starring" list
  const castList = participants
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5)
    .map(p => p.name)
    .join(" • ");

  return (
    <GradientBg variant="default">
      <div className="flex-1 flex flex-col h-full text-center relative z-20">
        
        {/* Top Label */}
        <div className="flex-none pt-2 md:pt-4 uppercase tracking-[0.4em] text-[10px] md:text-sm font-bold opacity-60 animate-in fade-in slide-in-from-top-4 duration-1000">
          The 2025 Season Finale
        </div>

        {/* Centerpiece - Flex-1 to take available space and center vertically */}
        <div className="flex-1 flex flex-col justify-center items-center min-h-0 py-4">
           
           <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-5xl">
               {/* Decorative Element */}
               <div className="w-12 md:w-16 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent flex-none"></div>
               
               {/* Huge Group Name - Adjusted sizes to prevent overflow */}
               <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-display tracking-tight leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl animate-in zoom-in-90 duration-1000 line-clamp-2 px-2">
                 {data.analytics.groupName || "The Group Chat"}
               </h1>

               {/* Tagline */}
               <div className="text-lg md:text-2xl font-serif italic text-blue-200 opacity-90 max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 line-clamp-3">
                 "{data.aiContent?.groupPersonality?.vibe || "Another year of questionable life choices."}"
               </div>

               {/* Stats Row */}
               <div className="flex items-center gap-4 md:gap-8 mt-2 md:mt-4 flex-none animate-in fade-in duration-1000 delay-500">
                  <div className="flex flex-col items-center px-4 py-2 md:px-6 md:py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                     <span className="text-2xl md:text-4xl font-bold font-display text-white">
                       <AnimatedCounter end={data.analytics.totalMessages} />
                     </span>
                     <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Messages</span>
                  </div>
                  <div className="w-px h-8 md:h-12 bg-white/10"></div>
                  <div className="flex flex-col items-center px-4 py-2 md:px-6 md:py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                     <span className="text-2xl md:text-4xl font-bold font-display text-white">
                       <AnimatedCounter end={data.analytics.activeDays} />
                     </span>
                     <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Days Active</span>
                  </div>
               </div>
           </div>
        </div>

        {/* "Starring" Footer - flex-none to ensure it sits at the bottom */}
        <div className="flex-none w-full max-w-3xl mx-auto pb-4 md:pb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-white/40 mb-2 font-bold">Starring</div>
          <div className="text-sm md:text-lg font-medium leading-relaxed text-white/80 line-clamp-2 px-4">
            {castList} {participants.length > 5 && <span className="opacity-50"> & {participants.length - 5} others</span>}
          </div>
        </div>

        {/* Play Button Visual Cue */}
        <div className="absolute bottom-4 right-0 p-4 opacity-50 hidden md:block animate-pulse">
           <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
             <span>Start</span>
             <ArrowRight size={16} />
           </div>
        </div>
      </div>
    </GradientBg>
  );
};

export const OverviewSlide: React.FC<SlideProps> = ({ data }) => {
  const { analytics } = data;
  const { participants, messagesByHour } = analytics;
  
  // Prefer AI word cloud, fallback to raw stats
  const vocabularyList = data.aiContent?.wordCloud || analytics.topWords.map(w => w.text);

  // Identify Chronotypes
  const nightOwl = participants.find(p => p.chronotype?.label === 'Night Owl');
  const earlyBird = participants.find(p => p.chronotype?.label === 'Early Bird');
  const yapper = participants[0]; 

  // Fallback if no night owl (unlikely with new logic, but safe fallback is the 2nd most active or anyone active late)
  const displayNightOwl = nightOwl || participants[Math.min(1, participants.length-1)];
  const displayEarlyBird = earlyBird || participants[Math.min(2, participants.length-1)];

  return (
    <GradientBg variant="cool">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4 md:mb-8 text-center md:text-left flex-none">
            <h2 className="text-3xl md:text-5xl font-bold font-display">Vibe Check</h2>
            <p className="opacity-70 text-base md:text-lg">The personalities & the vocabulary</p>
        </div>
        
        {/* Top: Personalities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8 flex-none">
            {/* Night Owl Card */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4 hover:bg-indigo-900/40 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl md:text-2xl shrink-0">
                    🦉
                </div>
                <div className="min-w-0 overflow-hidden">
                    <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-60 font-bold">The Night Owl</div>
                    <div className="text-lg md:text-xl font-bold truncate">{displayNightOwl?.name || "The Void"}</div>
                    <div className="text-[10px] md:text-xs opacity-50 truncate">Active 11PM - 5AM</div>
                </div>
            </div>

            {/* Early Bird Card */}
            <div className="bg-orange-950/40 border border-orange-500/30 p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4 hover:bg-orange-900/40 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-xl md:text-2xl shrink-0">
                    🌅
                </div>
                <div className="min-w-0 overflow-hidden">
                    <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-60 font-bold">The Early Bird</div>
                    <div className="text-lg md:text-xl font-bold truncate">{displayEarlyBird?.name || "The Sun"}</div>
                    <div className="text-[10px] md:text-xs opacity-50 truncate">Active 5AM - 10AM</div>
                </div>
            </div>

            {/* Most Active / Yapaholic */}
            <div className="bg-pink-950/40 border border-pink-500/30 p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4 hover:bg-pink-900/40 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-xl md:text-2xl shrink-0">
                    🗣️
                </div>
                <div className="min-w-0 overflow-hidden">
                    <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-60 font-bold">Chief Yapper</div>
                    <div className="text-lg md:text-xl font-bold truncate">{yapper?.name || "Unknown"}</div>
                    <div className="text-[10px] md:text-xs opacity-50 truncate">{yapper?.messageCount.toLocaleString()} messages</div>
                </div>
            </div>
        </div>

        {/* Middle: Split Content */}
        <div className="flex-1 grid md:grid-cols-5 gap-4 md:gap-8 min-h-0">
            
            {/* Word Cloud Area */}
            <div className="md:col-span-3 bg-white/5 rounded-3xl p-4 md:p-8 border border-white/5 relative overflow-hidden flex flex-col">
                <div className="absolute top-4 left-6 text-xs md:text-sm font-bold opacity-40 uppercase tracking-widest">
                    Vocabulary
                </div>
                <div className="flex-1 flex flex-wrap content-center justify-center gap-x-3 gap-y-2 md:gap-x-4 md:gap-y-3 mt-6 overflow-hidden">
                    {vocabularyList.slice(0, 30).map((word, i) => {
                         // Pseudo-random sizing
                         const pseudoSize = 1 + (Math.sin(i * 99) * 0.5 + 0.5) * 2; 
                         const fontSize = Math.max(0.9, Math.min(3, pseudoSize)); // Slightly smaller max size
                         const opacity = Math.max(0.5, Math.min(1, 0.4 + (pseudoSize / 3.5) * 0.6));
                        
                        return (
                            <span 
                                key={i} 
                                className="font-display font-bold leading-none hover:text-yellow-400 transition-colors cursor-default"
                                style={{ 
                                    fontSize: `${fontSize}rem`, 
                                    opacity: opacity,
                                    transform: `rotate(${i % 2 === 0 ? 0 : (i % 3 === 0 ? -2 : 2)}deg)`
                                }}
                            >
                                {word}
                            </span>
                        )
                    })}
                </div>
            </div>

            {/* Rhythm Chart */}
            <div className="md:col-span-2 flex flex-col bg-white/5 rounded-3xl p-4 md:p-6 border border-white/5">
                <div className="text-xs md:text-sm font-bold opacity-40 uppercase tracking-widest mb-2 md:mb-4">
                    Daily Rhythm
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={messagesByHour.map((count, hour) => ({ hour, count }))}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#8884d8" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs opacity-50 mt-2 px-2">
                    <span>12 AM</span>
                    <span>Noon</span>
                    <span>11 PM</span>
                </div>
            </div>
        </div>
      </div>
    </GradientBg>
  );
};

export const PersonalStatsSlide: React.FC<SlideProps> = ({ data }) => {
  const topParticipants = data.analytics.participants.slice(0, 5);
  const quotes = data.aiContent?.participantQuotes || [];

  return (
    <GradientBg variant="stats">
      <div className="flex flex-col md:flex-row h-full gap-6 md:gap-12">
          <div className="md:w-1/3 flex flex-col justify-center text-center md:text-left shrink-0">
            <h2 className="text-3xl md:text-6xl font-bold font-display mb-2 md:mb-4">Top<br className="hidden md:block"/>Chatter</h2>
            <p className="text-base md:text-lg opacity-80 mb-4 md:mb-6">Who carried the conversation?</p>
            <div className="hidden md:block bg-white/10 p-6 rounded-2xl backdrop-blur-md">
                <div className="text-4xl font-bold mb-1">{data.analytics.participants.length}</div>
                <div className="text-sm opacity-60">Total Members Contributing</div>
            </div>
          </div>

          <div className="md:w-2/3 flex flex-col gap-3 md:gap-4 overflow-y-auto no-scrollbar py-2 min-h-0">
            {topParticipants.map((p, i) => {
              const userQuote = quotes.find(q => q.name === p.name)?.quote;
              return (
                <div key={p.name} className="flex items-center gap-4 md:gap-6 bg-white/10 p-3 md:p-5 rounded-2xl relative overflow-hidden group hover:bg-white/20 transition-colors shrink-0">
                    {/* Progress bar bg */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 bg-white/10 z-0 transition-all duration-1000" 
                        style={{ width: `${(p.messageCount / topParticipants[0].messageCount) * 100}%` }}
                    />
                    
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold bg-white/20 rounded-full z-10 shrink-0 text-sm md:text-lg">
                    #{i + 1}
                    </div>
                    
                    <div className="flex-1 z-10 min-w-0 flex justify-between items-center">
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="font-bold truncate text-base md:text-xl">{p.name}</div>
                            {userQuote && (
                                <div className="text-xs md:text-base italic text-cyan-200 opacity-90 my-0.5 font-serif line-clamp-1">
                                    "{userQuote}"
                                </div>
                            )}
                            {p.initiationScore > 10 && <div className="text-[10px] md:text-xs opacity-50 mt-1">🔥 {p.initiationScore} conversation starters</div>}
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-base md:text-2xl font-bold block">{p.messageCount.toLocaleString()}</span>
                            <span className="text-[10px] md:text-xs opacity-60">messages</span>
                        </div>
                    </div>
                    
                    {i === 0 && <Trophy className="w-5 h-5 md:w-8 md:h-8 text-yellow-300 z-10 ml-2 md:ml-4" />}
                </div>
              );
            })}
          </div>
      </div>
    </GradientBg>
  );
};

export const TopicsSlide: React.FC<SlideProps> = ({ data }) => {
  const topics = data.aiContent?.topics || [];

  return (
      <GradientBg variant="warm">
          <div className="mb-6 md:mb-12 text-center md:text-left flex-none">
            <h2 className="text-3xl md:text-5xl font-bold font-display">Discussion Themes</h2>
            <p className="opacity-70 text-sm md:text-xl mt-2">What defined your 2025</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-y-auto no-scrollbar relative z-40 pb-10 min-h-0">
              {topics.length > 0 ? topics.map((topic, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-lg border border-white/10 flex flex-col hover:bg-white/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-xl md:text-2xl line-clamp-2">{topic.name}</h3>
                          <span className="text-[10px] md:text-xs bg-white/20 px-2 py-1 md:px-3 rounded-full uppercase tracking-wider font-bold shrink-0 ml-2">{topic.percentage || "Trending"}</span>
                      </div>
                      <p className="text-sm md:text-lg opacity-90 leading-relaxed flex-1 overflow-y-auto no-scrollbar">
                          {topic.description}
                      </p>
                      <div className="mt-4 md:mt-6 pt-4 border-t border-white/10 flex items-center gap-2 opacity-60 text-xs md:text-sm">
                         <MessageSquare size={16} /> 
                         <span>Topic #{i+1}</span>
                      </div>
                  </div>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center h-64 opacity-50">
                    <Brain className="w-16 h-16 mb-4" />
                    <p className="text-xl">Analyzing conversation topics...</p>
                </div>
              )}
          </div>
      </GradientBg>
  );
}

export const MomentSlide: React.FC<SlideProps> = ({ data }) => {
  const moments = data.aiContent?.memorableMoments || [];
  
  return (
    <GradientBg variant="neon">
      <div className="h-full flex flex-col items-center justify-center text-center relative z-10 w-full max-w-6xl mx-auto">
        
        <div className="mb-6 md:mb-10 text-center flex-none">
           <Quote className="w-10 h-10 md:w-20 md:h-20 text-white opacity-80 mx-auto" />
           <h2 className="text-3xl md:text-5xl font-black font-display mt-4">Unforgettable Moments</h2>
           <p className="opacity-70 text-base md:text-lg">The highlights reel</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full overflow-y-auto no-scrollbar min-h-0 pb-4">
            {moments.map((moment, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col hover:bg-white/20 transition-all hover:-translate-y-2 duration-300 relative group">
                    <div className="absolute top-4 right-4 text-3xl md:text-4xl font-bold opacity-10 font-display group-hover:opacity-20 transition-opacity">0{i+1}</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 leading-tight text-left min-h-[3rem] line-clamp-2">{moment.title}</h3>
                    <p className="text-sm md:text-base opacity-90 font-serif italic leading-relaxed text-left flex-1 overflow-y-auto no-scrollbar">
                        "{moment.description}"
                    </p>
                </div>
            ))}
            {moments.length === 0 && (
                <div className="col-span-3 opacity-60 text-xl py-20">
                    Generating memorable moments...
                </div>
            )}
        </div>
      </div>
    </GradientBg>
  );
};

export const NetworkSlide: React.FC<SlideProps> = ({ data }) => {
    // Top 5-6 participants for the web chart
    const topUsers = data.analytics.participants.slice(0, 6);
    const { interactionMatrix } = data.analytics;

    // --- Metrics Logic ---
    
    // 1. Partners in Crime (Max Mutual)
    let maxMutual = 0;
    let soulmates = ['?', '?'];
    
    // 2. The Hub (Most Unique connections)
    let maxUnique = 0;
    let theHub = '?';

    Object.keys(interactionMatrix).forEach(author => {
        const targets = interactionMatrix[author];
        const uniqueCount = Object.keys(targets).length;
        
        if (uniqueCount > maxUnique) {
            maxUnique = uniqueCount;
            theHub = author;
        }

        Object.keys(targets).forEach(target => {
            if (target === author) return;
            // mutual score = A->B + B->A
            const outgoing = targets[target] || 0;
            const incoming = interactionMatrix[target]?.[author] || 0;
            const total = outgoing + incoming;
            
            if (total > maxMutual) {
                maxMutual = total;
                soulmates = [author, target];
            }
        });
    });

    // --- Visualization Coordinates (Pentagon/Hexagon) ---
    const centerX = 200;
    const centerY = 200;
    const radius = 140;

    const userCoords = useMemo(() => {
        return topUsers.map((user, i) => {
            const angle = (i * 2 * Math.PI) / topUsers.length - Math.PI / 2;
            return {
                name: user.name,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                initial: user.name.substring(0, 2).toUpperCase(),
                avatarColor: `hsla(${(i * 360) / topUsers.length}, 70%, 60%, 0.8)`
            };
        });
    }, [topUsers]);

    // Generate SVG Lines
    const connections = useMemo(() => {
        const lines: React.ReactElement[] = [];
        topUsers.forEach((source, i) => {
            topUsers.forEach((target, j) => {
                if (i >= j) return; // Avoid duplicate lines
                
                // Get interaction volume
                const forward = interactionMatrix[source.name]?.[target.name] || 0;
                const backward = interactionMatrix[target.name]?.[source.name] || 0;
                const total = forward + backward;

                if (total > 0) {
                    const p1 = userCoords[i];
                    const p2 = userCoords[j];
                    const strokeWidth = Math.max(1, Math.min(8, total / 5)); // Scaling width
                    const opacity = Math.max(0.2, Math.min(0.8, total / 20));

                    lines.push(
                        <line 
                            key={`${i}-${j}`}
                            x1={p1.x} y1={p1.y}
                            x2={p2.x} y2={p2.y}
                            stroke="white"
                            strokeWidth={strokeWidth}
                            strokeOpacity={opacity}
                            strokeLinecap="round"
                        />
                    );
                }
            });
        });
        return lines;
    }, [topUsers, interactionMatrix, userCoords]);

    return (
        <GradientBg variant="dark">
             <div className="mb-4 md:mb-8 text-center md:text-left flex-none">
                <h2 className="text-3xl md:text-5xl font-bold font-display">The Social Web</h2>
                <p className="opacity-70 text-lg">Who is actually talking to who?</p>
            </div>

            <div className="flex flex-col md:flex-row h-full gap-8 md:gap-12 min-h-0">
                
                {/* Left: The Visual Web */}
                <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                    <div className="w-full max-w-[400px] aspect-square relative">
                         {/* Spinning background rings */}
                         <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
                         <div className="absolute inset-8 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                         <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                            {/* Lines */}
                            {connections}
                            
                            {/* Nodes */}
                            {userCoords.map((u, i) => (
                                <g key={i}>
                                    <circle cx={u.x} cy={u.y} r="24" fill="#1e1e1e" stroke={u.avatarColor} strokeWidth="3" />
                                    <text x={u.x} y={u.y} dy="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                                        {u.initial}
                                    </text>
                                    <text x={u.x} y={u.y + 40} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">
                                        {u.name.split(' ')[0]}
                                    </text>
                                </g>
                            ))}
                         </svg>
                    </div>
                </div>

                {/* Right: The Cards */}
                <div className="flex-1 flex flex-col justify-center gap-4">
                    
                    {/* Partners in Crime */}
                    <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 p-6 rounded-3xl flex items-center gap-4 backdrop-blur-md">
                        <div className="p-3 bg-pink-500 rounded-full text-white shadow-lg shadow-pink-500/40">
                            <Heart size={24} fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">Partners in Crime</div>
                            <div className="text-xl md:text-2xl font-bold flex items-center gap-2 flex-wrap">
                                <span>{soulmates[0]}</span> 
                                <span className="text-pink-400">&</span> 
                                <span>{soulmates[1]}</span>
                            </div>
                            <div className="text-xs opacity-50 mt-1">{maxMutual} interactions</div>
                        </div>
                    </div>

                    {/* The Hub */}
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-6 rounded-3xl flex items-center gap-4 backdrop-blur-md">
                        <div className="p-3 bg-blue-500 rounded-full text-white shadow-lg shadow-blue-500/40">
                            <Anchor size={24} />
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">The Social Glue</div>
                            <div className="text-xl md:text-2xl font-bold">
                                {theHub}
                            </div>
                            <div className="text-xs opacity-50 mt-1">Connected with {maxUnique} people</div>
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
                         <div className="p-3 bg-gray-700 rounded-full text-white">
                            <Activity size={24} />
                        </div>
                        <div>
                             <div className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">Total Vibes</div>
                             <div className="text-xl md:text-2xl font-bold">
                                {data.analytics.participants.length} Active Members
                             </div>
                        </div>
                    </div>

                </div>
            </div>
        </GradientBg>
    )
}

export const PredictionSlide: React.FC<SlideProps> = ({ data }) => {
  const predictions = data.aiContent?.predictions || [];

  return (
    <GradientBg variant="dark">
         <div className="mb-8 md:mb-12 flex items-center gap-4 flex-none">
            <div className="p-3 md:p-4 bg-yellow-400/20 rounded-2xl">
                <Zap className="w-8 h-8 md:w-12 md:h-12 text-yellow-400" />
            </div>
            <div>
                <h2 className="text-3xl md:text-5xl font-bold font-display">2026 Forecast</h2>
                <p className="opacity-70 text-sm md:text-xl">AI-Generated Predictions</p>
            </div>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-1 max-w-3xl mx-auto w-full overflow-y-auto no-scrollbar pb-4 min-h-0">
            {predictions.length > 0 ? predictions.map((pred, i) => (
                <div key={i} className="flex gap-4 md:gap-6 items-center bg-white/5 p-6 md:p-8 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group shrink-0">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-lg md:text-2xl border border-white/20 group-hover:scale-110 transition-transform group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400">
                        {i + 1}
                    </div>
                    <p className="text-lg md:text-2xl font-medium leading-snug">
                        {pred}
                    </p>
                </div>
            )) : (
                <div className="opacity-50 text-center mt-20 text-xl">
                    Consulting the oracle...
                </div>
            )}
        </div>
        
        <div className="mt-auto opacity-40 text-[10px] md:text-sm text-center pt-4 flex-none">
            *Predictions based on 2025 activity patterns and behavior analysis
        </div>
    </GradientBg>
  );
}

export const BadgesSlide: React.FC<SlideProps> = ({ data }) => {
  const badges = data.aiContent?.badges || [];
  
  return (
    <GradientBg variant="stats">
      <div className="text-center mb-6 md:mb-12 flex-none">
        <h2 className="text-3xl md:text-6xl font-bold font-display mb-2">Hall of Fame 🏆</h2>
        <p className="opacity-60 text-lg">Honoring the legends</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-y-auto no-scrollbar pb-10 relative z-40 min-h-0">
        {badges.length > 0 ? badges.map((badge, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 hover:bg-white/20 transition-colors group h-full flex flex-col">
            <div className="flex items-start justify-between mb-4 gap-3">
                <span className="text-5xl md:text-6xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300 shrink-0">{badge.emoji}</span>
                <span className="bg-white/20 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider text-right leading-tight">{badge.memberName}</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-black font-display text-yellow-300 mb-3 leading-none break-words hyphens-auto">{badge.badgeTitle}</h3>
            <p className="text-sm md:text-base opacity-90 leading-relaxed font-medium">{badge.badgeDescription}</p>
          </div>
        )) : (
            <div className="col-span-full text-center opacity-60 mt-20 text-xl">
                AI Badges unavailable. 
                <br/>Connect API Key to see them!
            </div>
        )}
      </div>
    </GradientBg>
  );
};

export const ThankYouSlide: React.FC<SlideProps> = ({ data }) => (
  <GradientBg variant="warm">
     <div className="h-full flex flex-col items-center justify-center text-center space-y-6 md:space-y-12">
        <div className="w-24 h-24 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-2xl animate-bounce-slow">
            <Heart className="w-12 h-12 md:w-20 md:h-20 fill-current" />
        </div>
        
        <div>
            <h2 className="text-4xl md:text-8xl font-black font-display mb-4 md:mb-6">Wrapped</h2>
            <p className="text-lg md:text-3xl opacity-80 max-w-2xl mx-auto leading-relaxed px-4">
                {data.aiContent?.groupPersonality?.vibe || "Here's to another year of chaos and memes."}
            </p>
        </div>

        <div className="pt-8 md:pt-20">
            <div className="text-[10px] md:text-sm font-bold opacity-50 uppercase tracking-widest mb-2 md:mb-3">Created with</div>
            <div className="font-display text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">WhatsApp Wrapped</div>
        </div>
     </div>
  </GradientBg>
);