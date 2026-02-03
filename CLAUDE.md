# AI Calorie & Nutrition Analyzer – Objective

A mobile-first web app that lets users photograph meals and receive instant AI-generated calorie and macronutrient estimates via GPT-5.2 vision analysis. Zero friction, no auth, no database.

## Core Value Proposition

"Take a photo of your food and instantly understand what you're eating."

---

## Modules

- **API** – [Claude-api.md](Claude-api.md) – Serverless endpoint for GPT-5.2 image analysis
- **UI** – [Claude-ui.md](Claude-ui.md) – Mobile-first camera capture and results display

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Mobile Client  │────▶│  Vercel Function │────▶│   GPT-5.2   │
│  (Next.js PWA)  │◀────│    /api/analyze  │◀────│   Vision    │
└─────────────────┘     └──────────────────┘     └─────────────┘
        │
        ▼
   Image capture
   compression
   display results
```

### Request Lifecycle

1. User captures photo via camera or uploads image
2. Frontend compresses image (max 1MB, WebP/JPEG)
3. Image sent as base64 to `/api/analyze`
4. API calls GPT-5.2 with structured prompt
5. GPT-5.2 returns JSON nutrition estimate
6. Frontend renders results with confidence indicator
7. Image discarded (not stored)

---

## Global Constraints

1. **No database** – Stateless, no persistence
2. **No authentication** – Zero friction entry
3. **Mobile-first** – Touch-optimised, responsive
4. **Single API call** – One GPT-5.2 request per photo
5. **Privacy-first** – Images never stored
6. *Split logic across `.md` modules under 50 KB each*
7. *Maintain Claude memory hierarchy*

---

## Tech Stack

```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui",
  "ai": "GPT-5.2 (OpenAI API)",
  "deployment": "Vercel",
  "vcs": "GitHub"
}
```

---

## MVP Scope

### Must-Have

- [ ] Camera capture (native camera API)
- [ ] Image upload fallback
- [ ] GPT-5.2 vision analysis
- [ ] Nutrition display (calories, protein, carbs, fat)
- [ ] Detected food items list
- [ ] Confidence indicator (low/medium/high)
- [ ] "Analyze another" flow

### Explicit Non-Goals

- ❌ User accounts or authentication
- ❌ Meal history or saved results
- ❌ Daily calorie totals
- ❌ Manual editing of foods
- ❌ Fitness goals or coaching
- ❌ Wearables or integrations

---

## Definition of Success

> "Aha Moment": User takes a photo and instantly understands roughly what they ate.

**Key Metrics:**
- Time to first result: < 5 seconds
- API latency: < 3 seconds
- Mobile Lighthouse score: > 90

---

## Environment Variables

```bash
OPENAI_API_KEY=sk-...        # GPT-5.2 API key (required)
NEXT_PUBLIC_APP_URL=...      # Production URL (optional)
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Home/camera capture page
│   ├── results/
│   │   └── page.tsx         # Results display page
│   └── api/
│       └── analyze/
│           └── route.ts     # GPT-5.2 analysis endpoint
├── components/
│   ├── CameraCapture.tsx    # Camera/upload component
│   ├── NutritionCard.tsx    # Macro display card
│   ├── FoodItemList.tsx     # Detected foods list
│   └── ConfidenceIndicator.tsx
├── lib/
│   ├── openai.ts            # OpenAI client setup
│   └── prompts.ts           # GPT-5.2 system prompts
└── types/
    └── nutrition.ts         # TypeScript interfaces
```

---

## Build Order

Execute prompts in sequence:

1. `prompts/01-project-scaffold.md` – Initial Next.js setup
2. `prompts/02-api-analyze.md` – GPT-5.2 endpoint
3. `prompts/03-ui-camera.md` – Camera capture component
4. `prompts/04-ui-results.md` – Results display
5. `prompts/05-deploy.md` – Vercel deployment

---

## Validation Risks

| Risk | Mitigation |
|------|------------|
| Users overestimate accuracy | Clear confidence indicators, "estimate" language |
| Complex meals (sauces, mixed dishes) | Prompt engineering, list detected items |
| Visual ambiguity | Request multiple angles, show uncertainty |
| API latency affecting UX | Loading states, skeleton UI |
| Cost per request at scale | Usage monitoring, future rate limits |

---

## Evolution Path

### Post-Validation Additions

- User accounts (optional sign-in)
- Meal history with local storage
- Daily summaries
- Database integration (Postgres)

### Growth Stage

- Cached common meal analyses
- Correction feedback loops
- Usage-based pricing (freemium)
- Native app shell (Expo/Capacitor)

---

## References

- [Claude-api.md](Claude-api.md) – API module documentation
- [Claude-ui.md](Claude-ui.md) – UI module documentation
- [prompts/](prompts/) – Sequential build prompts
