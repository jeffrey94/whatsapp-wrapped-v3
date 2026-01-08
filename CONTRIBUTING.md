# Contributing to WhatsApp Wrapped

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20.x or later
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/whatsapp-wrapped-v3.git
   cd whatsapp-wrapped-v3
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment:
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY to .env.local
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test your changes:
   - Ensure `npm run build` passes
   - Test with different WhatsApp export formats

4. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. Push and open a Pull Request

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `chore:` Maintenance tasks

## Code Style

- Use TypeScript for all new code
- Define interfaces in `types.ts`
- Use functional React components with hooks
- Keep components focused and small

## Reporting Bugs

When reporting bugs, include:

- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Sample chat export (anonymized) if relevant

## Questions?

Open an issue with the "question" label.

---

Thank you for contributing!
