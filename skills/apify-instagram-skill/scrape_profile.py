import requests
import time
import os
import argparse
import json
from dotenv import load_dotenv

def get_apify_token():
    """
    Attempts to securely load the APIFY_API_KEY from the global .env.secrets file.
    """
    secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
    if os.path.exists(secrets_path):
        load_dotenv(secrets_path)
    return os.getenv("APIFY_API_KEY")

def scrape_instagram_profile(username: str) -> dict:
    """
    Scrapes an Instagram profile using Apify's instagram-profile-scraper.
    Returns a dictionary containing the profile data and recent posts.
    
    Args:
        username (str): The Instagram username to scrape (without the @).
        
    Returns:
        dict: The full JSON response from Apify for this user profile.
    """
    token = get_apify_token()
    if not token:
        raise ValueError("APIFY_API_KEY not found in environment or .env.secrets")

    actor_id = "apify~instagram-profile-scraper"
    url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={token}"

    payload = {"usernames": [username]}
    
    # 1. Trigger the Actor
    response = requests.post(url, json=payload)
    if not response.ok:
        raise Exception(f"Failed to start Apify actor: {response.text}")

    run_data = response.json().get('data', {})
    run_id = run_data.get('id')
    dataset_id = run_data.get('defaultDatasetId')

    # 2. Poll the API until the run finishes (takes ~15-45 seconds)
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
        items = data_res.json()
        if items:
            return items[0]
        return {}
    else:
        raise Exception(f"Apify run finished with non-success status: {status}")

if __name__ == "__main__":
    # Command Line Interface (CLI)
    parser = argparse.ArgumentParser(description="Scrape an Instagram profile via Apify API.")
    parser.add_argument("username", help="Instagram username to scrape (e.g., ahmi.x012)")
    args = parser.parse_args()

    print(f"Scraping @{args.username} (this will take 15-45 seconds)...")
    try:
        data = scrape_instagram_profile(args.username)
        if data:
            print(f"\n--- SUCCESS ---")
            print(f"Name: {data.get('fullName')}")
            print(f"Followers: {data.get('followersCount')} | Posts: {data.get('postsCount')}")
            
            # Safely save the output to JSON, handling weird unicode characters
            out_file = f"{args.username}_profile.json"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            print(f"Full profile JSON data dumped to {out_file}")
        else:
            print("No data found. Is the profile private, deleted, or mistyped?")
    except Exception as e:
        print(f"Error: {e}")
