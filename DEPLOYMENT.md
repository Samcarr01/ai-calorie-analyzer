# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- OpenAI API key with GPT-4 Vision access

## Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AI Calorie Analyzer"
git branch -M main
git remote add origin https://github.com/your-username/calorie-analyzer.git
git push -u origin main
```

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
| `OPENAI_API_KEY` | `sk-...` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |

**Important:** After adding environment variables, redeploy the application.

### 4. Deploy

Click "Deploy" and wait for build to complete (usually 1-2 minutes).

### 5. Configure Domain (Optional)

1. Go to project Settings → Domains
2. Add custom domain
3. Configure DNS as instructed by Vercel:
   - Add A record: `76.76.19.19`
   - Add CNAME record: `cname.vercel-dns.com`
4. Wait for DNS propagation (usually 5-30 minutes)

### 6. Update robots.txt

After deployment, update `public/robots.txt` with your actual domain:

```txt
Sitemap: https://your-actual-domain.com/sitemap.xml
```

## Post-Deployment

### Verify Functionality

- [ ] Home page loads correctly
- [ ] Camera permission request works
- [ ] Photo capture compresses image
- [ ] API endpoint responds (test with real photo)
- [ ] Results page displays nutrition data
- [ ] "Analyze Another" button returns to home
- [ ] PWA installable on mobile (look for install prompt)
- [ ] Icons appear correctly

### Test Camera Permissions

**Desktop:**
- Chrome: Click camera icon in address bar
- Safari: System Preferences → Security & Privacy → Camera
- Firefox: Click camera icon in address bar

**Mobile:**
- iOS: Settings → Safari → Camera
- Android: Settings → Apps → Chrome → Permissions → Camera

### Monitor Performance

1. **Vercel Analytics** (if enabled):
   - Go to project → Analytics tab
   - Monitor page views, unique visitors
   - Check Core Web Vitals

2. **OpenAI Usage**:
   - Visit [platform.openai.com/usage](https://platform.openai.com/usage)
   - Monitor API calls and costs
   - Set up usage alerts

3. **Vercel Logs**:
   - Go to project → Deployments → Select deployment → Functions
   - Check `/api/analyze` logs for errors
   - Monitor response times

## Costs

### Estimated Monthly Costs

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Vercel | 100GB bandwidth, 100GB hours | $0-20 |
| OpenAI GPT-4 Vision | None | $50-200* |

*Based on ~$0.03 per analysis × usage volume

**Example Scenarios:**
- 100 analyses/day × 30 days = ~$90/month
- 500 analyses/day × 30 days = ~$450/month
- 1000 analyses/day × 30 days = ~$900/month

### Cost Optimization

1. **Set OpenAI Usage Limits**:
   - Go to [platform.openai.com/settings/organization/limits](https://platform.openai.com/settings/organization/limits)
   - Set monthly budget cap
   - Enable email notifications at 80% threshold

2. **Monitor Vercel Usage**:
   - Check bandwidth usage monthly
   - Upgrade to Pro if approaching limits

## Troubleshooting

### API Timeout Errors

**Symptom:** 504 timeout errors after 30 seconds

**Solutions:**
1. Check Vercel function logs for details
2. Verify OpenAI API key is valid
3. Test with smaller/clearer images
4. Check OpenAI service status: [status.openai.com](https://status.openai.com)

### Camera Not Working

**Symptom:** Camera permission denied or not accessible

**Solutions:**
1. Ensure site is HTTPS (required for `getUserMedia`)
2. Check browser permissions
3. Try different browser (Chrome recommended)
4. Use file upload fallback
5. Check browser console for errors

### Build Failures

**Symptom:** Deployment fails during build

**Solutions:**
1. Check build logs in Vercel
2. Verify `package.json` dependencies
3. Run `npm run build` locally to reproduce
4. Check TypeScript errors: `npm run lint`

### Images Too Large

**Symptom:** "IMAGE_TOO_LARGE" error

**Solutions:**
1. Image should be compressed client-side before sending
2. Verify `compressImage()` function is working
3. Check browser console for compression errors
4. Maximum compressed size should be ~1MB

### No Results Displaying

**Symptom:** API succeeds but results page is blank

**Solutions:**
1. Check browser console for errors
2. Verify sessionStorage is enabled (not in private mode)
3. Check that MealAnalysis data is valid JSON
4. Test with browser DevTools → Application → Session Storage

## Security Checklist

- [ ] `OPENAI_API_KEY` stored in environment variables (not in code)
- [ ] `.env` added to `.gitignore`
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured in `vercel.json`
- [ ] No images stored server-side
- [ ] Error messages don't expose stack traces in production

## Performance Checklist

- [ ] Images compressed to < 1MB before upload
- [ ] Lighthouse score > 90 on mobile
- [ ] First Contentful Paint < 1.5s
- [ ] API response time < 3s average
- [ ] Bundle size reasonable (< 150 KB total)

## Next Steps

### Post-MVP Enhancements

1. **Analytics Integration**:
   ```bash
   npm install @vercel/analytics
   ```

2. **Rate Limiting**:
   - Add Upstash Redis for request tracking
   - Implement per-IP limits (10 requests/hour)

3. **Usage Tracking**:
   - Add simple analytics event on analyze
   - Track success/error rates

4. **User Feedback**:
   - Add thumbs up/down on results
   - Collect accuracy feedback

5. **Caching**:
   - Cache common meal analyses
   - Reduce duplicate API calls

## Support

For issues or questions:
- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [OpenAI API Documentation](https://platform.openai.com/docs)
- Check [Vercel Documentation](https://vercel.com/docs)

## Maintenance

### Regular Tasks

**Weekly:**
- Check Vercel logs for errors
- Monitor OpenAI usage and costs

**Monthly:**
- Review analytics data
- Update dependencies if needed
- Check for OpenAI API updates

**As Needed:**
- Update OpenAI model when GPT-5 becomes available
- Adjust prompts based on user feedback
- Optimize image compression settings
