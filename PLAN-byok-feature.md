# Implementation Plan: Bring Your Own Key (BYOK) Feature

## Overview

Allow users to provide their own Gemini API key through the UI, stored securely in browser localStorage. This enables:
- Public deployments without exposing your API key
- Users to try the app without deploying their own instance
- Zero server-side key storage (privacy-first)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                         │
├─────────────────────────────────────────────────────────────┤
│  localStorage                                               │
│  └── gemini_api_key: "user's key" (encrypted optional)     │
│                                                             │
│  geminiService.ts                                           │
│  └── getApiKey():                                          │
│      1. Check localStorage for user key                     │
│      2. Fallback to import.meta.env.VITE_GEMINI_API_KEY    │
│      3. Return null if neither exists                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Gemini API (Google)   │
              │   Direct browser call   │
              └─────────────────────────┘
```

## Implementation Steps

### Step 1: Create API Key Manager Utility

**File:** `src/utils/apiKeyManager.ts`

```typescript
const STORAGE_KEY = 'gemini_api_key';

export const apiKeyManager = {
  get: (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
  },

  set: (key: string): void => {
    localStorage.setItem(STORAGE_KEY, key);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  exists: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
  }
};
```

### Step 2: Update Gemini Service

**File:** `src/services/geminiService.ts`

Modify to check localStorage first:

```typescript
function getApiKey(): string | null {
  // Priority 1: User-provided key from localStorage
  const userKey = apiKeyManager.get();
  if (userKey) return userKey;

  // Priority 2: Environment variable (for self-hosted)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) return envKey;

  return null;
}
```

### Step 3: Create API Key Input Component

**File:** `src/components/ApiKeyInput.tsx`

Features:
- Text input with show/hide toggle (password field)
- "Get API Key" link to Google AI Studio
- Save/Clear buttons
- Status indicator (key saved ✓ / no key)

### Step 4: Update FileUpload Component

**File:** `src/components/FileUpload.tsx`

Add API key prompt before file upload if no key is configured:
- Show ApiKeyInput component
- Only show file upload after key is provided
- Option to skip if env key exists

### Step 5: Add Visual Feedback

- Show "Using your API key" or "Using default key" indicator
- Toast/notification when key is saved
- Warning if no key available

## UI/UX Design

### Option A: Inline on Upload Page (Recommended)

```
┌─────────────────────────────────────┐
│         WhatsApp Wrapped            │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔑 Gemini API Key             │  │
│  │ ┌─────────────────────┐ 👁️   │  │
│  │ │ ••••••••••••••••••• │      │  │
│  │ └─────────────────────┘      │  │
│  │ [Get free key] [Save] [Clear]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     📤 Drop your chat here    │  │
│  │     or click to upload        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Option B: Settings Modal

Accessible via gear icon, keeps upload page clean.

## Security Considerations

1. **localStorage only** - Key never sent to any server
2. **Direct API calls** - Browser → Google API directly
3. **No logging** - Never console.log the key
4. **Clear on demand** - User can remove key anytime
5. **Optional encryption** - Could encrypt with a user passphrase (overkill for this use case)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/utils/apiKeyManager.ts` | Create | localStorage wrapper |
| `src/components/ApiKeyInput.tsx` | Create | Key input UI component |
| `src/services/geminiService.ts` | Modify | Use apiKeyManager |
| `src/components/FileUpload.tsx` | Modify | Add key input section |
| `src/App.tsx` | Modify | Pass key status if needed |

## Testing Checklist

- [ ] Key saves to localStorage correctly
- [ ] Key persists across page refreshes
- [ ] Clear button removes key
- [ ] App works with user-provided key
- [ ] App falls back to env key if no user key
- [ ] App shows error if no key available
- [ ] Key is not visible in network requests (except to Google)
- [ ] Show/hide toggle works

## Future Enhancements (Optional)

- [ ] Validate key format before saving
- [ ] Test key with a simple API call before accepting
- [ ] Support multiple keys (rotate on rate limit)
- [ ] Usage tracking (show estimated cost)
