# FreshTrack Assistant 🥗

**An Agentic AI Food Waste Reduction System**

FreshTrack Assistant is a proactive AI food management agent that tracks household food inventory, monitors expiry dates, plans timely usage, recommends meals, and prevents food waste through autonomous decision-making. This project aligns with **SDG 2 (Zero Hunger)** and **SDG 12 (Responsible Consumption)**.

## 🌟 Features

- **Food Inventory Management**: Add, edit, and delete food items with expiry tracking
- **Autonomous AI Agent**: Daily agent runs that automatically classify items and generate recommendations
- **Smart Status Classification**: Items are automatically categorized as Safe, Expiring, or Expired
- **AI-Powered Meal Suggestions**: Generate meal ideas using items closest to expiry
- **Waste Tracking**: Log and monitor food waste to improve consumption patterns
- **Real-time Dashboard**: View inventory status, expiring items, and AI recommendations
- **Secure Authentication**: User isolation with Supabase Auth and Row Level Security

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Client
- Deployed on Vercel

**Backend:**
- FastAPI (Python)
- Supabase (PostgreSQL + Auth)
- Google Gemini AI
- Deployed on Render

**Database:**
- Supabase PostgreSQL
- Row Level Security (RLS)
- Scheduled Functions

## 📁 Project Structure

```
FreshTrack Assistant/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── run_agent.py         # Standalone agent runner
│   ├── requirements.txt     # Python dependencies
│   ├── env.example          # Environment variables template
│   ├── render.yaml          # Render deployment config
│   └── README.md            # Backend documentation
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx         # Root page (redirects)
│   │   ├── login/           # Authentication page
│   │   ├── dashboard/       # Main dashboard
│   │   ├── add-food/        # Add food item page
│   │   └── insights/        # AI insights page
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API clients
│   ├── package.json         # Node dependencies
│   └── vercel.json          # Vercel deployment config
├── supabase_schema.sql      # Database schema
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account (free tier works)
- Google Gemini API key
- Vercel account (for frontend)
- Render account (for backend)

### 1. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase_schema.sql`
3. Note down your:
   - Project URL
   - Service Role Key (for backend)
   - Anon Key (for frontend)

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp env.example .env
```

Edit `.env` with your credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
BACKEND_URL=http://localhost:8000
ENVIRONMENT=development
```

Run locally:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run locally:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Test the Agent

Manually trigger the agent:
```bash
cd backend
python run_agent.py
```

## 🧠 Agent Logic

The AI agent runs daily and performs the following:

1. **Fetches all food items** for each user
2. **Classifies items** based on expiry date:
   - **Expired**: Past expiry date
   - **Expiring**: Within 1-2 days
   - **Safe**: More than 2 days remaining
3. **Takes autonomous actions**:
   - Logs waste for expired items
   - Generates urgent alerts for expiring items
   - Creates AI-powered meal suggestions
4. **Stores reasoning** in agent logs for transparency

### Agent Decision Flow

```
For each user:
  Load inventory
  Sort by expiry date
  If expiry <= today:
      mark expired
      log waste
  If expiry <= 2 days:
      generate urgent meal suggestion
      notify user
  Else:
      no action
```

## 📊 Database Schema

### `foods` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (Text)
- `quantity` (Text)
- `expiry_date` (Date)
- `status` (Text: 'safe', 'expiring', 'expired')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `agent_logs` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `action` (Text: 'waste_logged', 'urgent_alert', 'meal_suggestion')
- `reasoning` (Text)
- `created_at` (Timestamp)

## 🔐 Security

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Supabase Auth handles user sessions
- **Service Role Key**: Only used server-side for agent operations
- **Input Validation**: Pydantic models validate all API inputs
- **CORS Protection**: Configured for specific origins

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your Render backend URL)
4. Deploy

### Backend (Render)

1. Create a new Web Service
2. Connect GitHub repository
3. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (same as `.env`)
5. Deploy

### Cron Job (Render)

1. Create a new Cron Job
2. Set:
   - **Command**: `python run_agent.py`
   - **Schedule**: `0 9 * * *` (daily at 9 AM UTC)
3. Add same environment variables as backend
4. Set `BACKEND_URL` to your backend service URL

## 📱 Pages & Routes

### Frontend Routes
- `/` - Redirects to login or dashboard
- `/login` - Authentication page
- `/dashboard` - Main inventory dashboard
- `/add-food` - Add new food item
- `/insights` - AI recommendations and statistics

### Backend API Endpoints
- `POST /food` - Create food item
- `GET /food` - Get all user's food items
- `PUT /food/{id}` - Update food item
- `DELETE /food/{id}` - Delete food item
- `POST /agent/run` - Run agent (cron job)
- `GET /agent/logs` - Get agent logs
- `GET /insights` - Get insights and statistics

## 🎯 SDG Alignment

### SDG 2: Zero Hunger
- Reduces food waste at household level
- Promotes efficient food consumption
- Prevents edible food from being discarded

### SDG 12: Responsible Consumption
- Tracks consumption patterns
- Provides data-driven insights
- Encourages sustainable food management

## 🧪 Testing

### Manual Testing Checklist

- [ ] User can sign up and log in
- [ ] User can add food items
- [ ] User can view dashboard with status colors
- [ ] User can delete food items
- [ ] Agent runs and classifies items correctly
- [ ] Expiring items show in "Expiring Soon" section
- [ ] AI recommendations appear in Insights page
- [ ] Waste is logged for expired items

## 📝 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
BACKEND_URL=http://localhost:8000
ENVIRONMENT=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend Issues
- **CORS errors**: Update `allow_origins` in `main.py` with your frontend URL
- **Auth errors**: Verify Supabase keys are correct
- **Agent not running**: Check cron job schedule and environment variables

### Frontend Issues
- **API connection errors**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Auth not working**: Check Supabase keys and RLS policies
- **Build errors**: Ensure all environment variables are set

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding unit tests
- Implementing error monitoring
- Adding rate limiting
- Enhancing AI prompts
- Adding notifications (email/push)

## 📄 License

This project is created for educational and demonstration purposes.

## 🙏 Acknowledgments

- Built with Next.js, FastAPI, Supabase, and Google Gemini AI
- Aligned with UN Sustainable Development Goals 2 and 12

---

**Built with ❤️ for a sustainable future**
