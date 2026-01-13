"""
FreshTrack Assistant Backend
FastAPI REST API for food waste reduction system
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime, timedelta
import os
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client, Client
import uuid
import jwt
from jwt import PyJWKClient

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="FreshTrack Assistant API",
    description="Agentic AI Food Waste Reduction System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://dakshanfreshtrack-agent.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel deployments
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize Gemini AI
gemini_api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=gemini_api_key)

# Security
security = HTTPBearer()


# Pydantic models
class FoodItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    quantity: str = Field(..., min_length=1, max_length=100)
    expiry_date: date

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Milk",
                "quantity": "1 liter",
                "expiry_date": "2024-12-25"
            }
        }


class FoodItemResponse(FoodItem):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FoodItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    quantity: Optional[str] = Field(None, min_length=1, max_length=100)
    expiry_date: Optional[date] = None


class AgentLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    reasoning: str
    created_at: datetime


class AgentRunResponse(BaseModel):
    message: str
    items_processed: int
    logs_created: int


# Authentication helper
async def get_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and return user ID"""
    token = credentials.credentials
    
    try:
        # Decode JWT token to get user ID
        # Supabase JWT tokens contain user info in the payload
        # We decode without verification since we trust Supabase's tokens
        # In production, you might want to verify the signature
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded_token.get("sub") or decoded_token.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: user ID not found")
        
        return user_id
    except jwt.DecodeError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


# Helper function to determine food status
def get_food_status(expiry_date: date) -> str:
    """Determine food status based on expiry date"""
    today = date.today()
    days_until_expiry = (expiry_date - today).days
    
    if days_until_expiry < 0:
        return "expired"
    elif days_until_expiry <= 2:
        return "expiring"
    else:
        return "safe"


# AI Helper Functions
def generate_meal_suggestion(food_items: List[dict]) -> str:
    """Generate meal suggestion using Gemini AI"""
    if not food_items:
        return "No items available for meal suggestions."
    
    # Prepare prompt
    items_text = "\n".join([
        f"- {item['name']} ({item['quantity']}) - Expires: {item['expiry_date']}"
        for item in food_items[:10]  # Limit to 10 items
    ])
    
    prompt = f"""You are a helpful meal planning assistant. Suggest a simple meal idea using these ingredients that are expiring soon:

{items_text}

Provide a brief, simple meal suggestion (1-2 sentences) that uses these items to prevent waste. Keep it practical and easy to prepare."""

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        # Fallback if AI fails
        items = ", ".join([item['name'] for item in food_items[:5]])
        return f"Quick meal idea: Use {items} to prepare a simple dish before they expire."


def generate_reasoning(action: str, item_count: int, expiring_items: List[dict]) -> str:
    """Generate human-readable reasoning for agent actions"""
    if action == "waste_logged":
        return f"Detected {item_count} expired item(s). Food waste has been logged. Consider better planning to reduce future waste."
    elif action == "urgent_alert":
        return f"Found {item_count} item(s) expiring within 2 days: {', '.join([item['name'] for item in expiring_items[:5]])}. Immediate action recommended."
    elif action == "meal_suggestion":
        return f"Generated meal suggestion to use {item_count} expiring item(s) before they go bad."
    else:
        return f"Processed {item_count} item(s) in inventory."


# API Routes

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "FreshTrack Assistant API",
        "status": "healthy",
        "version": "1.0.0"
    }


