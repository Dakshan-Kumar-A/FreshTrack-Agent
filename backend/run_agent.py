"""
Standalone script to run the agent
Can be used with Render Cron Jobs
"""

import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

def run_agent():
    """Call the agent endpoint"""
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_key:
        print("ERROR: SUPABASE_KEY not set")
        sys.exit(1)
    
    try:
        response = requests.post(
            f"{backend_url}/agent/run",
            headers={"Authorization": f"Bearer {supabase_key}"},
            timeout=300
        )
        response.raise_for_status()
        result = response.json()
        print(f"SUCCESS: {result['message']}")
        print(f"Items processed: {result['items_processed']}")
        print(f"Logs created: {result['logs_created']}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_agent()
