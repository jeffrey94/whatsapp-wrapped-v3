import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertTriangle, X, Shield } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (isLoading) return;
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.txt')) {
        setShowDisclaimer(false);
        onFileUpload(file);
      } else {
        alert("Please upload a .txt file");
      }
    },
    [onFileUpload, isLoading]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const file = e.target.files?.[0];
    if (file) {
      setShowDisclaimer(false);
      onFileUpload(file);
    }
  };

  return (
    <>
      <div className="w-full p-6">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-2xl p-8 text-center transition-all duration-300 border-2 border-dashed
            ${isLoading
              ? 'border-white/10 bg-white/5 opacity-50 cursor-wait'
              : isDragOver
                ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }
          `}
        >
          {/* Icon */}
          <div className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 transition-all
            ${isDragOver
              ? 'bg-purple-500 scale-110'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }
          `}>
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-7 h-7 text-white" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-bold">
              {isLoading ? 'Analyzing Chat...' : isDragOver ? 'Drop it here!' : 'Upload WhatsApp Chat'}
            </h3>
            <p className="text-sm text-white/50">
              Export chat (without media) and upload the .txt file
            </p>
          </div>

          {/* Button */}
          {!isLoading && (
            <button
              onClick={() => setShowDisclaimer(true)}
              className="
                w-full py-4 px-6 bg-white text-black font-bold rounded-xl
                transition-all duration-200 active:scale-95
                hover:bg-white/90 hover:shadow-lg hover:shadow-white/10
                touch-btn
              "
            >
              Select text file
            </button>
          )}
        </div>

        {/* How to export hint */}
        <div className="mt-4 text-center">
          <details className="group">
            <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60 transition-colors">
              How to export WhatsApp chat?
            </summary>
            <div className="mt-3 text-xs text-white/50 text-left bg-white/5 rounded-xl p-4 space-y-2">
              <p><strong>iOS:</strong> Open chat → Tap group name → Export Chat → Without Media</p>
              <p><strong>Android:</strong> Open chat → Menu (⋮) → More → Export Chat → Without Media</p>
            </div>
          </details>
        </div>
      </div>

      {/* Disclaimer Modal - Compact Popup */}
      {showDisclaimer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6"
          onClick={() => setShowDisclaimer(false)}
        >
          <div
            className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-black rounded-3xl p-5 border border-white/10 shadow-2xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X */}
            <button
              onClick={() => setShowDisclaimer(false)}
              className="absolute top-3 right-3 text-white/30 hover:text-white/60 p-1"
            >
              <X size={18} />
            </button>

            {/* Compact Content */}
            <div className="text-center space-y-4">
              {/* Icon + Title inline */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold">Hold up, friend!</h3>
              </div>

              {/* Warning text - compact */}
              <div className="text-xs text-white/60 leading-relaxed text-left space-y-2 bg-white/5 rounded-xl p-3">
                <p>
                  Your chat goes to <strong className="text-purple-300">Google's Gemini AI</strong> for analysis. I don't see or store anything.
                </p>
                <p className="text-white/40 italic">
                  By continuing, your roast sessions join the great AI training dataset in the sky 🙏
                </p>
              </div>

              {/* Actions - compact */}
              <div className="space-y-2">
                <label className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl cursor-pointer active:scale-95 transition-transform">
                  I surrender to Google 🙇
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={handleChange}
                  />
                </label>

                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="w-full py-2 text-xs text-white/40 hover:text-white/60"
                >
                  Never mind, I have trust issues
                </button>
              </div>

              {/* Privacy note */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/25">
                <Shield size={10} />
                <span>Processed, not stored</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};