import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WrappedData } from '../types';
import {
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Share2,
  Download,
  Package,
  Presentation,
  X,
  Check,
  Menu,
  FileDown,
  Link,
  Copy,
  CheckCircle,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import PptxGenJS from 'pptxgenjs';
import {
  IntroSlide,
  CoverSlide,
  GroupDescriptionSlide,
  OverviewSlide,
  VocabularySlide,
  ActivitySlide,
  PersonalStatsSlide,
  MomentSlide,
  TopicsSlide,
  PredictionSlide,
  BadgesSlide,
  ThankYouSlide,
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
  const [exportProgress, setExportProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Helper to chunk arrays
  const chunk = <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  // Build slides array dynamically
  const slides = useMemo(() => {
    const slideList: { component: React.ReactNode; title: string }[] = [];

    // Intro (Welcome/Teaser)
    slideList.push({ component: <IntroSlide key="intro" data={data} />, title: 'Welcome' });

    // Cover (now includes About/Group Description)
    slideList.push({ component: <CoverSlide key="cover" data={data} />, title: 'Cover' });

    // Other slides
    slideList.push({
      component: <OverviewSlide key="overview" data={data} />,
      title: 'Vibe Check',
    });
    slideList.push({ component: <VocabularySlide key="vocab" data={data} />, title: 'Vocabulary' });
    slideList.push({ component: <ActivitySlide key="activity" data={data} />, title: 'Activity' });

    // Personal Stats (chunked - max 2 per slide for mobile)
    const participants = data.analytics.participants.slice(0, 6); // Top 6 max
    const participantChunks = chunk(participants, 2);
    participantChunks.forEach((pChunk, i) => {
      slideList.push({
        component: (
          <PersonalStatsSlide key={`stats-${i}`} data={data} items={pChunk} startRank={i * 2} />
        ),
        title: i === 0 ? 'Top Chatters' : `Rankings ${i + 1}`,
      });
    });

    // Moments - 1 per slide for impact
    const moments = data.aiContent?.memorableMoments || [];
    if (moments.length > 0) {
      moments.forEach((moment, i) => {
        slideList.push({
          component: (
            <MomentSlide
              key={`moment-${i}`}
              data={data}
              items={[moment]}
              momentIndex={i}
              totalMoments={moments.length}
            />
          ),
          title: `Moment ${i + 1}`,
        });
      });
    } else {
      slideList.push({
        component: <MomentSlide key="moment-empty" data={data} />,
        title: 'Moments',
      });
    }

    // Topics (chunked)
    const topics = data.aiContent?.topics || [];
    const topicChunks = chunk(topics, 3);
    if (topicChunks.length > 0) {
      topicChunks.forEach((chunk, i) => {
        slideList.push({
          component: <TopicsSlide key={`topic-${i}`} data={data} items={chunk} />,
          title: topicChunks.length > 1 ? `Topics ${i + 1}` : 'Topics',
        });
      });
    } else {
      slideList.push({ component: <TopicsSlide key="topic-empty" data={data} />, title: 'Topics' });
    }

    // Badges (chunked)
    const badges = data.aiContent?.badges || [];
    const badgeChunks = chunk(badges, 2);
    if (badgeChunks.length > 0) {
      badgeChunks.forEach((chunk, i) => {
        slideList.push({
          component: <BadgesSlide key={`badge-${i}`} data={data} items={chunk} />,
          title: badgeChunks.length > 1 ? `Awards ${i + 1}` : 'Awards',
        });
      });
    } else {
      slideList.push({ component: <BadgesSlide key="badge-empty" data={data} />, title: 'Awards' });
    }

    // Predictions (2nd last - before Thank You)
    slideList.push({
      component: <PredictionSlide key="predictions" data={data} />,
      title: 'Predictions',
    });

    // Thank You (last)
    slideList.push({ component: <ThankYouSlide key="thanks" data={data} />, title: 'Finale' });

    return slideList;
  }, [data]);

  // Navigation
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isExportingAll || isExportingPPT) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
      if (e.key === 'Escape') setShowMenu(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isExportingAll, isExportingPPT, slides.length]);

  // Touch/Swipe navigation
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;

    // Prefer vertical swipe (like Instagram Stories)
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (isVerticalSwipe) {
      if (distanceY > minSwipeDistance) nextSlide();
      else if (distanceY < -minSwipeDistance) prevSlide();
    } else {
      if (distanceX > minSwipeDistance) nextSlide();
      else if (distanceX < -minSwipeDistance) prevSlide();
    }
  };

  // Export handlers
  const fixStylesForCapture = (doc: Document) => {
    const gradients = doc.querySelectorAll('.gradient-text, .text-transparent, .bg-clip-text');
    gradients.forEach((el) => {
      const element = el as HTMLElement;
      element.style.color = '#ffffff';
      element.style.webkitTextFillColor = '#ffffff';
      element.style.backgroundImage = 'none';
      element.style.background = 'none';
    });
  };

  const handleShare = async () => {
    if (!slideRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(slideRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => fixStylesForCapture(clonedDoc),
      });

      const image = canvas.toDataURL('image/png');

      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], `whatsapp-wrapped-2025-${currentSlide}.png`, {
          type: 'image/png',
        });
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
      console.error('Sharing failed', error);
      if (error instanceof Error && error.name === 'AbortError') return;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (isExportingAll || isExportingPPT || isCapturing) return;

    try {
      setIsExportingAll(true);
      setExportProgress(0);
      setShowMenu(false);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (!exportContainerRef.current) throw new Error('Export container not found');

      const zip = new JSZip();
      const slideElements = Array.from(exportContainerRef.current.children) as HTMLElement[];

      for (let i = 0; i < slideElements.length; i++) {
        const slideEl = slideElements[i];
        const canvas = await html2canvas(slideEl, {
          scale: 2,
          backgroundColor: '#0a0a0a',
          logging: false,
          useCORS: true,
          onclone: (clonedDoc) => fixStylesForCapture(clonedDoc),
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        );
        if (blob) {
          const fileName = `${String(i + 1).padStart(2, '0')}_${slides[i].title.replace(/\s+/g, '_')}.png`;
          zip.file(fileName, blob);
        }
        setExportProgress(Math.round(((i + 1) / slides.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'WhatsApp_Wrapped_2025.zip');
    } catch (error) {
      console.error('Export all failed', error);
      alert('Failed to export. Please try again.');
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
      setShowMenu(false);

      const pres = new PptxGenJS();
      pres.layout = 'LAYOUT_9x16'; // Vertical layout for mobile-first
      pres.title = 'WhatsApp Wrapped 2025';

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (!exportContainerRef.current) throw new Error('Export container not found');

      const slideElements = Array.from(exportContainerRef.current.children) as HTMLElement[];

      for (let i = 0; i < slideElements.length; i++) {
        const slideEl = slideElements[i];
        const canvas = await html2canvas(slideEl, {
          scale: 2,
          backgroundColor: '#0a0a0a',
          logging: false,
          useCORS: true,
          onclone: (clonedDoc) => fixStylesForCapture(clonedDoc),
        });

        const dataUrl = canvas.toDataURL('image/png');
        const slide = pres.addSlide();
        slide.background = { color: '0a0a0a' };
        slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });

        setExportProgress(Math.round(((i + 1) / slides.length) * 100));
      }

      await pres.writeFile({ fileName: 'WhatsApp_Wrapped_2025.pptx' });
    } catch (error) {
      console.error('PPT Export failed', error);
      alert('Failed to create presentation. Try downloading images instead.');
    } finally {
      setIsExportingPPT(false);
      setExportProgress(0);
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WhatsApp_Wrapped_2025_${data.analytics.groupName?.replace(/[^a-z0-9]/gi, '_') || 'data'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch (error) {
      console.error('JSON export failed', error);
      alert('Failed to export JSON.');
    }
  };

  const handleShareLink = async () => {
    if (isGeneratingLink) return;

    try {
      setIsGeneratingLink(true);
      setLinkCopied(false);

      const response = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save report');
      }

      const result = await response.json();
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/r/${result.id}`;

      setShareLink(link);

      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      } catch {
        // Clipboard failed, user can still copy manually
      }
    } catch (error) {
      console.error('Share link failed:', error);
      alert(
        'Failed to generate share link. Make sure the app is deployed on Vercel with KV configured.'
      );
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      alert('Failed to copy. Please copy manually: ' + shareLink);
    }
  };

  const isExporting = isExportingAll || isExportingPPT;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Hidden Export Container */}
      {isExporting && (
        <div className="fixed top-0 left-0 w-screen h-0 overflow-hidden" style={{ zIndex: -1 }}>
          <div ref={exportContainerRef} style={{ width: '540px' }}>
            {slides.map((slide, idx) => (
              <div
                key={idx}
                style={{ width: '540px', height: '960px' }}
                className="relative overflow-hidden"
              >
                {slide.component}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story Progress Indicators */}
      <div className="absolute top-0 left-0 right-0 z-50 safe-top px-3 pt-3">
        <div className="flex gap-[3px] w-full">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className="flex-1 min-w-0 h-1 rounded-full overflow-hidden bg-white/20"
              style={{ minHeight: '4px', padding: 0 }}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  idx < currentSlide
                    ? 'bg-white'
                    : idx === currentSlide
                      ? 'bg-white'
                      : 'bg-transparent'
                }`}
                style={{ width: idx <= currentSlide ? '100%' : '0%' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-12 left-0 right-0 z-50 px-4 flex justify-between items-center safe-top">
        {/* Back/Reset */}
        <button
          onClick={onReset}
          disabled={isExporting}
          className="touch-btn glass-dark rounded-full p-2 text-white/70 hover:text-white disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting}
          className="touch-btn glass-dark rounded-full p-2 text-white/70 hover:text-white disabled:opacity-50"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Slide Content */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full h-full"
      >
        <div ref={slideRef} className="w-full h-full">
          {slides[currentSlide].component}
        </div>
      </div>

      {/* Navigation Arrows (Desktop) */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-50 gap-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0 || isExporting}
          className="touch-btn glass rounded-full p-3 text-white/60 hover:text-white disabled:opacity-20 transition-all hover:scale-110"
        >
          <ChevronUp size={24} />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1 || isExporting}
          className="touch-btn glass rounded-full p-3 text-white/60 hover:text-white disabled:opacity-20 transition-all hover:scale-110"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Swipe Hint (Mobile) */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-40 text-white/30 text-xs flex items-center gap-2 animate-pulse">
        <ChevronUp size={14} />
        <span>Swipe to navigate</span>
        <ChevronDown size={14} />
      </div>

      {/* Menu Overlay */}
      {showMenu && (
        <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
          <button
            onClick={() => setShowMenu(false)}
            className="absolute top-4 right-4 touch-btn text-white/60 hover:text-white safe-top"
          >
            <X size={24} />
          </button>

          <div className="space-y-4 w-full max-w-xs px-6">
            {/* Share Report Link - NEW */}
            {!shareLink ? (
              <button
                onClick={handleShareLink}
                disabled={isGeneratingLink}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 flex items-center gap-4 text-left hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Link size={20} />
                <div className="flex-1">
                  <div className="font-bold">
                    {isGeneratingLink ? 'Generating Link...' : 'Share Report Link'}
                  </div>
                  <div className="text-xs text-white/70">
                    {isGeneratingLink ? 'Please wait' : 'Create shareable link for full report'}
                  </div>
                </div>
                {isGeneratingLink && (
                  <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                )}
              </button>
            ) : (
              <div className="w-full glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={20} />
                  <span className="font-bold">Link Ready!</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none"
                  />
                  <button
                    onClick={copyShareLink}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    {linkCopied ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
                <div className="text-xs text-white/50">
                  {linkCopied ? '✓ Copied to clipboard!' : 'Link expires in 30 days'}
                </div>
              </div>
            )}

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-white/10 transition-colors"
            >
              <FileDown size={20} />
              <div>
                <div className="font-bold">Export Data (JSON)</div>
                <div className="text-xs text-white/50">Save to reload later</div>
              </div>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-white/10 transition-colors text-red-400"
            >
              <RefreshCw size={20} />
              <div>
                <div className="font-bold">Start Over</div>
                <div className="text-xs text-white/50">Upload a different chat</div>
              </div>
            </button>
          </div>

          {/* Slide Navigation */}
          <div className="mt-8 w-full max-w-xs px-6">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">
              Jump to Slide
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    goToSlide(idx);
                    setShowMenu(false);
                  }}
                  className={`p-2 rounded-lg text-xs text-center transition-colors ${
                    idx === currentSlide
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Progress Overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-16 h-16 mb-6">
            {isExportingPPT ? (
              <Presentation className="w-full h-full text-pink-500 animate-pulse" />
            ) : (
              <Package className="w-full h-full text-purple-500 animate-pulse" />
            )}
          </div>

          <h3 className="text-2xl font-bold mb-2">
            {isExportingPPT ? 'Creating Presentation...' : 'Generating Bundle...'}
          </h3>
          <p className="text-white/60 mb-6">Capturing {slides.length} slides</p>

          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isExportingPPT ? 'bg-pink-500' : 'bg-purple-500'}`}
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-white/40 font-mono">{exportProgress}%</div>
        </div>
      )}
    </div>
  );
};
