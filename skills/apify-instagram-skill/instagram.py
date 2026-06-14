import requests
import json
import time
import os
import argparse
from dotenv import load_dotenv

def get_apify_token():
    secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
    if os.path.exists(secrets_path):
        load_dotenv(secrets_path)
    return os.getenv("APIFY_API_KEY")

def trigger_apify_actor(actor_id: str, payload: dict) -> list:
    """
    Triggers an Apify actor, polls for completion, and returns the dataset items.
    """
    token = get_apify_token()
    if not token:
        raise ValueError("APIFY_API_KEY not found in environment or .env.secrets")

    url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={token}"
    
    print(f"Triggering {actor_id}...")
    response = requests.post(url, json=payload)
    if not response.ok:
        raise Exception(f"Failed to start Apify actor: {response.text}")

    run_data = response.json().get('data', {})
    run_id = run_data.get('id')
    dataset_id = run_data.get('defaultDatasetId')

    print(f"Run started successfully (ID: {run_id}). Polling for completion...")

    status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={token}"
    while True:
        res = requests.get(status_url)
        status = res.json().get('data', {}).get('status')
        if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
            break
        time.sleep(3)

    if status == "SUCCEEDED":
        dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={token}"
        data_res = requests.get(dataset_url)
        return data_res.json()
    else:
        raise Exception(f"Apify run finished with non-success status: {status}")

def main():
    parser = argparse.ArgumentParser(description="Master Apify Instagram Scraper (Offline/Local Skill)")
    parser.add_argument("--action", required=True, choices=["profile", "advanced", "hashtag", "reel", "comments", "tagged"],
                        help="The scraping action to perform.")
    parser.add_argument("--target", help="The target username, hashtag, or keyword (depends on action).")
    parser.add_argument("--url", help="The direct URL to scrape (for reel, comments, or advanced actions).")
    parser.add_argument("--limit", type=int, default=5, help="Number of results to fetch (default: 5).")
    
    args = parser.parse_args()
    
    if not args.target and not args.url:
        print("Error: You must provide either --target or --url.")
        return

    payload = {}
    actor_id = ""

    # Route the action to the specific highly-optimized Apify actor
    if args.action == "profile":
        if not args.target:
            print("Error: --target (username) is required for 'profile' action.")
            return
        actor_id = "apify~instagram-profile-scraper"
        payload = {
            "usernames": [args.target]
        }
    
    elif args.action == "advanced":
        actor_id = "apify~instagram-api-scraper"
        if args.url:
            payload = {"directUrls": [args.url], "resultsType": "details"}
        else:
            payload = {
                "search": args.target,
                "searchType": "user",
                "resultsType": "details",
                "searchLimit": args.limit
            }
            
    elif args.action == "hashtag":
        if not args.target:
            print("Error: --target (hashtag without #) is required for 'hashtag' action.")
            return
        actor_id = "apify~instagram-hashtag-scraper"
        payload = {
            "hashtags": [args.target.replace("#", "")],
            "resultsLimit": args.limit
        }
        
    elif args.action == "reel":
        actor_id = "apify~instagram-reel-scraper"
        if args.url:
            payload = {"directUrls": [args.url]}
        elif args.target:
            payload = {"username": [args.target], "resultsLimit": args.limit}
            
    elif args.action == "comments":
        if not args.url:
            print("Error: --url is required for 'comments' action.")
            return
        actor_id = "apify~instagram-comment-scraper"
        payload = {
            "directUrls": [args.url],
            "resultsLimit": args.limit
        }
        
    elif args.action == "tagged":
        if not args.target:
            print("Error: --target (username) is required for 'tagged' action.")
            return
        actor_id = "apify~instagram-tagged-scraper"
        payload = {
            "username": [args.target],
            "resultsLimit": args.limit
        }

    try:
        data = trigger_apify_actor(actor_id, payload)
        if data:
            identifier = args.target or "url_scrape"
            safe_id = "".join(x for x in identifier if x.isalnum() or x in "-_")
            out_file = f"{args.action}_{safe_id}_results.json"
            
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"\n[SUCCESS] Scraped {len(data)} items.")
            print(f"Data saved locally to: {out_file}")
        else:
            print("\n[WARNING] Run succeeded but returned empty dataset. Check your inputs or API limits.")
            
    except Exception as e:
        print(f"\n[ERROR] Error during execution: {e}")

if __name__ == "__main__":
    main()
