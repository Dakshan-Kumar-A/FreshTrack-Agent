# Troubleshooting Guide

## "Email not found" Error After Signing Up

### Issue
After signing up, you see "email not found" error when trying to sign in.

### Cause
Supabase requires email confirmation by default. Until you confirm your email, the account exists but you cannot sign in.

### Solution

**Option 1: Confirm Your Email (Recommended)**
1. Check your email inbox (including spam folder)
2. Look for an email from Supabase
3. Click the confirmation link
4. Try signing in again

**Option 2: Disable Email Confirmation (Development Only)**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, disable **"Confirm email"**
4. Save changes
5. Try signing up again

**Option 3: Check Supabase Dashboard**
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Check if your user exists
3. Check the "Email Confirmed" status
4. If not confirmed, you can manually confirm from the dashboard

## Backend Authentication Issues

### Issue
Backend returns 401 errors even with valid tokens.

### Solution
The backend has been updated to properly decode JWT tokens. Make sure:
1. Backend server is restarted after code changes
2. Environment variables are set correctly
3. Frontend is sending the token in the Authorization header

### Restart Backend
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Frontend Connection Issues

### Issue
Frontend cannot connect to backend.

### Check
1. Backend is running on `http://localhost:8000`
2. `NEXT_PUBLIC_API_URL` in `.env.local` is set to `http://localhost:8000`
3. No CORS errors in browser console
4. Backend CORS settings allow `http://localhost:3000`

### Solution
```bash
# In frontend directory
# Check .env.local
cat .env.local

# Should contain:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database Connection Issues

### Issue
Cannot connect to Supabase database.

### Check
1. Supabase project is active
2. Database schema has been applied (run `supabase_schema.sql`)
3. Environment variables are correct:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (service role key for backend)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key for frontend)

### Verify Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Check if tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. Should show: `foods` and `agent_logs`

## Common Errors and Solutions

### Error: "Invalid authentication token"
- **Cause**: JWT token is invalid or expired
- **Solution**: Sign out and sign in again

### Error: "CORS policy"
- **Cause**: Backend CORS not configured for frontend URL
- **Solution**: Update `allow_origins` in `backend/main.py`

### Error: "Module not found"
- **Cause**: Dependencies not installed
- **Solution**: 
  ```bash
  # Backend
  cd backend
  pip install -r requirements.txt
  
  # Frontend
  cd frontend
  npm install
  ```

### Error: "Environment variable not set"
- **Cause**: Missing `.env` or `.env.local` file
- **Solution**: Copy from `.example` files and fill in values

## Testing Authentication Flow

1. **Sign Up**
   - Go to `/login`
   - Click "Sign up"
   - Enter email and password
   - Check for confirmation email

2. **Confirm Email**
   - Check email inbox
   - Click confirmation link
   - Should redirect to login

3. **Sign In**
   - Enter email and password
   - Should redirect to `/dashboard`

4. **Test API**
   - Open browser console
   - Check Network tab
   - API calls should have `Authorization: Bearer <token>` header
   - Should return 200 status codes

## Getting Help

If issues persist:
1. Check browser console for errors
2. Check backend logs
3. Verify all environment variables
4. Check Supabase dashboard for user status
5. Review error messages carefully
