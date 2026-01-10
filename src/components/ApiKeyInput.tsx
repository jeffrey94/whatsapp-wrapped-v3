import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ExternalLink, Check, Trash2 } from 'lucide-react';
import { apiKeyManager } from '../utils/apiKeyManager';

interface ApiKeyInputProps {
  onKeyChange?: (hasKey: boolean) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    const existingKey = apiKeyManager.get();
    if (existingKey) {
      setApiKey(existingKey);
      setHasExistingKey(true);
      setSaved(true);
      onKeyChange?.(true);
    }
  }, [onKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      apiKeyManager.set(apiKey.trim());
      setSaved(true);
      setHasExistingKey(true);
      onKeyChange?.(true);
    }
  };

  const handleClear = () => {
    apiKeyManager.clear();
    setApiKey('');
    setSaved(false);
    setHasExistingKey(false);
    onKeyChange?.(false);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    if (saved) {
      setSaved(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Key size={18} className="text-purple-400" />
          <span className="text-sm font-medium text-white/90">Gemini API Key</span>
          {saved && hasExistingKey && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
              <Check size={14} />
              Saved
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={handleKeyChange}
              placeholder="Paste your API key here"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!saved || apiKey !== apiKeyManager.get() ? (
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/30 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
              title="Clear API key"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Get free API key
            <ExternalLink size={12} />
          </a>
          <span className="text-xs text-white/30">Stored locally in your browser</span>
        </div>
      </div>
    </div>
  );
};
