import React, { useState, useEffect } from 'react';
import { AppStep, WrappedData } from './types';
import { parseChatFile } from './services/chatParser';
import { analyzeChat } from './services/analytics';
import { generateAIInsights } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { WrappedView } from './components/WrappedView';
import { Snowfall } from './components/Snowfall';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [isSharedView, setIsSharedView] = useState(false);

  // Check for shared report ID in URL on mount
  useEffect(() => {
    const checkSharedReport = async () => {
      const path = window.location.pathname;
      const match = path.match(/^\/r\/([a-zA-Z0-9]+)$/);

      if (match) {
        const reportId = match[1];
        setStep(AppStep.PROCESSING);
        setLoadingMsg("Loading shared report...");

        try {
          const response = await fetch(`/api/get-report?id=${reportId}`);

          if (!response.ok) {
            throw new Error('Report not found');
          }

          const result = await response.json();
          setWrappedData(result.data);
          setIsSharedView(true);
          setStep(AppStep.RESULTS);
        } catch (error) {
          console.error('Failed to load shared report:', error);
          alert('This report link has expired or is invalid.');
          window.location.href = '/';
        }
      }
    };

    checkSharedReport();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setStep(AppStep.PROCESSING);

      setLoadingMsg("Parsing chat file...");
      const allMessages = await parseChatFile(file);

      // Filter strictly for 2025
      const messages = allMessages.filter(m => m.date.getFullYear() === 2025);

      if (messages.length < 10) {
        alert("Not enough messages found from 2025 to generate insights (min 10 required).");
        setStep(AppStep.UPLOAD);
        return;
      }

      setLoadingMsg("Crunching 2025 numbers...");
      const analytics = analyzeChat(messages);

      // Determine group name from filename usually "WhatsApp Chat with GroupName.txt"
      const fileNameMatch = file.name.match(/WhatsApp Chat with (.+)\.txt/);
      if (fileNameMatch) {
        analytics.groupName = fileNameMatch[1];
      }

      setLoadingMsg("Reading your 2025 conversation...");

      // Filter out only media placeholders. 
      // We keep short messages ("lol", "ok") as they are crucial for the "Vibe" analysis.
      const fullHistory = messages.filter(m => !m.isMedia);

      const aiContent = await generateAIInsights(analytics, fullHistory);

      setWrappedData({
        analytics,
        aiContent
      });

      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error(error);
      alert("Error processing file. Please ensure it's a valid WhatsApp export.");
      setStep(AppStep.UPLOAD);
    }
  };

  const handleReset = () => {
    setWrappedData(null);
    setStep(AppStep.UPLOAD);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden">
      {/* ❄️ Christmas Snow Effect */}
      <Snowfall count={60} />

      {step === AppStep.UPLOAD && (
        <div className="h-full w-full flex flex-col relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[150px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 safe-top safe-bottom overflow-y-auto no-scrollbar">

            {/* SECTION 1: Title & Tagline */}
            <div className="text-center pt-12 pb-6 md:pb-10 animate-slide-up">
              <div className="inline-block px-4 py-2 glass rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <span className="text-purple-300">2025</span> Edition
              </div>

              <h1 className="text-5xl md:text-6xl font-black font-display gradient-text leading-tight mb-4">
                WhatsApp<br />Wrapped
              </h1>

              <p className="text-base text-white/60 max-w-sm mx-auto">
                Rediscover your group chat's best moments of 2025.
              </p>
            </div>

            {/* AUTO-SCROLLING CAROUSEL - Satirical Preview */}
            <div className="py-4 md:pt-4 md:pb-8 -mx-6 overflow-visible animate-fade-in stagger-1">
              <div className="marquee-track">
                <div className="marquee-content">
                  {[
                    { emoji: '🎖️', text: 'Personalized badges for every member', color: 'text-amber-400' },
                    { emoji: '💬', text: 'Iconic quotes you can\'t unsend', color: 'text-pink-400' },
                    { emoji: '🔮', text: 'AI predictions for your group', color: 'text-purple-400' },
                    { emoji: '📊', text: 'Who messages too much (spoiler: it\'s you)', color: 'text-cyan-400' },
                    { emoji: '🎭', text: 'Your group vibe, brutally analyzed', color: 'text-green-400' },
                    { emoji: '🏆', text: 'Night owls vs. early birds exposed', color: 'text-yellow-400' },
                    { emoji: '💥', text: 'Most chaotic moments of 2025', color: 'text-red-400' },
                    { emoji: '🗣️', text: 'Topics you won\'t shut up about', color: 'text-orange-400' },
                  ].map((item, i) => (
                    <div
                      key={`a-${i}`}
                      className="glass rounded-xl px-4 py-3 flex items-center gap-3 whitespace-nowrap"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className={`text-sm font-medium ${item.color}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="marquee-content" aria-hidden="true">
                  {[
                    { emoji: '🎖️', text: 'Personalized badges for every member', color: 'text-amber-400' },
                    { emoji: '💬', text: 'Iconic quotes you can\'t unsend', color: 'text-pink-400' },
                    { emoji: '🔮', text: 'AI predictions for your group', color: 'text-purple-400' },
                    { emoji: '📊', text: 'Who messages too much (spoiler: it\'s you)', color: 'text-cyan-400' },
                    { emoji: '🎭', text: 'Your group vibe, brutally analyzed', color: 'text-green-400' },
                    { emoji: '🏆', text: 'Night owls vs. early birds exposed', color: 'text-yellow-400' },
                    { emoji: '💥', text: 'Most chaotic moments of 2025', color: 'text-red-400' },
                    { emoji: '🗣️', text: 'Topics you won\'t shut up about', color: 'text-orange-400' },
                  ].map((item, i) => (
                    <div
                      key={`b-${i}`}
                      className="glass rounded-xl px-4 py-3 flex items-center gap-3 whitespace-nowrap"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className={`text-sm font-medium ${item.color}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: Upload Card */}
            <div className="py-4 md:pt-10">
              <div className="w-full max-w-md mx-auto animate-slide-up stagger-2">
                <div className="glass rounded-3xl overflow-hidden">
                  <FileUpload onFileUpload={handleFileUpload} />
                </div>
              </div>
            </div>

            {/* Creator Credits */}
            <div className="text-center py-4 animate-fade-in stagger-3">
              <div className="text-xs text-white/30">
                Created by <span className="text-white/50">Jeffrey</span>, <span className="text-purple-400/70">Claude</span> & <span className="text-blue-400/70">Gemini</span>
              </div>
            </div>
          </div>

          {/* Hidden Debug Import - Bottom Right Corner */}
          <label className="fixed bottom-2 right-2 z-50 text-[8px] text-[#0a0a0a] hover:text-white/20 cursor-pointer transition-colors select-none">
            •••
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const json = JSON.parse(ev.target?.result as string);
                      setWrappedData(json);
                      setStep(AppStep.RESULTS);
                    } catch (err) {
                      alert("Invalid JSON");
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      )}

      {step === AppStep.PROCESSING && (
        <div className="h-full w-full flex flex-col items-center justify-center relative">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-pulse" />
          </div>

          {/* Loading UI */}
          <div className="relative z-10 text-center px-6">
            {/* Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>

            <h2 className="text-2xl font-bold font-display mb-3 animate-pulse">{loadingMsg}</h2>
            <p className="text-sm text-white/50">This happens locally in your browser</p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-8">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/30 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {step === AppStep.RESULTS && wrappedData && (
        <WrappedView data={wrappedData} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;