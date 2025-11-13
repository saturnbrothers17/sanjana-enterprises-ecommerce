# Deployment Guide - Sanjana Enterprises eCommerce

## Vercel Deployment

This application is configured for deployment on Vercel with serverless functions.

### Prerequisites
- GitHub account with repository access
- Vercel account (free tier works)
- Environment variables configured

### Quick Deploy to Vercel

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository: `saturnbrothers17/sanjana-enterprises-ecommerce`

2. **Configure Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:

   ```
   WOOCOMMERCE_CONSUMER_KEY=your_key_here
   WOOCOMMERCE_CONSUMER_SECRET=your_secret_here
   WOOCOMMERCE_URL=https://your-wordpress-site.com
   SESSION_SECRET=your_session_secret
   TURSO_DATABASE_URL=your_turso_url
   TURSO_AUTH_TOKEN=your_turso_token
   NODE_ENV=production
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Important Notes

#### Database Connections
- **WooCommerce API**: Ensure your WordPress site allows API access
- **Turso Database**: Make sure the connection URL is accessible from Vercel's servers
- **Redis**: For production, use a cloud Redis service (Upstash, Redis Labs)

#### Static Assets
- All files in `/public` are served as static assets
- CSS is pre-built and included in the repository
- Images are served directly from the `/public/images` folder

#### Session Management
For production on Vercel (serverless), consider:
- Using JWT tokens instead of sessions
- Or using a Redis-backed session store (connect-redis)
- Current session setup works but may have limitations in serverless

### Alternative Deployment Options

#### Render.com
1. Create new Web Service
2. Connect GitHub repository
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add environment variables

#### Railway.app
1. New Project → Deploy from GitHub
2. Select repository
3. Add environment variables
4. Deploy automatically

#### Heroku
```bash
heroku create sanjana-enterprises
heroku config:set WOOCOMMERCE_CONSUMER_KEY=your_key
heroku config:set WOOCOMMERCE_CONSUMER_SECRET=your_secret
# ... add other env vars
git push heroku main
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `WOOCOMMERCE_CONSUMER_KEY` | Yes | WooCommerce REST API Key |
| `WOOCOMMERCE_CONSUMER_SECRET` | Yes | WooCommerce REST API Secret |
| `WOOCOMMERCE_URL` | Yes | WordPress site URL |
| `SESSION_SECRET` | Yes | Secret for session encryption |
| `TURSO_DATABASE_URL` | Optional | Turso database connection |
| `TURSO_AUTH_TOKEN` | Optional | Turso authentication token |
| `NODE_ENV` | Yes | Set to 'production' |
| `PORT` | No | Auto-set by platform |

### Troubleshooting

#### Build Fails
- Check that all dependencies are in `dependencies` not `devDependencies`
- Ensure Node.js version compatibility (v14+)

#### CSS Not Loading
- Verify `/public` folder is committed to Git
- Check `vercel.json` routes configuration

#### API Errors
- Verify WooCommerce API credentials
- Check CORS settings on WordPress
- Ensure WordPress site is accessible from Vercel

#### Database Connection Issues
- For Turso: Verify the database URL and token
- For MySQL: Use connection pooling
- Check firewall rules allow Vercel IPs

### Performance Optimization

1. **Enable Compression**: Already configured in middleware
2. **CDN for Images**: Consider using Cloudinary or Vercel's image optimization
3. **Caching**: Implement Redis caching for product data
4. **Database Queries**: Optimize WooCommerce queries

### Security Checklist

- ✅ Environment variables not in repository
- ✅ Security headers configured
- ✅ Rate limiting enabled
- ✅ XSS protection active
- ✅ CORS properly configured
- ⚠️ Add SSL certificate (auto on Vercel)
- ⚠️ Configure custom domain
- ⚠️ Set up monitoring and alerts

### Monitoring

After deployment, monitor:
- Error logs in Vercel dashboard
- API response times
- Database connection health
- WooCommerce API rate limits

### Support

For issues:
1. Check Vercel deployment logs
2. Review GitHub repository issues
3. Verify environment variables
4. Test WooCommerce API separately

---

**Last Updated**: November 2025
**Version**: 1.0.0
