# AI Calorie & Nutrition Analyzer

A mobile-first web app that uses GPT-4 Vision to instantly analyze meal photos and provide calorie and macronutrient estimates.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 📸 **Camera Capture** - Native camera integration with live preview
- 🤖 **AI Analysis** - GPT-4 Vision for accurate nutrition estimation
- 📊 **Macro Breakdown** - Protein, carbs, fat, and fiber tracking
- 🎯 **Confidence Indicator** - Transparency about estimate accuracy
- 📱 **PWA Support** - Installable on mobile devices
- 🔒 **Privacy First** - No database, images never stored
- ⚡ **Zero Friction** - No authentication required

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **AI:** OpenAI GPT-4 Vision API
- **Validation:** Zod
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key with GPT-4 Vision access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/calorie-analyzer.git
   cd calorie-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenAI API key to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Usage

1. **Grant Camera Permission** - Allow camera access when prompted
2. **Capture Photo** - Point camera at your meal and capture
3. **Wait for Analysis** - AI processes the image (2-3 seconds)
4. **View Results** - See calories, macros, and detected foods
5. **Analyze Another** - Repeat for additional meals

### Alternative: Upload Photos

If camera access isn't available, use the upload button to select photos from your device.

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts    # GPT-4 Vision endpoint
│   ├── page.tsx                # Home/camera page
│   ├── results/page.tsx        # Results display
│   ├── layout.tsx              # Root layout with PWA meta
│   ├── error.tsx               # Error boundary
│   └── sitemap.ts              # Dynamic sitemap
├── components/
│   ├── CameraCapture.tsx       # Camera component
│   ├── AnalyzingState.tsx      # Loading state
│   ├── NutritionCard.tsx       # Macro display
│   ├── FoodItemList.tsx        # Detected foods
│   ├── ConfidenceIndicator.tsx # Confidence display
│   └── ui/                     # shadcn components
├── lib/
│   ├── openai.ts               # OpenAI client
│   ├── prompts.ts              # AI prompts
│   ├── image-utils.ts          # Image compression
│   └── utils.ts                # Utility functions
└── types/
    └── nutrition.ts            # Type definitions & Zod schemas
```

## API Reference

### POST /api/analyze

Analyzes a meal image and returns nutritional estimates.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCalories": 485,
    "macros": {
      "protein": 32,
      "carbohydrates": 45,
      "fat": 18,
      "fiber": 8
    },
    "foodItems": [
      {
        "name": "Grilled chicken breast",
        "estimatedPortion": "150g",
        "calories": 250
      }
    ],
    "confidence": "high",
    "notes": "Clear image with visible portions"
  }
}
```

**Error Codes:**
- `INVALID_REQUEST` (400) - Malformed request
- `IMAGE_TOO_LARGE` (400) - Image exceeds 4MB
- `TIMEOUT` (504) - Request took longer than 30s
- `AI_ERROR` (500) - OpenAI API failure
- `PARSE_ERROR` (500) - Failed to parse AI response

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key with GPT-4 Vision access |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL for SEO (production) |

### Vercel Configuration

The `vercel.json` file includes:
- 30-second timeout for `/api/analyze`
- Security headers (XSS, frame, content-type protection)
- No-cache headers for API routes

## Development

### Running Tests

```bash
npm run lint        # ESLint checks
npm run build       # Production build test
```

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prettier (recommended)

### Adding Components

Use shadcn/ui CLI to add components:
```bash
npx shadcn@latest add [component-name]
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

## Cost Considerations

### OpenAI API Costs

- **Per request:** ~$0.02-0.05
- **100 analyses/day:** ~$90/month
- **500 analyses/day:** ~$450/month

**Recommendation:** Set usage limits in OpenAI dashboard to control costs.

### Vercel Costs

- **Free tier:** 100GB bandwidth, sufficient for MVP
- **Pro tier ($20/month):** Recommended for production

## Limitations & Considerations

### AI Accuracy

- Estimates are **approximate**, not medical-grade
- Accuracy depends on image quality and food visibility
- Mixed/complex dishes may have lower confidence
- Users should verify against known values when possible

### Privacy

- Images are **never stored** on servers
- All processing happens in real-time
- No user accounts or tracking (by design)
- sessionStorage used for temporary results (client-side only)

### Technical Limitations

- Maximum image size: 4MB
- API timeout: 30 seconds
- Camera requires HTTPS (automatic on Vercel)
- Browser compatibility: Modern browsers only

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers with camera API support

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [OpenAI GPT-4 Vision](https://openai.com/)
- Icons from [Lucide](https://lucide.dev/)

## Support

For issues or questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for troubleshooting

## Roadmap

### Post-MVP Features

- [ ] User accounts (optional)
- [ ] Meal history with local storage
- [ ] Daily calorie summaries
- [ ] Manual food editing
- [ ] Meal sharing
- [ ] Offline PWA support
- [ ] Voice input for portions
- [ ] Barcode scanning
- [ ] Recipe suggestions

---

**Made with ❤️ using Next.js and OpenAI**
