# Prompt 05: Vercel Deployment

## 🧠 CONTEXT

Reference: `CLAUDE.md` → Deployment

This prompt configures the application for production deployment on Vercel with proper environment variables, build settings, and PWA support.

**Prerequisites:** Prompts 01-04 completed.

---

## 📋 TASK

Generate deployment configuration that:

1. Configures Vercel project settings
2. Sets up environment variables securely
3. Adds PWA manifest and icons
4. Configures meta tags for mobile
5. Adds basic analytics/monitoring hooks
6. Creates GitHub Actions for CI (optional)

---

## ⚠️ CONSTRAINTS

1. **Must** configure `vercel.json` with function settings
2. **Must** set API route timeout to 30 seconds
3. **Must** create `public/manifest.json` for PWA
4. **Must** add appropriate meta tags in layout
5. **Must** configure CORS for API if needed
6. **Must** document required environment variables
7. *Should* add basic error boundary
8. *Should* configure caching headers
9. *Should* add robots.txt and sitemap

---

## 📝 OUTPUT FORMAT

### File: `vercel.json`

Vercel configuration:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "functions": {
    "src/app/api/analyze/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### File: `public/manifest.json`

PWA manifest:

```json
{
  "name": "AI Calorie Analyzer",
  "short_name": "CalorieAI",
  "description": "Instantly analyze meal nutrition with AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### File: `src/app/layout.tsx`

Updated layout with meta tags:

```typescript
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Calorie Analyzer",
  description: "Take a photo of your meal and instantly get nutrition estimates",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CalorieAI",
  },
  openGraph: {
    title: "AI Calorie Analyzer",
    description: "Instant nutrition analysis from meal photos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Calorie Analyzer",
    description: "Instant nutrition analysis from meal photos",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Note: For production, use react-error-boundary or similar
  return <>{children}</>;
}
```

### File: `public/robots.txt`

```txt
User-agent: *
Allow: /

Sitemap: https://your-domain.vercel.app/sitemap.xml
```

### File: `src/app/sitemap.ts`

Dynamic sitemap:

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app";
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
```

### File: `src/components/ErrorFallback.tsx`

Error fallback component:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md p-6 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          We encountered an unexpected error. Please try again.
        </p>
        {error && (
          <p className="text-xs text-muted-foreground font-mono">
            {error.message}
          </p>
        )}
        <Button onClick={resetErrorBoundary || (() => window.location.reload())}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </Card>
    </main>
  );
}
```

### File: `.env.example`

Environment template:

```bash
# Required: OpenAI API key for GPT-5.2 vision
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Public app URL for sitemap/SEO
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### File: `DEPLOYMENT.md`

Deployment instructions:

```markdown
# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- OpenAI API key with GPT-5.2 access

## Steps

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/calorie-analyzer.git
git push -u origin main
\`\`\`

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure settings:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: (default)
   - Output Directory: (default)

### 3. Add Environment Variables

In Vercel project settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Production, Preview |

### 4. Deploy

Click "Deploy" and wait for build to complete.

### 5. Configure Domain (Optional)

1. Go to project Settings → Domains
2. Add custom domain
3. Configure DNS as instructed

## Post-Deployment

### Verify

- [ ] Home page loads
- [ ] Camera permission works
- [ ] Analysis returns results
- [ ] PWA installable on mobile

### Monitor

- Check Vercel Analytics for usage
- Monitor OpenAI API costs
- Set up alerts for errors

## Costs

| Service | Free Tier | Estimated Monthly |
|---------|-----------|-------------------|
| Vercel | 100GB bandwidth | $0-20 |
| OpenAI | N/A | $50-200* |

*Depends on usage: ~$0.03 per analysis

## Troubleshooting

### API Timeout

If analysis times out:
1. Check Vercel function logs
2. Verify OpenAI API key is valid
3. Increase timeout in vercel.json

### Camera Not Working

1. Ensure HTTPS (required for getUserMedia)
2. Check browser permissions
3. Test file upload fallback
\`\`\`
```

---

## 📁 ICON GENERATION

Create placeholder icons (replace with actual design):

```
public/
├── icons/
│   ├── icon-192.png   # 192x192 app icon
│   ├── icon-512.png   # 512x512 app icon
│   └── favicon.ico    # Browser favicon
└── og-image.png       # Open Graph image (1200x630)
```

For MVP, use a simple placeholder or generate with:
- [favicon.io](https://favicon.io)
- [realfavicongenerator.net](https://realfavicongenerator.net)

---

## 🧪 PRE-DEPLOYMENT CHECKLIST

### Build Verification

```bash
# Test production build
npm run build

# Check for TypeScript errors
npm run lint

# Test locally
npm run start
```

### Security Checks

- [ ] No API keys in client code
- [ ] Environment variables configured
- [ ] Error messages don't expose internals
- [ ] CORS configured if needed

### Performance Checks

- [ ] Images optimised
- [ ] Bundle size acceptable (<500KB)
- [ ] Lighthouse score >90

---

## ✅ VERIFICATION

- [ ] `vercel.json` configured correctly
- [ ] PWA manifest complete
- [ ] Meta tags render in head
- [ ] Environment variables documented
- [ ] Error boundary catches errors
- [ ] Build succeeds locally
- [ ] Deploy succeeds on Vercel

---

## 🚀 POST-MVP CONSIDERATIONS

### Analytics

```typescript
// Add to layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// In body:
<Analytics />
<SpeedInsights />
```

### Rate Limiting

Consider adding Vercel Edge Config or Upstash Redis for rate limiting before scaling.

### Cost Controls

Set up OpenAI usage limits and alerts in the OpenAI dashboard.