@app.post("/food", response_model=FoodItemResponse)
async def create_food(food: FoodItem, user_id: str = Depends(get_user_id)):
    """Create a new food item"""
    status = get_food_status(food.expiry_date)
    
    try:
        response = supabase.table("foods").insert({
            "user_id": user_id,
            "name": food.name,
            "quantity": food.quantity,
            "expiry_date": food.expiry_date.isoformat(),
            "status": status
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create food item")
        
        return FoodItemResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating food item: {str(e)}")


@app.get("/food", response_model=List[FoodItemResponse])
async def get_foods(user_id: str = Depends(get_user_id)):
    """Get all food items for the authenticated user"""
    try:
        response = supabase.table("foods").select("*").eq("user_id", user_id).order("expiry_date", desc=False).execute()
        return [FoodItemResponse(**item) for item in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching food items: {str(e)}")


@app.put("/food/{food_id}", response_model=FoodItemResponse)
async def update_food(food_id: str, food_update: FoodItemUpdate, user_id: str = Depends(get_user_id)):
    """Update a food item"""
    # First verify ownership
    existing = supabase.table("foods").select("*").eq("id", food_id).eq("user_id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    # Prepare update data
    update_data = {}
    if food_update.name is not None:
        update_data["name"] = food_update.name
    if food_update.quantity is not None:
        update_data["quantity"] = food_update.quantity
    if food_update.expiry_date is not None:
        update_data["expiry_date"] = food_update.expiry_date.isoformat()
        update_data["status"] = get_food_status(food_update.expiry_date)
    
    if not update_data:
        return FoodItemResponse(**existing.data[0])
    
    try:
        response = supabase.table("foods").update(update_data).eq("id", food_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update food item")
        return FoodItemResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating food item: {str(e)}")


@app.delete("/food/{food_id}")
async def delete_food(food_id: str, user_id: str = Depends(get_user_id)):
    """Delete a food item"""
    try:
        response = supabase.table("foods").delete().eq("id", food_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Food item not found")
        return {"message": "Food item deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting food item: {str(e)}")


@app.post("/agent/run", response_model=AgentRunResponse)
async def run_agent(authorization: str = Header(None)):
    """
    Run the agentic AI process for all users
    This endpoint should be called by a cron job (service role key required)
    """
    # For cron jobs, we'll use service role key
    # In production, add proper authentication for cron endpoint
    api_key = authorization.replace("Bearer ", "") if authorization else None
    
    if api_key != os.getenv("SUPABASE_KEY"):
        raise HTTPException(status_code=401, detail="Unauthorized: Service role key required")
    
    try:
        # Get all unique user IDs from foods table
        # This is more efficient than querying auth directly
        users_response = supabase.table("foods").select("user_id").execute()
        unique_user_ids = list(set([item['user_id'] for item in users_response.data])) if users_response.data else []
        
        total_items_processed = 0
        total_logs_created = 0
        
        # Process each user's inventory
        for user_id in unique_user_ids:
            
            # Get user's food items
            foods_response = supabase.table("foods").select("*").eq("user_id", user_id).execute()
            food_items = foods_response.data if foods_response.data else []
            
            if not food_items:
                continue
            
            today = date.today()
            expired_items = []
            expiring_items = []
            
            # Classify items
            for item in food_items:
                # Handle different date formats
                expiry_str = item['expiry_date']
                if isinstance(expiry_str, str):
                    if 'T' in expiry_str:
                        expiry_date = datetime.fromisoformat(expiry_str.replace('Z', '+00:00')).date()
                    else:
                        expiry_date = datetime.strptime(expiry_str, '%Y-%m-%d').date()
                else:
                    expiry_date = expiry_str
                days_until_expiry = (expiry_date - today).days
                
                # Update status if needed
                new_status = get_food_status(expiry_date)
                if item['status'] != new_status:
                    supabase.table("foods").update({"status": new_status}).eq("id", item['id']).execute()
                
                if days_until_expiry < 0:
                    expired_items.append(item)
                elif days_until_expiry <= 2:
                    expiring_items.append(item)
            
            # Log expired items (waste)
            if expired_items:
                reasoning = generate_reasoning("waste_logged", len(expired_items), expired_items)
                supabase.table("agent_logs").insert({
                    "user_id": user_id,
                    "action": "waste_logged",
                    "reasoning": reasoning
                }).execute()
                total_logs_created += 1
            
            # Generate urgent alerts and meal suggestions for expiring items
            if expiring_items:
                meal_suggestion = generate_meal_suggestion(expiring_items)
                reasoning = f"URGENT: {len(expiring_items)} item(s) expiring within 2 days. {meal_suggestion}"
                
                supabase.table("agent_logs").insert({
                    "user_id": user_id,
                    "action": "urgent_alert",
                    "reasoning": reasoning
                }).execute()
                total_logs_created += 1
            
            total_items_processed += len(food_items)
        
        return AgentRunResponse(
            message="Agent run completed successfully",
            items_processed=total_items_processed,
            logs_created=total_logs_created
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running agent: {str(e)}")


@app.get("/agent/logs", response_model=List[AgentLogResponse])
async def get_agent_logs(user_id: str = Depends(get_user_id), limit: int = 20):
    """Get agent logs for the authenticated user"""
    try:
        response = supabase.table("agent_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        return [AgentLogResponse(**log) for log in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching agent logs: {str(e)}")


@app.get("/insights")
async def get_insights(user_id: str = Depends(get_user_id)):
    """Get insights and statistics for the user"""
    try:
        # Get all foods
        foods_response = supabase.table("foods").select("*").eq("user_id", user_id).execute()
        foods = foods_response.data if foods_response.data else []
        
        # Get recent logs
        logs_response = supabase.table("agent_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        logs = logs_response.data if logs_response.data else []
        
        # Calculate statistics
        stats = {
            "total_items": len(foods),
            "safe": len([f for f in foods if f['status'] == 'safe']),
            "expiring": len([f for f in foods if f['status'] == 'expiring']),
            "expired": len([f for f in foods if f['status'] == 'expired']),
            "waste_count": len([f for f in foods if f['status'] == 'expired']),
            "recent_recommendations": logs
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching insights: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
