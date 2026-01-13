# FreshTrack Assistant Backend

FastAPI backend for the FreshTrack Assistant food waste reduction system.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Fill in environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `BACKEND_URL`: Backend URL (for cron job)
- `ENVIRONMENT`: development or production

4. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Running Agent Manually

```bash
python run_agent.py
```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

## Cron Job Setup

Create a scheduled job on Render:
- Command: `python run_agent.py`
- Schedule: `0 9 * * *` (runs daily at 9 AM UTC)
- Environment variables: Same as web service
