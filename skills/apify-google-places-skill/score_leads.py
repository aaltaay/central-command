import json
import os
import argparse
from bs4 import BeautifulSoup
from google import genai
from google.genai import types
from dotenv import load_dotenv
import requests

# Load secrets
secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
if os.path.exists(secrets_path):
    load_dotenv(secrets_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Error: Missing GEMINI_API_KEY in .env.secrets")
    exit(1)

# Initialize Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

# ==============================================================================
# CORE AI SKILL
# ==============================================================================
def run_gemini_analysis(prompt: str, schema: dict) -> dict:
    """
    Core AI capability to run structured analysis using Gemini 2.5 Flash.
    This remains untouched and reusable for other verticals.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return None

# ==============================================================================
# MED-SPA SPECIFIC WRAPPER
# ==============================================================================
def score_medspa_lead(place_data, website_text, reviews_text=""):
    """
    Med-Spa specific scoring wrapper that evaluates the business volume 
    and the opportunity to sell high-ROI services.
    """
    if not website_text and not reviews_text:
        return 0, "No website or reviews found.", "Low", []
        
    title = place_data.get('title', 'Business')
    review_count = place_data.get('reviewsCount', 0)
    
    prompt = f"""
    You are an expert sales analyst for a B2B SaaS/Marketing agency targeting Medical Spas.
    Analyze the following data for "{title}".
    
    We want to find Med-Spas that are leaking revenue and desperately need high-ROI systems such as:
    1. Missed Call Text-Back Systems
    2. Automated Lead Nurturing
    3. Patient Reactivation Campaigns
    4. No-Show Reduction (Automated reminders)
    5. Online Booking Optimization
    
    Based on their website text and customer reviews, evaluate:
    - **Business Volume Proxy:** Is this a high-volume business? (Look for cues: multiple locations mentioned, large team size, sophisticated booking platform like Zenoti/Mindbody vs basic form, high review count = {review_count}).
    - **Opportunity Score (0-100):** How badly do they need our high-ROI systems? 
      * High Opportunity (80-100): Mentions "hard to reach", complaints about booking, outdated website, no clear online booking.
      * Low Opportunity (0-30): Highly optimized site, clear online booking, automated systems clearly in place.
    
    Website Text:
    {website_text[:15000]} # Limit tokens
    
    Customer Reviews:
    {reviews_text}
    """
    
    schema = {
        "type": "OBJECT",
        "properties": {
            "business_volume_estimate": {
                "type": "STRING", 
                "description": "Estimated scale: 'Small', 'Medium', or 'High' based on locations, team size, booking tools, and review count."
            },
            "opportunity_score": {
                "type": "INTEGER", 
                "description": "0-100 score on how badly they need high-ROI revenue recovery systems."
            },
            "ai_hook": {
                "type": "STRING", 
                "description": "A highly personalized 2-sentence cold email hook. Mention a specific high-ROI system (e.g., missed call text-back or reactivation) that fits their profile."
            },
            "identified_leaks": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "List of potential revenue leaks identified (e.g., 'Poor online booking', 'Complaints about unreachable staff')."
            }
        },
        "required": ["business_volume_estimate", "opportunity_score", "ai_hook", "identified_leaks"]
    }
    
    result = run_gemini_analysis(prompt, schema)
    if result:
        return (
            result.get("opportunity_score", 0),
            result.get("ai_hook", ""),
            result.get("business_volume_estimate", "Unknown"),
            result.get("identified_leaks", [])
        )
    return 0, "Error generating hook.", "Unknown", []

def calculate_trust_score(place):
    score = 0
    if place.get('isClaimed'): score += 30
    reviews = place.get('reviewsCount', 0)
    rating = place.get('totalScore', 0)
    if reviews > 50: score += 40
    elif reviews > 10: score += 20
    elif reviews > 0: score += 10
    if rating >= 4.0: score += 30
    return min(score, 100)

def scrape_website(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        for script in soup(["script", "style"]):
            script.extract()
        text = soup.get_text(separator=' ', strip=True)
        return text[:15000]
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Med-Spa Lead Scorer - PoC Mode")
    parser.add_argument("--file", "-f", required=True, help="Path to the Apify JSON output file from places.py")
    parser.add_argument("--limit", "-l", type=int, default=5, help="Number of leads to process for PoC")
    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"File not found: {args.file}")
        return

    with open(args.file, 'r', encoding='utf-8') as f:
        places = json.load(f)
        
    print(f"Loaded {len(places)} places from {args.file}")
    
    places_to_process = places[:args.limit]
    output_leads = []

    for place in places_to_process:
        maps_url = place.get('url')
        if not maps_url:
            continue
            
        title = place.get('title', '')
        try:
            print(f"Processing: {title}")
        except UnicodeEncodeError:
            print(f"Processing: {title.encode('ascii', 'replace').decode('ascii')}")
        
        trust_score = calculate_trust_score(place)
        opportunity_score = 0
        ai_hook = ""
        volume_estimate = "Unknown"
        leaks = []
        website = place.get('website')
        
        if trust_score >= 30 and website:
            print(f"  -> Scraping website...")
            website_text = scrape_website(website)
            
            reviews = place.get('reviews', [])
            reviews_text = "\n".join([r.get('text', '') for r in reviews if r.get('text')])
            
            if website_text or reviews_text:
                opportunity_score, ai_hook, volume_estimate, leaks = score_medspa_lead(place, website_text, reviews_text)
                try:
                    print(f"  -> Opp Score: {opportunity_score} | Vol Estimate: {volume_estimate}")
                    print(f"  -> Leaks Identified: {', '.join(leaks)}")
                    print(f"  -> Hook: {ai_hook}")
                except UnicodeEncodeError:
                    safe_leaks = ', '.join(leaks).encode('ascii', 'replace').decode('ascii')
                    safe_hook = ai_hook.encode('ascii', 'replace').decode('ascii')
                    print(f"  -> Opp Score: {opportunity_score} | Vol Estimate: {volume_estimate}")
                    print(f"  -> Leaks Identified: {safe_leaks}")
                    print(f"  -> Hook: {safe_hook}")
        else:
            if not website:
                ai_hook = "No website found. Perfect candidate for our full automated booking and lead recovery system."
                opportunity_score = 90
            else:
                ai_hook = "Low trust score. Likely a very small operation or ghost town."
        
        output_leads.append({
            "business_name": place.get('title'),
            "address": place.get('address'),
            "phone": place.get('phoneUnformatted', place.get('phone')),
            "website": website,
            "google_maps_url": maps_url,
            "trust_score": trust_score,
            "opportunity_score": opportunity_score,
            "ai_hook": ai_hook,
            "business_volume_estimate": volume_estimate,
            "identified_leaks": leaks,
            "status": "new"
        })

    with open("scored_leads_output.json", "w", encoding="utf-8") as f:
        json.dump(output_leads, f, indent=2)
        
    print(f"\n[DONE] Saved {len(output_leads)} processed leads to scored_leads_output.json")

if __name__ == "__main__":
    main()
