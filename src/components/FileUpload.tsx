import React, { useCallback, useState, useRef } from 'react';
import { Upload, AlertTriangle, X, Shield, Mail, Lock, Sparkles } from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import { hasApiKey } from '../services/geminiService';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

// Password gate: Set VITE_ACCESS_PASSWORD env var to enable, leave empty to disable
const ACCESS_PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD || '';
const PASSWORD_GATE_ENABLED = ACCESS_PASSWORD.length > 0;

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [hasKey, setHasKey] = useState(hasApiKey());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApiKeyChange = (keyExists: boolean) => {
    setHasKey(keyExists);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (isLoading) return;
      if (!hasApiKey()) {
        alert('Please add your Gemini API key first');
        return;
      }
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.txt')) {
        resetModals();
        onFileUpload(file);
      } else {
        alert('Please upload a .txt file');
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
      resetModals();
      onFileUpload(file);
    }
  };

  const resetModals = () => {
    setShowDisclaimer(false);
    setShowWaitlist(false);
    setShowPasswordInput(false);
    setPassword('');
    setPasswordError(false);
  };

  const handleSurrenderClick = () => {
    setShowDisclaimer(false);
    if (PASSWORD_GATE_ENABLED) {
      // Show waitlist/password gate
      setShowWaitlist(true);
    } else {
      // No password gate - directly trigger file picker
      fileInputRef.current?.click();
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;

    setEmailSubmitting(true);
    try {
      await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setEmailSubmitted(true);
    } catch (error) {
      console.error('Failed to submit email:', error);
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === ACCESS_PASSWORD) {
      setPasswordError(false);
      // Trigger file picker immediately
      fileInputRef.current?.click();
    } else {
      setPasswordError(true);
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <>
      {/* Hidden file input for password bypass */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleChange}
      />

      <div className="w-full p-6">
        {/* API Key Input */}
        <ApiKeyInput onKeyChange={handleApiKeyChange} />

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-2xl p-8 text-center transition-all duration-300 border-2 border-dashed
            ${
              isLoading
                ? 'border-white/10 bg-white/5 opacity-50 cursor-wait'
                : isDragOver
                  ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }
          `}
        >
          {/* Icon */}
          <div
            className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 transition-all
            ${
              isDragOver
                ? 'bg-purple-500 scale-110'
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }
          `}
          >
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-7 h-7 text-white" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-bold">
              {isLoading
                ? 'Analyzing Chat...'
                : isDragOver
                  ? 'Drop it here!'
                  : 'Upload WhatsApp Chat'}
            </h3>
            <p className="text-sm text-white/50">
              Export chat (without media) and upload the .txt file
            </p>
          </div>

          {/* Button */}
          {!isLoading && (
            <>
              {!hasKey && (
                <p className="text-sm text-amber-400 mb-3">
                  Please add your Gemini API key above to continue
                </p>
              )}
              <button
                onClick={() => setShowDisclaimer(true)}
                disabled={!hasKey}
                className={`
                  w-full py-4 px-6 font-bold rounded-xl
                  transition-all duration-200 active:scale-95
                  touch-btn
                  ${
                    hasKey
                      ? 'bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/10'
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                  }
                `}
              >
                Select text file
              </button>
            </>
          )}
        </div>

        {/* How to export hint */}
        <div className="mt-4 text-center">
          <details className="group">
            <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60 transition-colors">
              How to export WhatsApp chat?
            </summary>
            <div className="mt-3 text-xs text-white/50 text-left bg-white/5 rounded-xl p-4 space-y-2">
              <p>
                <strong>iOS:</strong> Open chat → Tap group name → Export Chat → Without Media
              </p>
              <p>
                <strong>Android:</strong> Open chat → Menu (⋮) → More → Export Chat → Without Media
              </p>
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
                  Your chat goes to <strong className="text-purple-300">Google's Gemini AI</strong>{' '}
                  for analysis. I don't see or store anything.
                </p>
                <p className="text-white/40 italic">
                  By continuing, your roast sessions join the great AI training dataset in the sky
                  🙏
                </p>
              </div>

              {/* Actions - compact */}
              <div className="space-y-2">
                <button
                  onClick={handleSurrenderClick}
                  className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl cursor-pointer active:scale-95 transition-transform"
                >
                  I surrender to Google 🙇
                </button>

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

      {/* Waitlist Modal */}
      {showWaitlist && !showPasswordInput && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6"
          onClick={() => resetModals()}
        >
          <div
            className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-black rounded-3xl p-5 border border-white/10 shadow-2xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X */}
            <button
              onClick={() => resetModals()}
              className="absolute top-3 right-3 text-white/30 hover:text-white/60 p-1"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-4">
              {/* Icon + Title */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold">Coming Soon!</h3>
              </div>

              {/* Message */}
              <div className="text-sm text-white/60 leading-relaxed">
                <p>This feature isn't open to the public yet.</p>
                <p className="text-white/40 mt-1">Drop your email to join the waitlist!</p>
              </div>

              {/* Email Input */}
              {!emailSubmitted ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleEmailSubmit}
                    disabled={emailSubmitting || !email.trim()}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {emailSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </div>
              ) : (
                <div className="py-3 px-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-400 text-sm">✓ You're on the list!</p>
                </div>
              )}

              {/* Secret Access Link - subtle */}
              <p className="text-xs text-white/40">
                Already have access?{' '}
                <button
                  onClick={() => setShowPasswordInput(true)}
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  Enter password
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Password Input Modal */}
      {showPasswordInput && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6"
          onClick={() => resetModals()}
        >
          <div
            className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-black rounded-3xl p-5 border border-white/10 shadow-2xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X */}
            <button
              onClick={() => resetModals()}
              className="absolute top-3 right-3 text-white/30 hover:text-white/60 p-1"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-4">
              {/* Icon + Title */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold">Secret Access</h3>
              </div>

              {/* Message */}
              <p className="text-sm text-white/60">
                Enter the magic password to unlock early access 🔮
              </p>

              {/* Password Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(false);
                    }}
                    onKeyDown={handlePasswordKeyDown}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 text-sm focus:outline-none transition-colors ${
                      passwordError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-white/10 focus:border-purple-500'
                    }`}
                  />
                </div>

                {passwordError && (
                  <p className="text-red-400 text-xs">Hmm, that's not it. Try again!</p>
                )}

                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unlock Access 🚀
                </button>
              </div>

              {/* Back button */}
              <button
                onClick={() => setShowPasswordInput(false)}
                className="text-xs text-white/40 hover:text-white/60"
              >
                ← Back to waitlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
