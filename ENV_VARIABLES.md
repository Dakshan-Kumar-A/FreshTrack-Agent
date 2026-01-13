# Environment Variables Reference

Quick reference for all environment variables needed for FreshTrack Assistant.

## Backend (.env)

Location: `backend/.env`

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Configuration
BACKEND_URL=http://localhost:8000
ENVIRONMENT=development
```

### Where to Find These Values

**SUPABASE_URL:**
- Supabase Dashboard → Settings → API → Project URL

**SUPABASE_KEY:**
- Supabase Dashboard → Settings → API → service_role key (secret!)
- ⚠️ Keep this secret! Never expose in frontend.

**SUPABASE_ANON_KEY:**
- Supabase Dashboard → Settings → API → anon/public key

**GEMINI_API_KEY:**
- Google AI Studio → Get API Key
- https://makersuite.google.com/app/apikey

**BACKEND_URL:**
- Local: `http://localhost:8000`
- Production: `https://your-backend.onrender.com`

**ENVIRONMENT:**
- Development: `development`
- Production: `production`

## Frontend (.env.local)

Location: `frontend/.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Where to Find These Values

**NEXT_PUBLIC_SUPABASE_URL:**
- Same as backend `SUPABASE_URL`

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
- Same as backend `SUPABASE_ANON_KEY`

**NEXT_PUBLIC_API_URL:**
- Local: `http://localhost:8000`
- Production: `https://your-backend.onrender.com`

## Render Deployment

### Web Service Environment Variables

Add these in Render Dashboard → Environment:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key
BACKEND_URL=https://your-backend.onrender.com
ENVIRONMENT=production
```

### Cron Job Environment Variables

Same as Web Service, plus ensure `BACKEND_URL` points to your deployed backend.

## Vercel Deployment

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Security Notes

### ✅ Safe to Expose (Frontend)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### 🔒 Never Expose (Backend Only)
- `SUPABASE_KEY` (service role key)
- `GEMINI_API_KEY`

### Best Practices

1. **Never commit `.env` files** to Git
2. **Use different keys** for development and production
3. **Rotate keys** regularly
4. **Use environment variables** in deployment platforms
5. **Verify RLS policies** protect your data

## Quick Setup Commands

### Backend
```bash
cd backend
cp env.example .env
# Edit .env with your values
```

### Frontend
```bash
cd frontend
# Create .env.local manually or copy from example
# Edit .env.local with your values
```

## Verification

### Backend
```bash
cd backend
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('SUPABASE_URL:', os.getenv('SUPABASE_URL')[:20] + '...' if os.getenv('SUPABASE_URL') else 'NOT SET')"
```

### Frontend
Check that variables are accessible:
```typescript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## Troubleshooting

### "Environment variable not found"
- Check file name (`.env` for backend, `.env.local` for frontend)
- Verify variable names match exactly
- Restart development server after changes

### "API key invalid"
- Verify key is copied correctly (no extra spaces)
- Check key is active in provider dashboard
- Verify key has correct permissions

### "CORS error"
- Update `allow_origins` in `backend/main.py`
- Include your Vercel URL
- Redeploy backend

---

**Remember**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Only use this prefix for values that are safe to expose publicly.
