import os
import asyncio
import psycopg2
from psycopg2.extras import DictCursor
from google import genai
from google.genai import types
from dotenv import load_dotenv
from playwright.async_api import async_playwright
import json

# Load secrets
secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
if os.path.exists(secrets_path):
    load_dotenv(secrets_path)

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_DB_URL or not GEMINI_API_KEY:
    print("Error: Missing SUPABASE_DB_URL or GEMINI_API_KEY in .env.secrets")
    exit(1)

# Initialize Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

def get_db_connection():
    url = SUPABASE_DB_URL
    if "db.tulkhaeurclnbshxuqhn.supabase.co" in url:
        url = url.replace("db.tulkhaeurclnbshxuqhn.supabase.co", "aws-0-us-west-2.pooler.supabase.com")
        url = url.replace("postgres:", "postgres.tulkhaeurclnbshxuqhn:")
        url = url.replace(":5432", ":6543")
    return psycopg2.connect(url)

async def scrape_with_playwright(url):
    print(f"[{url}] Capturing website...")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            
            # Extract text
            text = await page.evaluate("document.body.innerText")
            
            # Take screenshot
            screenshot_bytes = await page.screenshot(full_page=True)
            
            await browser.close()
            return text[:15000], screenshot_bytes
    except Exception as e:
        print(f"[{url}] Failed to scrape: {e}")
        return None, None

def analyze_revenue_leak(website_text, screenshot_bytes, business_name):
    prompt = f"""
    You are an expert Med-Spa growth consultant and business analyst.
    Analyze the attached screenshot and the text from {business_name}'s website.
    
    1. Extract the following structural metrics:
       - Staff Count: Look for a Team or About page (or list of providers). Count them. If unclear, assume 2.
       - Services Count: Look at their menu. How many distinct service categories/items do they have? If unclear, assume 10.
       - Locations: Do they have multiple physical locations? If unclear, assume 1.
       
    2. Identify Vulnerabilities:
       - Do they rely on a "Call Now" button?
       - Do they lack an automated 24/7 online booking calendar?
       
    3. Calculate Estimated Weekly Calls & Lost Revenue based on industry capacity formulas:
       - Estimated Daily Calls = (Staff Count * 12 clients/day * 1.8 call ratio) + (Services Count * 1.2 inquiry calls) * Location Multiplier (1.0 for 1, 1.3 for 2+)
       - Estimated Weekly Calls = Daily Calls * 5 operating days * 0.75 (missed hours adjustment)
       - Weekly Lost Revenue = (Estimated Weekly Calls * 0.40 missed rate) * 0.25 conversion * $350 average service value
       
    4. Draft a highly personalized 'ai_hook' for a cold email.
       Format: "Hey [Name if found, else 'Team'], based on the size of your team ([Staff Count] providers) and your service menu, industry data suggests you're likely fielding over [Estimated Weekly Calls] calls a week... At a $350 average ticket, missing 40% of peak-hour calls means roughly $[Monthly Lost Revenue] a month going to voicemail. We install AI Voice Receptionists that capture 95% of those missed calls..."
    
    Website Text:
    {website_text}
    """
    
    try:
        parts = [prompt]
        if screenshot_bytes:
             parts.insert(0, types.Part.from_bytes(data=screenshot_bytes, mime_type='image/png'))
             
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=parts,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "staff_count": {"type": "INTEGER"},
                        "services_count": {"type": "INTEGER"},
                        "locations_count": {"type": "INTEGER"},
                        "estimated_weekly_calls": {"type": "INTEGER"},
                        "weekly_lost_revenue": {"type": "INTEGER"},
                        "vulnerabilities": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "ai_hook": {"type": "STRING"}
                    },
                    "required": ["staff_count", "services_count", "locations_count", "estimated_weekly_calls", "weekly_lost_revenue", "ai_hook"]
                },
            ),
        )
        data = json.loads(response.text)
        return data
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return None

async def process_lead(lead):
    url = lead['website']
    name = lead['business_name']
    lead_id = lead['id']
    print(f"\n--- Processing Lead: {name} ---")
    if not url:
        print("No website found. Skipping.")
        return
        
    if not url.startswith('http'):
        url = 'https://' + url
        
    text, screenshot = await scrape_with_playwright(url)
    if text and screenshot:
        print(f"[{url}] Scraped successfully. Analyzing with Gemini...")
        analysis = analyze_revenue_leak(text, screenshot, name)
        if analysis:
            print(f"Analysis Complete for {name}:")
            print(f"  Staff: {analysis.get('staff_count')}, Services: {analysis.get('services_count')}")
            print(f"  Est Weekly Calls: {analysis.get('estimated_weekly_calls')}")
            print(f"  Weekly Lost Revenue: ${analysis.get('weekly_lost_revenue')}")
            print(f"  AI Hook: {analysis.get('ai_hook')}")
            
            # Save analysis to DB
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute(
                    "UPDATE leads SET ai_hook = %s, status = 'analyzed' WHERE id = %s",
                    (analysis.get('ai_hook'), lead_id)
                )
                conn.commit()
                cur.close()
                conn.close()
                print(f"[{url}] Saved to Supabase CRM.")
            except Exception as e:
                print(f"Error updating DB: {e}")

async def main():
    print("Fetching top 5 'new' leads from CRM...")
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        cur.execute("SELECT id, business_name, website FROM leads WHERE status = 'new' AND website IS NOT NULL LIMIT 5;")
        leads = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")
        return

    if not leads:
        print("No new leads with websites found in the DB.")
        return

    # Process concurrently using asyncio
    tasks = [process_lead(lead) for lead in leads]
    await asyncio.gather(*tasks)
    print("\nPilot completed.")

if __name__ == "__main__":
    asyncio.run(main())
