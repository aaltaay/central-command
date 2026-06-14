import argparse
import json
import os
import time
from datetime import datetime
from dotenv import load_dotenv
from apify_client import ApifyClient

def get_apify_token():
    secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
    if os.path.exists(secrets_path):
        load_dotenv(secrets_path)
    return os.getenv("APIFY_API_KEY")

def main():
    parser = argparse.ArgumentParser(description="Master Apify Google Places Scraper (Local Skill)")
    parser.add_argument("--search", "-s", action="append", required=True,
                        help="Search query (e.g., 'Tesla PPF installers in Los Angeles'). Can pass multiple times.")
    parser.add_argument("--limit", "-l", type=int, default=5,
                        help="Maximum number of places to scrape per search (default: 5).")
    parser.add_argument("--contacts", action="store_true",
                        help="Enable Company Contacts enrichment (social media, basic emails). COSTS EXTRA.")
    parser.add_argument("--leads", action="store_true",
                        help="Enable Business Leads enrichment (employee details, LinkedIn). COSTS EXTRA.")
    parser.add_argument("--verify-emails", action="store_true",
                        help="Enable email verification (requires --leads). COSTS EXTRA.")
    parser.add_argument("--reviews", type=int, default=0,
                        help="Number of reviews to fetch per place (e.g., 5).")

    args = parser.parse_args()

    token = get_apify_token()
    if not token:
        print("Error: APIFY_API_KEY not found in environment or .env.secrets")
        return

    client = ApifyClient(token)

    run_input = {
        "searchStringsArray": args.search,
        "maxCrawledPlacesPerSearch": args.limit,
        "language": "en",
        "extractCompanyContacts": args.contacts,
        "extractBusinessLeads": args.leads,
        "verifyLeadsEnrichmentEmails": args.verify_emails,
        "maxReviewsPerPlace": args.reviews,
    }

    print("Triggering Apify Google Places Scraper (compass/crawler-google-places)...")
    print(f"Queries: {args.search}")
    print(f"Limit per query: {args.limit}")
    print(f"Enrichments - Contacts: {args.contacts}, Leads: {args.leads}, Verify Emails: {args.verify_emails}")
    
    try:
        run = client.actor("nwua9Gu5YrADL7ZDj").call(run_input=run_input)
        
        print(f"Run finished. Status: {run['status']}")
        
        print("Fetching results from dataset...")
        dataset_id = run["defaultDatasetId"]
        items = list(client.dataset(dataset_id).iterate_items())
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_query = "".join(x for x in args.search[0] if x.isalnum() or x in "-_")[:20]
        out_file = f"places_{safe_query}_{timestamp}.json"
        
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
            
        print(f"\n[SUCCESS] Scraped {len(items)} places.")
        print(f"Data saved locally to: {out_file}")
        
    except Exception as e:
        print(f"\n[ERROR] Error during execution: {e}")

if __name__ == "__main__":
    main()
