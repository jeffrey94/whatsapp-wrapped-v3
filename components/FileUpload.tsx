import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isLoading) return;
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.txt')) {
        onFileUpload(file);
      } else {
        alert("Please upload a .txt file");
      }
    },
    [onFileUpload, isLoading]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isLoading 
            ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-wait' 
            : 'border-purple-500/50 bg-gray-900/50 hover:border-purple-400 hover:bg-gray-800/80 cursor-pointer'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            {isLoading ? (
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
               <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white font-display">
              {isLoading ? 'Analyzing Chat...' : 'Upload WhatsApp Chat'}
            </h3>
            <p className="text-gray-400 text-sm">
              Export chat (without media) and drop the .txt file here
            </p>
          </div>

          {!isLoading && (
            <>
              <label className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                Select File
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
              
              <div className="mt-4 p-3 bg-gray-800 rounded-lg flex items-start gap-2 text-xs text-gray-400 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-purple-400" />
                <span>
                  Disclaimer: You are officially surrendering your chat history to the Gemini overlords (Google). Whether or not the FBI comes after you for your unhinged takes is not my call. I access nothing, I know nothing. Good luck.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};