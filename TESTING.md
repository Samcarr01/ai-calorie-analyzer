# Testing Checklist

Complete this checklist before deploying to production.

## Pre-Deployment Tests

### Build & Environment

- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes with no warnings
- [ ] TypeScript compiles without errors
- [ ] `.env` file contains valid `OPENAI_API_KEY`
- [ ] `.env` is in `.gitignore`

### Home Page Tests

- [ ] Home page loads at `http://localhost:3000`
- [ ] Header displays "AI Calorie Analyzer" title
- [ ] Description text is visible
- [ ] Footer disclaimer is visible
- [ ] Page is responsive (test mobile, tablet, desktop)

### Camera Capture Tests

#### Permission Granted
- [ ] Camera permission dialog appears on first visit
- [ ] Video preview displays after granting permission
- [ ] Video preview shows live camera feed
- [ ] Camera defaults to rear/environment facing
- [ ] Switch camera button appears (if multiple cameras available)
- [ ] Switch camera button works correctly
- [ ] Capture button is visible and enabled
- [ ] Upload button is visible and enabled

#### Permission Denied
- [ ] Fallback UI appears if camera denied
- [ ] Error message is user-friendly
- [ ] Upload-only button is displayed
- [ ] Upload button works correctly

#### Image Capture
- [ ] Capture button captures current video frame
- [ ] Captured image compresses to < 1MB
- [ ] AnalyzingState appears after capture
- [ ] Loading spinner is visible
- [ ] Progress bar animates
- [ ] Status messages rotate every second

#### Image Upload
- [ ] File picker opens when upload clicked
- [ ] Only image files are selectable
- [ ] Selected image compresses correctly
- [ ] AnalyzingState appears after selection

### API Endpoint Tests

#### Happy Path
```bash
# Test with a real food image
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64_image>", "mimeType": "image/jpeg"}'
```

- [ ] Returns 200 status code
- [ ] Response has `success: true`
- [ ] Response contains `data` object
- [ ] `totalCalories` is a number
- [ ] `macros` object has protein, carbs, fat
- [ ] `foodItems` array contains items
- [ ] `confidence` is low/medium/high
- [ ] Response time < 5 seconds

#### Error Cases
- [ ] Empty image returns 400 error
- [ ] Invalid mime type returns 400 error
- [ ] Image > 4MB returns IMAGE_TOO_LARGE error
- [ ] Invalid API key returns AI_ERROR (500)
- [ ] Error messages are user-friendly (no stack traces)

### Results Page Tests

#### Data Display
- [ ] Results page loads after successful analysis
- [ ] Captured image thumbnail displays
- [ ] Calorie number animates from 0 to actual value
- [ ] Animation completes in ~1 second
- [ ] "calories" label appears below number
- [ ] Macro cards display in 3-column grid
- [ ] Each macro shows value + unit + label
- [ ] Color dots match macro types (blue/green/yellow)
- [ ] Confidence indicator displays correct level
- [ ] Confidence dots reflect level (1/5, 3/5, or 5/5)
- [ ] Confidence color matches level (red/yellow/green)
- [ ] Food items list displays all detected foods
- [ ] Each food shows name, portion, and calories
- [ ] Notes card appears if notes present
- [ ] Back button works
- [ ] "Analyze Another" button is visible at bottom

#### Edge Cases
- [ ] Direct navigation to `/results` redirects to home
- [ ] Empty sessionStorage redirects to home
- [ ] Invalid JSON in sessionStorage redirects to home
- [ ] Page is responsive (mobile, tablet, desktop)

#### Navigation
- [ ] "Analyze Another" clears sessionStorage
- [ ] "Analyze Another" navigates to home
- [ ] Back button returns to previous page
- [ ] Navigation preserves app state

### Error Handling Tests

- [ ] Network error shows appropriate message
- [ ] API timeout shows timeout message
- [ ] AI error shows retry message
- [ ] Camera error shows fallback option
- [ ] Invalid image shows clear error
- [ ] Error alerts are dismissible
- [ ] Error states don't break UI

### PWA Tests

#### Desktop
- [ ] Manifest.json loads at `/manifest.json`
- [ ] Manifest has correct app name
- [ ] Manifest has correct colors
- [ ] Favicon appears in browser tab
- [ ] Meta tags render in page head

#### Mobile
- [ ] "Add to Home Screen" prompt appears (iOS Safari)
- [ ] "Install" prompt appears (Android Chrome)
- [ ] App icon displays on home screen
- [ ] App opens in standalone mode
- [ ] Status bar styling is correct
- [ ] Viewport is not zoomable
- [ ] Touch targets are >= 48px

### Performance Tests

#### Lighthouse (Mobile)
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90
- [ ] PWA badge appears

#### Load Times
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] API response time < 3s (average)

#### Bundle Size
- [ ] Total JS < 150 KB
- [ ] Home page First Load JS < 110 KB
- [ ] Results page First Load JS < 110 KB

### Security Tests

- [ ] OPENAI_API_KEY not in client bundle
- [ ] No API key in network requests (except to OpenAI)
- [ ] Images not stored server-side
- [ ] No sensitive data in error messages
- [ ] Security headers present in responses
- [ ] HTTPS required for camera (production)

### Browser Compatibility

#### Desktop
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

#### Mobile
- [ ] iOS Safari (14+)
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet

### Accessibility Tests

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Images have alt text
- [ ] Buttons have aria-labels where needed
- [ ] Color contrast ratio > 4.5:1
- [ ] Screen reader announces loading states
- [ ] Error messages are announced

## Post-Deployment Tests

### Production Environment

- [ ] Production URL loads correctly
- [ ] HTTPS certificate valid
- [ ] Camera works on HTTPS
- [ ] API endpoint responds
- [ ] Environment variables configured
- [ ] Error tracking works (if enabled)
- [ ] Analytics tracking works (if enabled)

### Real-World Testing

#### Different Meal Types
- [ ] Simple meal (e.g., apple) - High confidence
- [ ] Complex meal (e.g., salad) - Medium/High confidence
- [ ] Mixed dish (e.g., curry) - Medium confidence
- [ ] Processed food (e.g., pizza) - Medium confidence
- [ ] Multiple items - All detected

#### Image Quality
- [ ] Well-lit photo - High confidence
- [ ] Dim lighting - Lower confidence
- [ ] Blurry photo - Lower confidence
- [ ] Angled shot - Medium confidence
- [ ] Close-up - High confidence

#### Edge Cases
- [ ] Non-food image - Appropriate error or low confidence
- [ ] Empty plate - Handles gracefully
- [ ] Beverage only - Detects correctly
- [ ] Packaged food - Attempts analysis

### Load Testing

- [ ] 10 concurrent requests complete successfully
- [ ] No memory leaks after 50 analyses
- [ ] SessionStorage doesn't overflow
- [ ] Camera stream cleans up properly

## Regression Testing

After any changes, re-test:

- [ ] Core user flow (capture → analyze → results)
- [ ] API endpoint functionality
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] PWA functionality

## Known Issues / Limitations

Document any known issues:

- [ ] Camera requires HTTPS (by design)
- [ ] SessionStorage cleared on tab close (by design)
- [ ] Estimates are approximate (by design)
- [ ] Complex dishes may have lower accuracy
- [ ] API costs ~$0.03 per request

## Sign-Off

- [ ] All critical tests passed
- [ ] Known issues documented
- [ ] Performance meets requirements
- [ ] Security review completed
- [ ] Ready for production deployment

**Tested by:** _________________
**Date:** _________________
**Version:** _________________
