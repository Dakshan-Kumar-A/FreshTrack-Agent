# Deployment Guide

Step-by-step instructions for deploying FreshTrack Assistant.

## Prerequisites

1. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Google Gemini API Key**
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Vercel Account** (for frontend)
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub account

4. **Render Account** (for backend)
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

## Step 1: Database Setup (Supabase)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase_schema.sql`
4. Paste and run the SQL script
5. Verify tables are created:
   - `foods`
   - `agent_logs`
6. Go to **Settings > API** and note:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep this secret!)

## Step 2: Backend Deployment (Render)

### Option A: Using Render Dashboard

1. **Create Web Service**
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Service**
   - **Name**: `freshtrack-backend`
   - **Environment**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_service_role_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   BACKEND_URL=https://freshtrack-backend.onrender.com
   ENVIRONMENT=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your service URL (e.g., `https://freshtrack-backend.onrender.com`)

### Option B: Using render.yaml

1. Push `render.yaml` to your repository
2. In Render dashboard, go to "New +" → "Blueprint"
3. Connect repository
4. Render will auto-detect `render.yaml` and create services

### Step 3: Setup Cron Job (Render)

1. **Create Cron Job**
   - Go to Render dashboard
   - Click "New +" → "Cron Job"
   - Connect your GitHub repository

2. **Configure Cron Job**
   - **Name**: `freshtrack-agent`
   - **Root Directory**: `backend`
   - **Command**: `python run_agent.py`
   - **Schedule**: `0 9 * * *` (daily at 9 AM UTC)
   - **Environment**: `Python 3`

3. **Add Environment Variables** (same as backend service)
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_service_role_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   BACKEND_URL=https://freshtrack-backend.onrender.com
   ENVIRONMENT=production
   ```

4. **Deploy**
   - Click "Create Cron Job"
   - The agent will run daily at the scheduled time

## Step 4: Frontend Deployment (Vercel)

1. **Import Project**
   - Go to Vercel dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://freshtrack-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://freshtrack-assistant.vercel.app`)

5. **Update Backend CORS** (if needed)
   - If your Vercel URL is different, update `main.py`:
   ```python
   allow_origins=["http://localhost:3000", "https://your-app.vercel.app"]
   ```
   - Redeploy backend

## Step 5: Verify Deployment

### Test Frontend
1. Visit your Vercel URL
2. Sign up for a new account
3. Add a food item
4. Check dashboard

### Test Backend
1. Visit `https://your-backend-url.onrender.com/docs`
2. Test API endpoints
3. Verify CORS is working

### Test Agent
1. Manually trigger agent:
   ```bash
   curl -X POST https://your-backend-url.onrender.com/agent/run \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
   ```
2. Or wait for scheduled run
3. Check Insights page for agent logs

## Troubleshooting

### Backend Issues

**Service won't start:**
- Check environment variables are set correctly
- Verify Python version (3.9+)
- Check build logs for dependency errors

**CORS errors:**
- Update `allow_origins` in `main.py` with your Vercel URL
- Redeploy backend

**Agent not running:**
- Verify cron job schedule
- Check environment variables in cron job
- Review cron job logs

### Frontend Issues

**API connection errors:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Verify CORS settings

**Auth not working:**
- Check Supabase keys
- Verify RLS policies are enabled
- Check browser console for errors

### Database Issues

**RLS blocking queries:**
- Verify RLS policies in Supabase
- Check user is authenticated
- Review policy definitions in `supabase_schema.sql`

## Post-Deployment Checklist

- [ ] Frontend is accessible
- [ ] Backend API is accessible
- [ ] User can sign up and log in
- [ ] User can add food items
- [ ] Dashboard displays items correctly
- [ ] Agent runs successfully (check logs)
- [ ] Insights page shows recommendations
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Cron job is scheduled

## Monitoring

### Render
- View service logs in Render dashboard
- Monitor service health
- Check cron job execution logs

### Vercel
- View deployment logs
- Monitor function execution
- Check analytics

### Supabase
- Monitor database usage
- Check auth logs
- Review API usage

## Cost Considerations

### Free Tier Limits

**Supabase:**
- 500 MB database
- 2 GB bandwidth
- 50,000 monthly active users

**Vercel:**
- Unlimited deployments
- 100 GB bandwidth
- Serverless functions

**Render:**
- 750 hours/month free
- Services sleep after 15 min inactivity (free tier)
- Cron jobs run on schedule

**Recommendations:**
- Use Render's free tier for development
- Consider upgrading for production
- Monitor usage to avoid overages

## Security Best Practices

1. **Never commit secrets** to repository
2. **Use environment variables** for all sensitive data
3. **Enable RLS** on all tables
4. **Use service role key** only server-side
5. **Regularly rotate** API keys
6. **Monitor** for suspicious activity

## Next Steps

- Set up custom domain (optional)
- Configure email notifications
- Add error monitoring (Sentry, etc.)
- Set up CI/CD pipelines
- Add automated testing
