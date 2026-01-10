# WhatsApp Wrapped

**Generate a "Spotify Wrapped" style year-in-review for your WhatsApp group chats**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## Features

- **Chat Analytics** - Message counts, activity heatmaps, word frequencies, and interaction patterns
- **AI-Powered Insights** - Personality badges, memorable moments, topic analysis, and predictions using Google Gemini
- **Beautiful Slides** - Instagram-story style presentation of your chat's year in review
- **Interactive Elements** - Scratch-off prediction cards and carousel navigation
- **Export Options** - Download as images, ZIP archive, or PowerPoint presentation
- **Shareable Links** - Generate links to share your wrapped with friends (30-day expiry)
- **Privacy First** - All processing happens in your browser; chat data is never stored on servers

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20.x or later
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/jeffrey94/whatsapp-wrapped-v3.git
cd whatsapp-wrapped-v3

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Exporting Your WhatsApp Chat

1. Open the WhatsApp group chat you want to analyze
2. Tap the group name → **More** → **Export chat**
3. Choose **Without media** (recommended for faster processing)
4. Save or share the `.txt` file
5. Upload it to WhatsApp Wrapped

## Project Structure

```
whatsapp-wrapped-v3/
├── App.tsx                 # Main application component
├── types.ts                # TypeScript interfaces
├── components/
│   ├── FileUpload.tsx      # Chat file upload handler
│   ├── WrappedView.tsx     # Main results view
│   ├── Slides.tsx          # Slide components
│   └── ScratchReveal.tsx   # Interactive scratch cards
├── services/
│   ├── chatParser.ts       # WhatsApp export parser
│   ├── analytics.ts        # Chat statistics calculator
│   └── geminiService.ts    # AI insights generator
└── api/                    # Vercel serverless functions
    ├── get-report.ts       # Retrieve shared reports
    └── save-report.ts      # Save reports for sharing
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `KV_URL` | No | Vercel KV URL (for sharing feature) |
| `KV_REST_API_URL` | No | Vercel KV REST URL |
| `KV_REST_API_TOKEN` | No | Vercel KV token |

See [.env.example](.env.example) for detailed setup instructions.

## Deployment

### Vercel (Recommended)

1. Fork this repository
2. Import it in [Vercel](https://vercel.com/new)
3. Add your `GEMINI_API_KEY` in the Environment Variables section
4. Deploy!

### Self-Hosted

```bash
npm run build
```

The output in `dist/` can be served by any static file server. Note that the sharing feature requires Vercel KV.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: Google Gemini API
- **Export**: html2canvas, JSZip, PptxGenJS

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## Security

For security concerns, please see our [Security Policy](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with love for group chat memories
</div>
