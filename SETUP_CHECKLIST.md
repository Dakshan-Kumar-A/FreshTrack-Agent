# Setup Checklist

Use this checklist to ensure everything is configured correctly.

## Pre-Deployment Checklist

### Supabase Setup
- [ ] Created Supabase project
- [ ] Ran `supabase_schema.sql` in SQL Editor
- [ ] Verified `foods` table exists
- [ ] Verified `agent_logs` table exists
- [ ] Verified RLS policies are enabled
- [ ] Copied Project URL
- [ ] Copied Anon Key
- [ ] Copied Service Role Key (keep secret!)

### API Keys
- [ ] Obtained Google Gemini API key
- [ ] Verified API key is active

### Backend Configuration
- [ ] Created `.env` file in `backend/` directory
- [ ] Set `SUPABASE_URL`
- [ ] Set `SUPABASE_KEY` (service role)
- [ ] Set `SUPABASE_ANON_KEY`
- [ ] Set `GEMINI_API_KEY`
- [ ] Set `BACKEND_URL` (for local: `http://localhost:8000`)
- [ ] Set `ENVIRONMENT=development`
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Tested backend locally: `uvicorn main:app --reload`
- [ ] Verified API docs at `http://localhost:8000/docs`

### Frontend Configuration
- [ ] Created `.env.local` file in `frontend/` directory
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `NEXT_PUBLIC_API_URL` (for local: `http://localhost:8000`)
- [ ] Installed dependencies: `npm install`
- [ ] Tested frontend locally: `npm run dev`
- [ ] Verified app loads at `http://localhost:3000`

### Local Testing
- [ ] Can sign up new user
- [ ] Can log in
- [ ] Can add food item
- [ ] Can view dashboard
- [ ] Can see status colors (green/yellow/red)
- [ ] Can delete food item
- [ ] Can view insights page
- [ ] Manually triggered agent: `python backend/run_agent.py`
- [ ] Agent logs appear in insights

## Deployment Checklist

### Backend (Render)
- [ ] Pushed code to GitHub
- [ ] Created Render account
- [ ] Created Web Service on Render
- [ ] Connected GitHub repository
- [ ] Set root directory: `backend`
- [ ] Set build command: `pip install -r requirements.txt`
- [ ] Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Added all environment variables
- [ ] Updated `BACKEND_URL` to Render URL
- [ ] Deployed service
- [ ] Verified backend is accessible
- [ ] Tested API docs at `https://your-backend.onrender.com/docs`

### Cron Job (Render)
- [ ] Created Cron Job on Render
- [ ] Connected GitHub repository
- [ ] Set root directory: `backend`
- [ ] Set command: `python run_agent.py`
- [ ] Set schedule: `0 9 * * *` (daily at 9 AM UTC)
- [ ] Added all environment variables
- [ ] Set `BACKEND_URL` to backend service URL
- [ ] Deployed cron job
- [ ] Verified cron job appears in dashboard

### Frontend (Vercel)
- [ ] Pushed code to GitHub
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Set root directory: `frontend`
- [ ] Added all environment variables
- [ ] Set `NEXT_PUBLIC_API_URL` to Render backend URL
- [ ] Deployed frontend
- [ ] Verified frontend is accessible
- [ ] Updated backend CORS with Vercel URL (if needed)

## Post-Deployment Testing

### Functional Tests
- [ ] Can access frontend URL
- [ ] Can sign up new account
- [ ] Can log in
- [ ] Can add food item
- [ ] Dashboard displays correctly
- [ ] Status colors work (green/yellow/red)
- [ ] Can delete food item
- [ ] Insights page loads
- [ ] Agent recommendations appear (after agent runs)

### Agent Testing
- [ ] Manually triggered agent via API
- [ ] Agent processed items correctly
- [ ] Status updates worked
- [ ] Logs created in database
- [ ] Recommendations generated
- [ ] Cron job scheduled correctly

### Security Tests
- [ ] RLS prevents cross-user data access
- [ ] Authentication required for all endpoints
- [ ] Service role key only used server-side
- [ ] No secrets exposed in frontend code
- [ ] CORS configured correctly

## Troubleshooting Common Issues

### Backend won't start
- Check environment variables
- Verify Python version (3.9+)
- Check build logs
- Verify dependencies installed

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Verify backend is running
- Check browser console for errors

### Agent not running
- Verify cron job schedule
- Check environment variables in cron job
- Review cron job logs
- Test agent manually first

### Auth not working
- Verify Supabase keys
- Check RLS policies
- Verify user is authenticated
- Check browser console

### Database errors
- Verify schema is applied
- Check RLS policies
- Verify user permissions
- Review Supabase logs

## Final Verification

- [ ] All pages load correctly
- [ ] All API endpoints work
- [ ] Agent runs successfully
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Status colors correct
- [ ] Recommendations appear
- [ ] Waste tracking works

## Production Readiness

- [ ] Error monitoring set up (optional)
- [ ] Analytics configured (optional)
- [ ] Custom domain (optional)
- [ ] SSL certificates valid
- [ ] Backup strategy (Supabase handles this)
- [ ] Documentation complete

---

**Status**: Ready for deployment ✅
