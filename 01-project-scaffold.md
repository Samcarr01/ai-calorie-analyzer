# Prompt 01: Project Scaffold

## 🧠 CONTEXT

Reference: `CLAUDE.md` → Initial Setup

This is the first prompt in the build chain. It creates the foundational Next.js project structure with all dependencies and configuration.

---

## 📋 TASK

Generate a complete Next.js 14 project scaffold for the AI Calorie & Nutrition Analyzer app with the following:

1. **Project initialization** with TypeScript, Tailwind CSS, and App Router
2. **Dependencies** installed and configured
3. **File structure** matching CLAUDE.md specification
4. **Base configuration** files
5. **Type definitions** for nutrition data

---

## ⚠️ CONSTRAINTS

1. **Must** use Next.js 14 with App Router (`src/app/`)
2. **Must** use TypeScript with strict mode
3. **Must** configure Tailwind CSS with shadcn/ui
4. **Must** create placeholder files for all components listed in CLAUDE.md
5. **Must** set up environment variable template (`.env.example`)
6. **Must** include proper `.gitignore`
7. **Must not** include any authentication logic
8. **Must not** include any database configuration
9. *Should* configure ESLint and Prettier
10. *Should* set up path aliases (`@/`)

---

## 📝 OUTPUT FORMAT

Return the following files with complete contents:

### Configuration Files

```
package.json
tsconfig.json
tailwind.config.ts
next.config.js
.env.example
.gitignore
postcss.config.js
components.json (shadcn)
```

### App Structure

```
src/app/layout.tsx
src/app/page.tsx
src/app/globals.css
src/app/results/page.tsx
src/app/api/analyze/route.ts (placeholder)
```

### Library Files

```
src/lib/utils.ts (shadcn cn helper)
src/lib/openai.ts (placeholder)
src/lib/prompts.ts (placeholder)
```

### Type Definitions

```
src/types/nutrition.ts
```

### Component Placeholders

```
src/components/CameraCapture.tsx (placeholder)
src/components/NutritionCard.tsx (placeholder)
src/components/FoodItemList.tsx (placeholder)
src/components/ConfidenceIndicator.tsx (placeholder)
src/components/AnalyzingState.tsx (placeholder)
src/components/ui/ (shadcn components folder)
```

---

## 📦 DEPENDENCIES

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "openai": "^4.x",
    "zod": "^3.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "eslint": "^8.x",
    "eslint-config-next": "14.x"
  }
}
```

---

## ✅ VERIFICATION

After running this prompt, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts the development server
- [ ] Home page loads at `http://localhost:3000`
- [ ] No TypeScript errors
- [ ] Tailwind classes apply correctly

---

## 🔗 NEXT PROMPT

After completing this scaffold, proceed to `02-api-analyze.md` to implement the GPT-5.2 analysis endpoint.
