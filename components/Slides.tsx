import React, { useEffect, useState, useMemo } from 'react';
import { WrappedData, ParticipantStats } from '../types';
import { BarChart, Bar, ResponsiveContainer, AreaChart, Area, Cell, XAxis, Tooltip } from 'recharts';
import {
  Clock, Calendar, Trophy, Heart, Quote, Sparkles, Flame, Users, Zap, Brain,
  MessageSquare, ArrowRight, Play, Star, Moon, Sun, Sunrise, Sunset, Coffee,
  Share2, Activity, Crown, TrendingUp, Award, Hash, Smile, CalendarDays, ChevronUp
} from 'lucide-react';

interface SlideProps {
  data: WrappedData;
  items?: any[];
}

// ============================================
// SHARED COMPONENTS
// ============================================

const SlideContainer: React.FC<{
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}> = ({ children, gradient = 'from-purple-900 via-indigo-900 to-slate-900', className = '' }) => (
  <div className={`relative w-full min-h-full flex flex-col bg-gradient-to-br ${gradient} ${className}`}>
    {/* Ambient orbs */}
    <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse-glow" />
    <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />

    {/* Noise texture */}
    <div className="absolute inset-0 opacity-[0.15] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')] pointer-events-none" />

    {/* Content */}
    <div className="relative z-10 flex-1 flex flex-col w-full max-w-lg mx-auto px-5 py-6 safe-top safe-bottom overflow-y-auto no-scrollbar">
      {children}
    </div>
  </div>
);

const SectionTitle: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, className = '' }) => (
  <div className={`text-center mb-6 ${className}`}>
    {icon && <div className="flex justify-center mb-3">{icon}</div>}
    <h2 className="text-3xl font-black font-display gradient-text leading-tight">{title}</h2>
    {subtitle && <p className="text-sm text-white/60 mt-2">{subtitle}</p>}
  </div>
);

const StatCard: React.FC<{
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ value, label, icon, className = '' }) => (
  <div className={`glass rounded-2xl p-4 text-center ${className}`}>
    {icon && <div className="text-white/60 mb-2 flex justify-center">{icon}</div>}
    <div className="text-2xl font-bold font-display">{value}</div>
    <div className="text-xs text-white/50 uppercase tracking-wider mt-1">{label}</div>
  </div>
);

