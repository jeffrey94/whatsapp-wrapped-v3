import React, { useState, useEffect, useRef } from 'react';
import { WrappedData } from '../types';
import { ChevronLeft, ChevronRight, RefreshCw, LayoutGrid, BarChart3, Users, Sparkles, MessageSquare, Award, PlayCircle, Share2, Download, Package, Presentation } from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import PptxGenJS from 'pptxgenjs';
import {
  CoverSlide,
  OverviewSlide,
  PersonalStatsSlide,
  NetworkSlide,
  MomentSlide,
  TopicsSlide,
  PredictionSlide,
  BadgesSlide,
  ThankYouSlide
} from './Slides';

interface WrappedViewProps {
  data: WrappedData;
  onReset: () => void;
}

export const WrappedView: React.FC<WrappedViewProps> = ({ data, onReset }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isExportingPPT, setIsExportingPPT] = useState(false);
  const [exportProgress, setExportProgress] = useState(0); // 0 to 100
  
  const slideRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const slides = [
    { component: <CoverSlide key="cover" data={data} />, title: "Intro", icon: PlayCircle },
    { component: <OverviewSlide key="overview" data={data} />, title: "Overview", icon: LayoutGrid },
    { component: <PersonalStatsSlide key="stats" data={data} />, title: "Ranking", icon: BarChart3 },
    { component: <NetworkSlide key="network" data={data} />, title: "Network", icon: Users },
    { component: <MomentSlide key="moment" data={data} />, title: "Moments", icon: Sparkles },
    { component: <TopicsSlide key="topics" data={data} />, title: "Topics", icon: MessageSquare },
    { component: <PredictionSlide key="predictions" data={data} />, title: "Forecast", icon: Sparkles },
    { component: <BadgesSlide key="badges" data={data} />, title: "Awards", icon: Award },
    { component: <ThankYouSlide key="end" data={data} />, title: "Wrapped", icon: Sparkles },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(c => c + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isExportingAll || isExportingPPT) return; // Disable nav during export
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isExportingAll, isExportingPPT]);

  // Helper to fix CSS issues during HTML2Canvas capture
  const fixStylesForCapture = (doc: Document) => {
    // 1. AGGRESSIVE Fix for Gradient/Invisible Text
    const gradients = doc.querySelectorAll('.text-transparent, .bg-clip-text');
    gradients.forEach((el) => {
      const element = el as HTMLElement;
      element.classList.remove(
        'text-transparent', 
        'bg-clip-text', 
        'bg-gradient-to-r', 'bg-gradient-to-br', 'bg-gradient-to-b', 'bg-gradient-to-tr', 'bg-gradient-to-tl',
        'from-white', 'to-white/70'
      );
      element.style.color = '#ffffff';
      element.style.webkitTextFillColor = '#ffffff'; 
      element.style.backgroundImage = 'none';
      element.style.background = 'none';
    });

    // 2. AGGRESSIVE Fix for Truncated/Cut-off Text
    const clamped = doc.querySelectorAll('[class*="line-clamp-"]');
    clamped.forEach((el) => {
        const element = el as HTMLElement;
        const classes = Array.from(element.classList);
        classes.forEach(cls => {
            if (cls.startsWith('line-clamp-')) element.classList.remove(cls);
        });
        element.style.display = 'block'; 
        element.style.maxHeight = 'none';
        element.style.height = 'auto';
        element.style.whiteSpace = 'normal';
        element.style.overflow = 'visible';
        element.style.textOverflow = 'clip';
    });
  };

  const handleShare = async () => {
    if (!slideRef.current || isCapturing || isExportingAll || isExportingPPT) return;
    
    try {
      setIsCapturing(true);
      
      // Wait for a brief moment to ensure UI elements (like hover states) are clear
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(slideRef.current, {
        scale: 2, 
        backgroundColor: '#0a0a0a',
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => fixStylesForCapture(clonedDoc)
      });

      const image = canvas.toDataURL("image/png");

      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], `whatsapp-wrapped-2025-${currentSlide}.png`, { type: 'image/png' });
        await navigator.share({
          title: 'My WhatsApp Wrapped 2025',
          text: 'Check out my WhatsApp 2025 stats!',
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.href = image;
        link.download = `whatsapp-wrapped-2025-${currentSlide}.png`;
        link.click();
      }
    } catch (error) {
      console.error("Sharing failed", error);
      if (error instanceof Error && error.name === 'AbortError') return;
      alert("Could not capture image. Try taking a screenshot manually!");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (isExportingAll || isExportingPPT || isCapturing) return;

    try {
        setIsExportingAll(true);
        setExportProgress(0);

        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!exportContainerRef.current) throw new Error("Export container not found");

        const zip = new JSZip();
        const slideElements = Array.from(exportContainerRef.current.children) as HTMLElement[];
        
        for (let i = 0; i < slideElements.length; i++) {
            const slideEl = slideElements[i];
            const canvas = await html2canvas(slideEl, {
                scale: 2, 
                backgroundColor: '#0a0a0a',
                logging: false,
                useCORS: true,
                onclone: (clonedDoc) => fixStylesForCapture(clonedDoc)
            });

            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                const fileName = `${i + 1}_${slides[i].title.replace(/\s+/g, '_')}.png`;
                zip.file(fileName, blob);
            }
            setExportProgress(Math.round(((i + 1) / slides.length) * 100));
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "WhatsApp_Wrapped_2025_All_Slides.zip");

    } catch (error) {
        console.error("Export all failed", error);
        alert("Failed to export. Please try again.");
    } finally {
        setIsExportingAll(false);
        setExportProgress(0);
    }
  };

  const handleExportPPT = async () => {
    if (isExportingAll || isExportingPPT || isCapturing) return;

    try {
        setIsExportingPPT(true);
        setExportProgress(0);

        // 1. Prepare PptxGenJS
        const pres = new PptxGenJS();
        pres.layout = 'LAYOUT_16x9';
        pres.title = 'WhatsApp Wrapped 2025';
        
        // 2. Wait for rendering of hidden container
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!exportContainerRef.current) throw new Error("Export container not found");

        const slideElements = Array.from(exportContainerRef.current.children) as HTMLElement[];
        
        // 3. Loop and capture
        for (let i = 0; i < slideElements.length; i++) {
            const slideEl = slideElements[i];
            const canvas = await html2canvas(slideEl, {
                scale: 2, 
                backgroundColor: '#0a0a0a',
                logging: false,
                useCORS: true,
                onclone: (clonedDoc) => fixStylesForCapture(clonedDoc)
            });

            const dataUrl = canvas.toDataURL("image/png");
            
            // Add slide to PPT
            const slide = pres.addSlide();
            slide.background = { color: '0a0a0a' };
            slide.addImage({ 
                data: dataUrl, 
                x: 0, 
                y: 0, 
                w: '100%', 
                h: '100%' 
            });

            setExportProgress(Math.round(((i + 1) / slides.length) * 100));
        }

        // 4. Save
        await pres.writeFile({ fileName: "WhatsApp_Wrapped_2025.pptx" });

    } catch (error) {
        console.error("PPT Export failed", error);
        alert("Failed to create presentation. Try downloading images instead.");
    } finally {
        setIsExportingPPT(false);
        setExportProgress(0);
    }
  };

  const isExporting = isExportingAll || isExportingPPT;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      
      {/* Hidden Export Container */}
      {isExporting && (
          <div 
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '0px', 
                overflow: 'hidden', 
                zIndex: -1 
            }}
          >
             <div 
                ref={exportContainerRef}
                style={{ width: '1280px' }} // Fixed export width
             >
                {slides.map((slide, idx) => (
                    <div key={idx} style={{ width: '1280px', height: '720px', marginBottom: '20px' }} className="relative bg-gray-900 overflow-hidden">
                        {slide.component}
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900/50 border-r border-white/10 flex flex-col p-6 backdrop-blur-xl z-20 hidden md:flex">
        <div className="mb-8">
            <h1 className="font-display font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Wrapped
            </h1>
            <p className="text-xs text-gray-500 mt-1">2025 Edition</p>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
            {slides.map((slide, idx) => {
                const Icon = slide.icon;
                const isActive = idx === currentSlide;
                return (
                    <button
                        key={idx}
                        onClick={() => !isExporting && setCurrentSlide(idx)}
                        disabled={isExporting}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                            isActive 
                            ? 'bg-white/10 text-white shadow-lg border border-white/5' 
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Icon size={16} className={isActive ? 'text-purple-400' : ''} />
                        {slide.title}
                    </button>
                );
            })}
        </div>

        <div className="pt-6 border-t border-white/10">
            <button 
                onClick={onReset}
                disabled={isExporting}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
                <RefreshCw size={14} />
                Upload New File
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen">
         {/* Top Controls (Mobile) */}
         <div className="md:hidden absolute top-4 left-4 z-50">
             <button 
                onClick={onReset}
                disabled={isExporting}
                className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 disabled:opacity-50"
            >
                <RefreshCw size={20} />
            </button>
         </div>
         
         {/* Action Buttons (Floating) */}
         <div className="absolute top-4 right-4 z-50 flex flex-wrap justify-end gap-2 px-2">
            
            {/* Export PPT Button */}
            <button
                onClick={handleExportPPT}
                disabled={isCapturing || isExporting}
                className="flex items-center gap-2 bg-pink-600/80 hover:bg-pink-600 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-pink-900/20"
            >
                 {isExportingPPT ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span className="hidden md:inline">{exportProgress}%</span>
                    </div>
                ) : (
                    <>
                        <Presentation size={16} />
                        <span className="hidden md:inline">Export Slides</span>
                    </>
                )}
            </button>

            {/* Download All Button */}
            <button
                onClick={handleDownloadAll}
                disabled={isCapturing || isExporting}
                className="flex items-center gap-2 bg-purple-600/80 hover:bg-purple-600 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-purple-900/20"
            >
                 {isExportingAll ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span className="hidden md:inline">{exportProgress}%</span>
                    </div>
                ) : (
                    <>
                        <Package size={16} />
                        <span className="hidden md:inline">Download Zip</span>
                    </>
                )}
            </button>

            {/* Share Current Slide Button */}
            <button
                onClick={handleShare}
                disabled={isCapturing || isExporting}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
                {isCapturing ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Share2 size={16} />
                        <span className="hidden md:inline">Share Slide</span>
                    </>
                )}
            </button>
         </div>

         {/* Presentation Stage */}
         <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
            <div 
                ref={slideRef}
                className="relative w-full max-w-6xl aspect-[16/9] bg-gray-900 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 group"
            >
                
                {/* The Slide */}
                <div className="w-full h-full relative">
                    {slides[currentSlide].component}
                </div>
                
                {/* Overlay for Exporting State */}
                {isExporting && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                        {isExportingPPT ? (
                             <Presentation className="w-16 h-16 text-pink-500 mb-4 animate-bounce" />
                        ) : (
                             <Package className="w-16 h-16 text-purple-500 mb-4 animate-bounce" />
                        )}
                        <h3 className="text-2xl font-bold mb-2">
                            {isExportingPPT ? 'Creating Presentation...' : 'Generating Bundle...'}
                        </h3>
                        <p className="text-white/60 mb-6">Capturing {slides.length} slides for you.</p>
                        
                        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ease-out ${isExportingPPT ? 'bg-pink-500' : 'bg-purple-500'}`}
                                style={{ width: `${exportProgress}%` }}
                            />
                        </div>
                        <div className="mt-2 text-xs font-mono opacity-50">{exportProgress}%</div>
                    </div>
                )}

                {/* On-Screen Navigation Arrows */}
                {!isExporting && (
                    <>
                        <button 
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            data-html2canvas-ignore="true"
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md text-white/50 hover:text-white transition-all disabled:opacity-0 hover:scale-110 z-40 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <button 
                            onClick={nextSlide}
                            disabled={currentSlide === slides.length - 1}
                            data-html2canvas-ignore="true"
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md text-white/50 hover:text-white transition-all disabled:opacity-0 hover:scale-110 z-40 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10" data-html2canvas-ignore="true">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                    />
                </div>
            </div>
         </div>

         {/* Footer Hint */}
         <div className="pb-4 text-center text-xs text-gray-600 hidden md:block">
            Use Arrow Keys <span className="px-1 border border-gray-700 rounded bg-gray-800">←</span> <span className="px-1 border border-gray-700 rounded bg-gray-800">→</span> to navigate
         </div>
      </div>
    </div>
  );
};