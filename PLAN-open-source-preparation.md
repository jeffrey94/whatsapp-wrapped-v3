# Open Source Preparation Plan

## Project Overview

**WhatsApp Wrapped v3** - A React/TypeScript web app that analyzes WhatsApp chat exports and generates "Spotify Wrapped" style insights using Google Gemini AI.

**Current State:**
- ✅ Clean code structure (React 19 + TypeScript + Vite)
- ✅ Well-organized components and services
- ❌ Missing license
- ❌ Minimal documentation
- ❌ Hardcoded secrets in frontend
- ❌ No testing infrastructure
- ❌ No linting/formatting configuration
- ❌ No CI/CD pipeline

---

## Phase 1: Critical Security Fixes

### 1.1 Remove Hardcoded Password
**File:** `components/FileUpload.tsx:9`
```typescript
// CURRENT (INSECURE):
const CORRECT_PASSWORD = 'WAWRAPPED20251234';
```

**Options:**
- **Option A**: Remove password gate entirely (recommended for open source)
- **Option B**: Move to environment variable `VITE_ACCESS_PASSWORD`
- **Option C**: Implement proper server-side authentication

**Recommendation:** Option A - Remove password gate for open source version. Users can add their own auth if needed.

### 1.2 API Key Handling Review
**Current:** `VITE_GEMINI_API_KEY` exposed to frontend via Vite

**Issue:** API keys prefixed with `VITE_` are bundled into client-side code and visible in browser.

**Options:**
- **Option A**: Keep as-is with clear documentation (users provide their own key)
- **Option B**: Move Gemini calls to serverless API routes (more secure)

**Recommendation:** Option A for simplicity, with clear documentation that users need their own API key.

---

## Phase 2: Add Required Open Source Files

### 2.1 Add LICENSE File
**Options:**
- **MIT License**: Permissive, allows commercial use, most common for JS projects
- **Apache 2.0**: Similar to MIT with patent grant
- **GPL 3.0**: Copyleft, derivative works must also be open source

**Recommendation:** MIT License - maximizes adoption and contribution.

### 2.2 Add CONTRIBUTING.md
Contents:
- How to set up development environment
- Code style guidelines
- Pull request process
- Issue reporting guidelines
- Testing requirements

### 2.3 Add CODE_OF_CONDUCT.md
Use Contributor Covenant (industry standard).

### 2.4 Add SECURITY.md
- How to report security vulnerabilities
- Security considerations for deployment
- API key handling best practices

### 2.5 Add CHANGELOG.md
- Document version history
- Use Keep a Changelog format

---

## Phase 3: Documentation Improvements

### 3.1 Enhance README.md
Expand from current 21 lines to include:

1. **Header with badges** (License, Node version, deployment status)
2. **Feature overview** with screenshots/GIFs
3. **Prerequisites** (Node 20.x, npm, Gemini API key)
4. **Quick start guide**
5. **Environment variables table**
6. **Project structure overview**
7. **How it works** (architecture diagram)
8. **Deployment guide** (Vercel, self-hosted)
9. **Contributing section** (link to CONTRIBUTING.md)
10. **License section**
11. **Acknowledgments**

### 3.2 Add .env.example
Create template with all required environment variables:
```
# Required: Get your API key from https://aistudio.google.com/
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: For Vercel KV (report sharing feature)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### 3.3 Add Architecture Documentation
Create `docs/ARCHITECTURE.md` explaining:
- Frontend component hierarchy
- Service layer design
- API routes
- Data flow diagram

---

## Phase 4: Code Quality Infrastructure

### 4.1 Add ESLint Configuration
Install and configure:
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks
```

Create `.eslintrc.cjs` with React + TypeScript rules.

### 4.2 Add Prettier Configuration
Install and configure:
```bash
npm install -D prettier eslint-config-prettier
```

Create `.prettierrc` with consistent formatting rules.

### 4.3 Add Pre-commit Hooks (Optional)
Install husky + lint-staged for automated quality checks on commit.

### 4.4 Add npm Scripts
```json
{
  "lint": "eslint . --ext .ts,.tsx",
  "lint:fix": "eslint . --ext .ts,.tsx --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

---

## Phase 5: GitHub Repository Enhancements

### 5.1 Add Issue Templates
Create `.github/ISSUE_TEMPLATE/`:
- `bug_report.md` - Bug report template
- `feature_request.md` - Feature request template

### 5.2 Add Pull Request Template
Create `.github/PULL_REQUEST_TEMPLATE.md`

### 5.3 Add CI/CD Pipeline
Create `.github/workflows/ci.yml`:
- Run on pull requests
- Type checking (`tsc --noEmit`)
- Linting (`npm run lint`)
- Build verification (`npm run build`)

---

## Phase 6: Final Cleanup

### 6.1 Remove Development Artifacts
- Delete `requirements.md` (internal requirements doc)
- Delete `metadata.json` (AI Studio specific)
- Clean up any debug code or console.logs

### 6.2 Review .gitignore
Ensure comprehensive coverage for:
- Environment files
- Build outputs
- IDE configurations
- OS-specific files
- Test coverage reports

### 6.3 Update package.json
- Add proper `description`
- Add `keywords` for discoverability
- Add `repository` URL
- Add `bugs` URL
- Add `homepage` URL
- Verify `license` field matches LICENSE file

---

## Implementation Checklist

### Critical (Must Have)
- [ ] Remove or externalize hardcoded password
- [ ] Add LICENSE file (MIT)
- [ ] Add .env.example
- [ ] Enhance README.md significantly
- [ ] Add CONTRIBUTING.md
- [ ] Update package.json metadata

### Important (Should Have)
- [ ] Add CODE_OF_CONDUCT.md
- [ ] Add SECURITY.md
- [ ] Add ESLint configuration
- [ ] Add Prettier configuration
- [ ] Add GitHub issue templates
- [ ] Add PR template

### Nice to Have
- [ ] Add CHANGELOG.md
- [ ] Add CI/CD workflow
- [ ] Add architecture documentation
- [ ] Add pre-commit hooks
- [ ] Add test framework setup

---

## Estimated Scope

| Phase | Files Created/Modified |
|-------|----------------------|
| Phase 1 | 1 file modified |
| Phase 2 | 4-5 new files |
| Phase 3 | 2-3 files modified/created |
| Phase 4 | 3-4 config files |
| Phase 5 | 4-5 GitHub config files |
| Phase 6 | 2-3 files modified/deleted |

**Total:** ~15-20 files to create or modify

---

## Questions to Resolve

1. **License Choice**: Confirm MIT license is acceptable?
2. **Password Gate**: Remove entirely or make configurable?
3. **Vercel KV**: Should sharing feature require users to set up their own Vercel KV, or make it optional?
4. **Requirements.md**: Delete or keep as design documentation?
5. **Gemini Model**: Document which models are supported/required?
