# Deployment Guide for Whiskey Proxy

## Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/whiskey-proxy.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration
   - Click "Deploy"

### Option 2: Deploy from Local Machine

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## Configuration

The project is pre-configured for Vercel deployment with:

- **4 Serverless Functions** (under the 12 limit)
- **30-second timeout** for proxy requests
- **Automatic TypeScript compilation**
- **CORS enabled** for cross-origin requests

## Environment Variables

No environment variables are required. The proxy list is embedded in the code.

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Monitoring

- Check Vercel dashboard for function logs
- Monitor proxy health through the web interface
- Use the `/api/proxy-stats` endpoint for metrics

## Troubleshooting

### Common Issues:

1. **Function Timeout:**
   - Increase timeout in `vercel.json` if needed
   - Check proxy response times

2. **CORS Errors:**
   - Ensure your domain is whitelisted
   - Check browser console for specific errors

3. **Proxy Failures:**
   - Some proxies may be temporarily unavailable
   - The system automatically rotates to healthy proxies

### Debug Mode:

Add `?debug=true` to any API endpoint to see detailed error information.

## Performance Optimization

1. **Proxy Selection:**
   - Use country-specific proxies for better performance
   - Filter by proxy type based on your needs

2. **Caching:**
   - Consider implementing response caching for repeated requests
   - Use appropriate cache headers

3. **Monitoring:**
   - Regularly check proxy health statistics
   - Remove consistently failing proxies

## Security Considerations

1. **Rate Limiting:**
   - Implement rate limiting if needed
   - Monitor for abuse patterns

2. **Input Validation:**
   - All inputs are validated and sanitized
   - Malicious URLs are rejected

3. **Logging:**
   - No sensitive data is logged
   - Only error messages are recorded

## Scaling

The service automatically scales with Vercel's serverless architecture:

- **Cold starts:** ~100-200ms
- **Warm requests:** ~50-100ms
- **Concurrent limits:** Based on your Vercel plan

## Support

For deployment issues:
1. Check Vercel function logs
2. Test locally with `vercel dev`
3. Verify all dependencies are installed
4. Check TypeScript compilation errors
