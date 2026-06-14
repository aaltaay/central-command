import requests
import time
import os
import argparse
import json
from dotenv import load_dotenv

def get_apify_token():
    secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
    if os.path.exists(secrets_path):
        load_dotenv(secrets_path)
    return os.getenv("APIFY_API_KEY")

def scrape_instagram_advanced(search_query: str, search_type: str = "user", limit: int = 1) -> list:
    """
    Scrapes Instagram using the powerful instagram-api-scraper.
    Supports posts, profiles, places, and hashtags.
    
    Args:
        search_query (str): The keyword, URL, or username.
        search_type (str): 'user', 'hashtag', 'place', or 'url'
        limit (int): How many results to fetch
        
    Returns:
        list: The JSON response list.
    """
    token = get_apify_token()
    if not token:
        raise ValueError("APIFY_API_KEY not found in environment or .env.secrets")

    actor_id = "apify~instagram-api-scraper"
    url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={token}"

    if search_type == "url":
        payload = {"directUrls": [search_query], "resultsType": "details"}
    else:
        payload = {
            "search": search_query,
            "searchType": search_type,
            "resultsType": "details",
            "searchLimit": limit
        }
    
    # 1. Trigger the Actor
    response = requests.post(url, json=payload)
    if not response.ok:
        raise Exception(f"Failed to start Apify actor: {response.text}")

    run_data = response.json().get('data', {})
    run_id = run_data.get('id')
    dataset_id = run_data.get('defaultDatasetId')

    # 2. Poll the API until the run finishes
    status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={token}"
    while True:
        res = requests.get(status_url)
        status = res.json().get('data', {}).get('status')
        if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
            break
        time.sleep(3)

    # 3. Retrieve the final dataset if successful
    if status == "SUCCEEDED":
        dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={token}"
        data_res = requests.get(dataset_url)
        return data_res.json()
    else:
        raise Exception(f"Apify run finished with non-success status: {status}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Advanced Instagram Scraper via Apify API.")
    parser.add_argument("query", help="What to search for (e.g., username, hashtag, or URL)")
    parser.add_argument("--type", choices=["user", "hashtag", "place", "url"], default="user", help="Type of search")
    parser.add_argument("--limit", type=int, default=1, help="Number of results to return")
    args = parser.parse_args()

    print(f"Running advanced scrape for '{args.query}' (type: {args.type})...")
    try:
        data = scrape_instagram_advanced(args.query, args.type, args.limit)
        if data:
            print(f"\n--- SUCCESS ---")
            print(f"Extracted {len(data)} items.")
            
            # Safely save the output
            safe_query = "".join(x for x in args.query if x.isalnum() or x in "-_")
            out_file = f"{safe_query}_results.json"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            print(f"Full JSON data dumped to {out_file}")
        else:
            print("No data found.")
    except Exception as e:
        print(f"Error: {e}")