const AnimatedCounter: React.FC<{ end: number; duration?: number }> = ({ end, duration = 2000 }) => {
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

// ============================================
// SLIDE 0: INTRO (Welcome/Teaser)
// ============================================

export const IntroSlide: React.FC<SlideProps> = ({ data }) => {
  const memberCount = data.analytics.participants.length;

  return (
    <SlideContainer gradient="from-black via-slate-900 to-black">
      <div className="flex-1 flex flex-col items-center justify-center text-center">

        {/* Animated emoji rain effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['💬', '🔥', '😂', '💀', '🙈', '👀', '🎉', '💯'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-2xl opacity-20 animate-fall"
              style={{
                left: `${10 + i * 12}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + (i % 3)}s`
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10">
          {/* Warning badge */}
          <div className="glass px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 animate-slide-up border border-yellow-500/30">
            <span className="text-yellow-400">⚠️ Viewer Discretion Advised</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black font-display gradient-text leading-tight mb-6 animate-slide-up stagger-1">
            Ready to be judged<br />by your own chat?
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/60 max-w-xs mx-auto leading-relaxed animate-slide-up stagger-2">
            You and <span className="text-white font-bold">{memberCount - 1} others</span> sent enough messages to fill a novel.
          </p>

          <p className="text-sm text-white/40 mt-4 italic animate-slide-up stagger-3">
            Let's see who really carried this year...
          </p>

          {/* CTA hint */}
          <div className="mt-12 animate-bounce">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Swipe up to begin</div>
            <ChevronUp className="w-6 h-6 text-white/40 mx-auto" />
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 1: COVER (Combined with About)
// ============================================

export const CoverSlide: React.FC<SlideProps> = ({ data }) => {
  const { analytics, aiContent } = data;
  const participants = analytics.participants;
  const topNames = participants.slice(0, 4).map(p => p.name.split(' ')[0]).join(' • ');

  return (
    <SlideContainer gradient="from-violet-900 via-purple-900 to-indigo-900">
      <div className="flex-1 flex flex-col justify-center">

        {/* Year badge */}
        <div className="text-center mb-4">
          <div className="inline-block glass px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-slide-up">
            <span className="text-purple-300">2025</span> Season Finale
          </div>
        </div>

        {/* Main title */}
        <h1 className="text-4xl font-black font-display gradient-text leading-[1.1] text-center px-4 animate-slide-up stagger-1">
          {analytics.groupName || "Your Group Chat"}
        </h1>

        {/* Stats row */}
        <div className="flex justify-center gap-3 mt-6 animate-slide-up stagger-2">
          <div className="glass rounded-xl px-5 py-3 text-center">
            <div className="text-2xl font-bold font-display">
              <AnimatedCounter end={analytics.totalMessages} />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/50">Messages</div>
          </div>
          <div className="glass rounded-xl px-5 py-3 text-center">
            <div className="text-2xl font-bold font-display">
              <AnimatedCounter end={analytics.activeDays} />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/50">Days</div>
          </div>
          <div className="glass rounded-xl px-5 py-3 text-center">
            <div className="text-2xl font-bold font-display">{participants.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/50">Members</div>
          </div>
        </div>

        {/* Vibe Quote */}
        {aiContent?.groupPersonality?.vibe && (
          <div className="mt-6 px-6 animate-slide-up stagger-3">
            <p className="text-center text-sm text-white/70 italic font-serif leading-relaxed">
              "{aiContent.groupPersonality.vibe}"
            </p>
          </div>
        )}

        {/* Values */}
        {aiContent?.groupPersonality?.values && (
          <div className="mt-4 text-center animate-slide-up stagger-4">
            <div className="inline-flex flex-wrap justify-center gap-2 px-4">
              {aiContent.groupPersonality.values.split(',').slice(0, 4).map((value, i) => (
                <span key={i} className="glass px-3 py-1 rounded-full text-xs text-purple-300 font-medium">
                  {value.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Starring */}
      <div className="text-center pb-4 animate-slide-up stagger-5">
        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Starring</div>
        <div className="text-sm text-white/70">{topNames}</div>
        {participants.length > 4 && (
          <div className="text-xs text-white/40 mt-1">& {participants.length - 4} others</div>
        )}
      </div>
    </SlideContainer>
  );
};

// GroupDescriptionSlide now merged into CoverSlide - keeping export for backwards compatibility
export const GroupDescriptionSlide: React.FC<SlideProps> = ({ data }) => {
  return <CoverSlide data={data} />;
};

// ============================================
// SLIDE 3: OVERVIEW / VIBE CHECK
// ============================================

export const OverviewSlide: React.FC<SlideProps> = ({ data }) => {
  const { analytics, aiContent } = data;
  const { participants, messagesByHour } = analytics;

  const nightOwl = participants.find(p => p.chronotype?.label === 'Night Owl') || participants[1];
  const earlyBird = participants.find(p => p.chronotype?.label === 'Early Bird') || participants[2];
  const yapper = participants[0];

  return (
    <SlideContainer gradient="from-cyan-900 via-blue-900 to-indigo-900">
      <SectionTitle
        title="Vibe Check"
        subtitle="The personalities that define you"
      />

      <div className="flex-1 space-y-3">
        {/* Night Owl */}
        <div className="glass rounded-2xl p-4 flex items-center gap-4 animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
            🦉
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-indigo-300/70 font-bold">Night Owl</div>
            <div className="font-bold truncate">{nightOwl?.name || "Unknown"}</div>
            <div className="text-[10px] text-white/40">Active 11PM - 5AM</div>
          </div>
        </div>

        {/* Early Bird */}
        <div className="glass rounded-2xl p-4 flex items-center gap-4 animate-slide-up stagger-1">
          <div className="w-12 h-12 rounded-full bg-orange-500/30 flex items-center justify-center text-2xl shrink-0">
            🌅
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-orange-300/70 font-bold">Early Bird</div>
            <div className="font-bold truncate">{earlyBird?.name || "Unknown"}</div>
            <div className="text-[10px] text-white/40">Active 5AM - 10AM</div>
          </div>
        </div>

        {/* Chief Yapper */}
        <div className="glass rounded-2xl p-4 flex items-center gap-4 animate-slide-up stagger-2">
          <div className="w-12 h-12 rounded-full bg-pink-500/30 flex items-center justify-center text-2xl shrink-0">
            🗣️
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-pink-300/70 font-bold">Chief Yapper</div>
            <div className="font-bold truncate">{yapper?.name || "Unknown"}</div>
            <div className="text-[10px] text-white/40">{yapper?.messageCount.toLocaleString()} messages</div>
          </div>
        </div>

        {/* Daily Rhythm Chart */}
        <div className="glass rounded-2xl p-4 mt-4 animate-slide-up stagger-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-3">Daily Rhythm</div>
          <div className="h-24" style={{ minWidth: 0, minHeight: 96 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={messagesByHour.map((count, hour) => ({ hour, count }))}>
                <defs>
                  <linearGradient id="rhythmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rhythmGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-2">
            <span>12 AM</span>
            <span>Noon</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 4: WORD CLOUD / VOCABULARY
// ============================================

export const VocabularySlide: React.FC<SlideProps> = ({ data }) => {
  const { analytics, aiContent } = data;
  const words = aiContent?.wordCloud || analytics.topWords.slice(0, 30).map(w => w.text);

  return (
    <SlideContainer gradient="from-fuchsia-900 via-purple-900 to-violet-900">
      <SectionTitle
        title="Your Dictionary"
        subtitle="The words that defined 2025"
        icon={<Hash className="w-8 h-8 text-fuchsia-400" />}
      />

      <div className="flex-1 flex flex-wrap content-center justify-center gap-x-3 gap-y-2 px-2">
        {words.slice(0, 35).map((word, i) => {
          const size = 0.8 + (Math.sin(i * 99) * 0.5 + 0.5) * 1.2;
          const opacity = 0.5 + (size / 2) * 0.5;
          const rotation = (i % 3 === 0) ? -3 : (i % 2 === 0) ? 3 : 0;

          return (
            <span
              key={i}
              className="font-display font-bold leading-none transition-all hover:text-yellow-400 cursor-default animate-fade-in"
              style={{
                fontSize: `${size}rem`,
                opacity,
                transform: `rotate(${rotation}deg)`,
                animationDelay: `${i * 30}ms`
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 5: TOP EMOJIS
// ============================================

export const EmojiSlide: React.FC<SlideProps> = ({ data }) => {
  const { analytics } = data;
  const topEmojis = analytics.topEmojis.slice(0, 10);
  const maxCount = topEmojis[0]?.[1] || 1;

  return (
    <SlideContainer gradient="from-yellow-900 via-orange-900 to-red-900">
      <SectionTitle
        title="Emoji Report"
        subtitle="Your group's emotional vocabulary"
        icon={<Smile className="w-8 h-8 text-yellow-400" />}
      />

      <div className="flex-1 flex flex-col justify-center space-y-3">
        {topEmojis.map(([emoji, count], i) => (
          <div
            key={i}
            className="glass rounded-2xl p-3 flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="text-3xl w-12 text-center">{emoji}</div>
            <div className="flex-1">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-bold w-16 text-right">{count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 6: ACTIVITY CALENDAR
// ============================================

export const ActivitySlide: React.FC<SlideProps> = ({ data }) => {
  const { analytics } = data;
  const { messagesByDay, messagesByMonth } = analytics;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const maxDay = Math.max(...messagesByDay);
  const maxMonth = Math.max(...messagesByMonth);
  const busiestDay = days[messagesByDay.indexOf(maxDay)];
  const busiestMonth = months[messagesByMonth.indexOf(maxMonth)];

  return (
    <SlideContainer gradient="from-emerald-900 via-teal-900 to-cyan-900">
      <SectionTitle
        title="Activity Map"
        subtitle="When did the magic happen?"
        icon={<CalendarDays className="w-8 h-8 text-emerald-400" />}
      />

      <div className="flex-1 space-y-6">
        {/* Highlights */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{busiestDay}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1">Busiest Day</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{busiestMonth}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1">Peak Month</div>
          </div>
        </div>

        {/* Day of Week */}
        <div className="glass rounded-2xl p-4 animate-slide-up stagger-1">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-3">By Day of Week</div>
          <div className="flex justify-between gap-1">
            {messagesByDay.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-white/10 rounded-full overflow-hidden" style={{ height: '80px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                    style={{
                      height: `${(count / maxDay) * 100}%`,
                      marginTop: `${100 - (count / maxDay) * 100}%`
                    }}
                  />
                </div>
                <span className="text-[10px] text-white/50">{days[i].charAt(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly */}
        <div className="glass rounded-2xl p-4 animate-slide-up stagger-2">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-3">By Month</div>
          <div className="h-20" style={{ minWidth: 0, minHeight: 80 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={messagesByMonth.map((count, i) => ({ month: months[i], count }))}>
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-2">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 7: HEATMAP
// ============================================

export const HeatmapSlide: React.FC<SlideProps> = ({ data }) => {
  const { analytics } = data;
  const { heatmap } = analytics;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxVal = Math.max(...heatmap.flat());

  // Find peak time
  let peakDay = 0, peakHour = 0, peakVal = 0;
  heatmap.forEach((row, d) => {
    row.forEach((val, h) => {
      if (val > peakVal) {
        peakVal = val;
        peakDay = d;
        peakHour = h;
      }
    });
  });

  const formatHour = (h: number) => {
    if (h === 0) return '12AM';
    if (h === 12) return '12PM';
    return h < 12 ? `${h}AM` : `${h - 12}PM`;
  };

  return (
    <SlideContainer gradient="from-rose-900 via-pink-900 to-fuchsia-900">
      <SectionTitle
        title="The Heatmap"
        subtitle="Your 24/7 activity pattern"
        icon={<Flame className="w-8 h-8 text-rose-400" />}
      />

      <div className="flex-1 flex flex-col justify-center">
        {/* Peak highlight */}
        <div className="glass rounded-2xl p-4 mb-6 text-center animate-slide-up">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Peak Activity</div>
          <div className="text-2xl font-bold font-display">
            {days[peakDay]} at {formatHour(peakHour)}
          </div>
          <div className="text-sm text-rose-300 mt-1">{peakVal.toLocaleString()} messages</div>
        </div>

        {/* Heatmap grid */}
        <div className="glass rounded-2xl p-4 animate-slide-up stagger-1">
          <div className="grid grid-cols-[auto_1fr] gap-2">
            {/* Days column */}
            <div className="flex flex-col justify-around pr-2">
              {days.map((day, i) => (
                <div key={i} className="text-[9px] text-white/40 h-4 flex items-center">
                  {day.charAt(0)}
                </div>
              ))}
            </div>

            {/* Heatmap */}
            <div className="grid grid-cols-24 gap-[2px]">
              {heatmap.map((row, dayIdx) => (
                row.map((val, hourIdx) => (
                  <div
                    key={`${dayIdx}-${hourIdx}`}
                    className="aspect-square rounded-sm transition-colors"
                    style={{
                      backgroundColor: `rgba(251, 113, 133, ${Math.min(0.2 + (val / maxVal) * 0.8, 1)})`
                    }}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Hour labels */}
          <div className="flex justify-between text-[8px] text-white/30 mt-2 pl-8">
            <span>12AM</span>
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
            <span>11PM</span>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 8: PERSONAL STATS / RANKING
// ============================================

interface PersonalStatsSlideProps extends SlideProps {
  startRank?: number;
}

export const PersonalStatsSlide: React.FC<PersonalStatsSlideProps> = ({ data, items, startRank = 0 }) => {
  const participants = items || data.analytics.participants.slice(0, 3);
  const quotes = data.aiContent?.participantQuotes || [];
  const allParticipants = data.analytics.participants;
  const maxCount = allParticipants[0]?.messageCount || 1;

  return (
    <SlideContainer gradient="from-pink-900 via-rose-900 to-red-900">
      <SectionTitle
        title={startRank === 0 ? "Top Chatters" : "Rankings"}
        subtitle="Who carried the conversation?"
        icon={<Trophy className="w-8 h-8 text-yellow-400" />}
      />

      <div className="flex-1 space-y-4">
        {participants.map((p: ParticipantStats, i: number) => {
          const globalRank = startRank + i;
          const userQuote = quotes.find(q => q.name === p.name)?.quote;
          const isFirst = globalRank === 0;

          return (
            <div
              key={p.name}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Main Card */}
              <div className={`glass rounded-2xl p-4 relative overflow-hidden ${isFirst ? 'ring-2 ring-yellow-400/50' : ''}`}>
                {/* Progress bar bg */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"
                  style={{ width: `${(p.messageCount / maxCount) * 100}%` }}
                />

                <div className="relative flex items-center gap-3">
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isFirst ? 'bg-yellow-400 text-black' : 'bg-white/10'
                    }`}>
                    #{globalRank + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg truncate flex items-center gap-2">
                      {p.name}
                      {isFirst && <Trophy className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <div className="flex gap-3 text-xs text-white/50 mt-1">
                      <span className="font-semibold">{p.messageCount.toLocaleString()} msgs</span>
                      <span>{p.wordCount.toLocaleString()} words</span>
                      {p.initiationScore > 10 && <span>🔥 {p.initiationScore}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Box - Prominent */}
              {userQuote && (
                <div className="mt-2 ml-6 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
                  <div className="pl-4 py-2">
                    <Quote className="w-4 h-4 text-yellow-400/60 mb-1" />
                    <p className="text-sm italic text-white/90 font-serif leading-relaxed">
                      "{userQuote}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 9: MOMENTS (Single Moment - Impactful Design)
// ============================================

interface MomentSlideProps extends SlideProps {
  momentIndex?: number;
  totalMoments?: number;
}

export const MomentSlide: React.FC<MomentSlideProps> = ({ data, items, momentIndex = 0, totalMoments = 1 }) => {
  const moments = items || data.aiContent?.memorableMoments || [];
  const moment = moments[0];

  if (!moment) {
    return (
      <SlideContainer gradient="from-violet-900 via-purple-900 to-fuchsia-900">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Sparkles className="w-16 h-16 text-violet-400 mb-6 opacity-50" />
          <p className="text-white/40">Generating memorable moments...</p>
        </div>
      </SlideContainer>
    );
  }

  return (
    <SlideContainer gradient="from-violet-900 via-purple-900 to-fuchsia-900">
      <div className="flex-1 flex flex-col justify-center items-center text-center relative">

        {/* Large Background Index */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-black font-display text-white/[0.03] leading-none pointer-events-none select-none">
          {String(momentIndex + 1).padStart(2, '0')}
        </div>

        {/* Moment Counter */}
        <div className="glass px-4 py-2 rounded-full mb-8 animate-slide-up">
          <span className="text-sm font-bold">
            <span className="text-violet-300">Moment</span> {momentIndex + 1} of {totalMoments}
          </span>
        </div>

        {/* Sparkle Icon */}
        <div className="mb-6 animate-slide-up stagger-1">
          <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black font-display gradient-text leading-tight mb-6 px-4 animate-slide-up stagger-2">
          {moment.title}
        </h2>

        {/* Description */}
        <div className="glass rounded-3xl p-6 max-w-sm mx-auto animate-slide-up stagger-3">
          <Quote className="w-6 h-6 text-violet-400/60 mb-3 mx-auto" />
          <p className="text-lg text-white/90 font-serif italic leading-relaxed">
            "{moment.description}"
          </p>
        </div>

        {/* Decorative Line */}
        <div className="w-16 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mt-8 mx-auto animate-fade-in stagger-4" />
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 10: TOPICS
// ============================================

export const TopicsSlide: React.FC<SlideProps> = ({ data, items }) => {
  const topics = items || data.aiContent?.topics || [];

  return (
    <SlideContainer gradient="from-amber-900 via-orange-900 to-red-900">
      <SectionTitle
        title="Discussion Themes"
        subtitle="What dominated the chat?"
        icon={<MessageSquare className="w-8 h-8 text-amber-400" />}
      />

      <div className="flex-1 space-y-4">
        {topics.map((topic: { name: string; description: string; percentage?: string; ledBy?: string }, i: number) => (
          <div
            key={i}
            className="glass rounded-3xl p-5 animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="text-lg font-bold leading-tight">{topic.name}</h3>
              {topic.percentage && (
                <span className="shrink-0 text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                  {topic.percentage}
                </span>
              )}
            </div>

            <p className="text-sm text-white/70 leading-relaxed mb-3">
              {topic.description}
            </p>

            {topic.ledBy && (
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <Crown size={14} />
                <span>Led by {topic.ledBy}</span>
              </div>
            )}
          </div>
        ))}

        {topics.length === 0 && (
          <div className="text-center text-white/40 py-20">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Analyzing discussion topics...</p>
          </div>
        )}
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 11: PREDICTIONS (Mystical Psychic Theme)
// ============================================

export const PredictionSlide: React.FC<SlideProps> = ({ data }) => {
  const predictions = data.aiContent?.predictions || [];

  return (
    <SlideContainer gradient="from-indigo-950 via-purple-950 to-slate-950">
      {/* Mystical star decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-2xl opacity-20 animate-pulse">✨</div>
        <div className="absolute top-20 right-16 text-xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute bottom-32 left-8 text-lg opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-20 right-10 text-2xl opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}>🌟</div>
      </div>

      {/* Crystal Ball Header */}
      <div className="text-center mb-6 animate-slide-up">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400/30 via-indigo-500/20 to-transparent border border-purple-400/30 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <span className="text-4xl">🔮</span>
          </div>
          <div className="absolute -top-1 -right-1 text-lg animate-pulse">✨</div>
        </div>
        <h2 className="text-2xl font-black font-display bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
          The Oracle Speaks
        </h2>
        <p className="text-xs text-purple-300/60 mt-1 italic">Visions for 2026...</p>
      </div>

      {/* Predictions */}
      <div className="flex-1 space-y-4">
        {predictions.map((pred: string, i: number) => (
          <div
            key={i}
            className="relative animate-slide-up"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            {/* Card with mystical border */}
            <div className="glass rounded-2xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-colors group">
              <div className="flex gap-4 items-start">
                {/* Vision number - mystical style */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border border-purple-400/30 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
                  {['I', 'II', 'III', 'IV', 'V'][i] || i + 1}
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic font-serif">
                  "{pred}"
                </p>
              </div>
            </div>
          </div>
        ))}

        {predictions.length === 0 && (
          <div className="text-center text-purple-300/40 py-16">
            <div className="text-5xl mb-4 animate-pulse">🔮</div>
            <p className="italic">The spirits are gathering...</p>
          </div>
        )}
      </div>

      {/* Mystical footer */}
      <div className="text-center pt-4 animate-fade-in stagger-3">
        <div className="text-[10px] text-purple-400/40 italic">
          ✨ Channeled from your 2025 chat patterns ✨
        </div>
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 12: BADGES / AWARDS
// ============================================

export const BadgesSlide: React.FC<SlideProps> = ({ data, items }) => {
  const badges = items || data.aiContent?.badges || [];

  return (
    <SlideContainer gradient="from-pink-900 via-rose-900 to-red-900">
      <SectionTitle
        title="Hall of Fame"
        subtitle="Honoring the legends"
        icon={<Award className="w-8 h-8 text-yellow-400" />}
      />

      <div className="flex-1 space-y-4">
        {badges.map((badge: { memberName: string; badgeTitle: string; badgeDescription: string; emoji: string }, i: number) => (
          <div
            key={i}
            className="glass rounded-3xl p-5 animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">{badge.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  {badge.memberName}
                </div>
                <h3 className="text-xl font-black font-display text-yellow-300 mb-2">
                  {badge.badgeTitle}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {badge.badgeDescription}
                </p>
              </div>
            </div>
          </div>
        ))}

        {badges.length === 0 && (
          <div className="text-center text-white/40 py-20">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>AI Badges unavailable</p>
            <p className="text-xs mt-2">Connect API Key to see them!</p>
          </div>
        )}
      </div>
    </SlideContainer>
  );
};

// ============================================
// SLIDE 13: THANK YOU
// ============================================

export const ThankYouSlide: React.FC<SlideProps> = ({ data }) => {
  const { aiContent } = data;

  const signOff = aiContent?.signOffMessage || "Here's to another year of chaos, questionable life choices, and way too many notifications. You made it.";

  return (
    <SlideContainer gradient="from-amber-900 via-orange-900 to-rose-900">
      <div className="flex-1 flex flex-col items-center justify-center text-center">

        {/* Heart icon */}
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-8 animate-float shadow-2xl shadow-white/20">
          <Heart className="w-12 h-12 text-rose-500 fill-current" />
        </div>

        {/* Title */}
        <h2 className="text-5xl font-black font-display gradient-text mb-6 animate-slide-up">
          That's a Wrap!
        </h2>

        {/* Sign Off Message */}
        <p className="text-lg text-white/80 max-w-xs leading-relaxed px-4 animate-slide-up stagger-1 font-medium">
          {signOff}
        </p>

        {/* Branding */}
        <div className="mt-16 animate-fade-in stagger-3">
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Created with</div>
          <div className="font-display text-xl font-bold gradient-text">WhatsApp Wrapped</div>
          <div className="text-xs text-white/40 mt-2">2025 Edition</div>
        </div>
      </div>
    </SlideContainer>
  );
};