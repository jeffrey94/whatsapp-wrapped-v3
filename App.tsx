import React, { useState } from 'react';
import { AppStep, WrappedData } from './types';
import { parseChatFile } from './services/chatParser';
import { analyzeChat } from './services/analytics';
import { generateAIInsights } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { WrappedView } from './components/WrappedView';
import { SnowEffect } from './components/SnowEffect';
import { SneakPeekCarousel } from './components/SneakPeekCarousel';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>("");

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
    <div className="min-h-screen bg-[#121212] text-white relative">
      <SnowEffect />
      {step === AppStep.UPLOAD && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10 overflow-hidden">
            {/* Background Carousel */}
            <SneakPeekCarousel />

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-6xl font-black font-display bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-sm">
                        WhatsApp<br/>Wrapped
                    </h1>
                    <p className="text-xl text-gray-200 font-medium max-w-lg mx-auto drop-shadow-md">
                        Rediscover your group chat's best moments of 2025.
                    </p>
                </div>
                
                {/* The "Block" - More solid background to stand out against carousel */}
                <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-1">
                    <FileUpload onFileUpload={handleFileUpload} />
                </div>
            </div>
        </div>
      )}

      {step === AppStep.PROCESSING && (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold animate-pulse">{loadingMsg}</h2>
          <p className="text-gray-500 mt-2">This happens locally in your browser</p>
        </div>
      )}

      {step === AppStep.RESULTS && wrappedData && (
        <WrappedView data={wrappedData} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;