import os
import time
import json
import requests
from dotenv import load_dotenv

# Load secrets from the global .env.secrets file
global_secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(global_secrets_path)

APIFY_TOKEN = os.getenv("APIFY_API_KEY") # This maps to the key in .env.secrets
ACTOR_ID = "louisdeconinck~instagram-following-scraper"

def prompt_cookie_update():
    """Provides a clear, unmissable prompt to update cookies, and opens the secrets file."""
    print("\n" + "="*60)
    print("\033[91m🚨 INSTAGRAM COOKIES EXPIRED OR INVALID 🚨\033[0m")
    print("="*60)
    print("Your Apify Instagram scraper needs a fresh login session.")
    print("\n\033[93mFollow these steps without thinking:\033[0m")
    print("1. Go to Instagram.com in your browser (make sure you are logged in).")
    print("2. Click your Cookie-Editor or EditThisCookie extension.")
    print("3. Click 'Export' to copy the JSON array.")
    print("4. Paste it as the value for INSTAGRAM_COOKIES_JSON in your secrets file.")
    print("   (It should look like: INSTAGRAM_COOKIES_JSON='[{\"domain\":...}]')")
    print("\nOpening your secrets file now...")
    print("="*60 + "\n")
    
    try:
        os.startfile(global_secrets_path)
    except Exception as e:
        print(f"Could not open secrets file automatically: {e}")
        print(f"Please manually open: {global_secrets_path}")


def get_instagram_followings(target_username, max_items=100):
    """
    Scrapes the followings of a target Instagram account using Apify.
    Automatically catches expired cookie errors and guides the user.
    """
    cookies_json_str = os.getenv("INSTAGRAM_COOKIES_JSON")
    
    if not cookies_json_str:
        print("INSTAGRAM_COOKIES_JSON is missing from your .env.secrets!")
        prompt_cookie_update()
        return []

    try:
        # Validate that it's a valid JSON string before sending
        cookies_list = json.loads(cookies_json_str)
    except json.JSONDecodeError:
        print("Your INSTAGRAM_COOKIES_JSON is not a valid JSON string.")
        prompt_cookie_update()
        return []

    print(f"Starting Apify scraper for {target_username}...")
    start_url = f"https://api.apify.com/v2/acts/{ACTOR_ID}/runs?token={APIFY_TOKEN}"
    
    payload = {
        "cookies": json.dumps(cookies_list),
        "usernames": [target_username],
        "maxItems": max_items
    }
    
    headers = {"Content-Type": "application/json"}
    start_resp = requests.post(start_url, json=payload, headers=headers)
    
    if start_resp.status_code not in (200, 201):
        print(f"Failed to start actor. Error: {start_resp.text}")
        return []

    run_data = start_resp.json()["data"]
    run_id = run_data["id"]
    dataset_id = run_data["defaultDatasetId"]
    status = run_data["status"]
    
    print(f"Run started! (ID: {run_id}). Waiting for completion...")

    while status in ["READY", "RUNNING"]:
        time.sleep(3)
        status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={APIFY_TOKEN}"
        status_resp = requests.get(status_url).json()
        status = status_resp["data"]["status"]

    if status != "SUCCEEDED":
        print(f"Run failed with status: {status}")
        return []

    # Fetch results
    dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={APIFY_TOKEN}"
    results = requests.get(dataset_url).json()
    
    # Check for the specific Apify error message indicating bad cookies
    if len(results) > 0 and results[0].get("message") and "Free users need to provide valid Instagram cookies" in results[0].get("message"):
        prompt_cookie_update()
        return []
        
    print(f"Successfully pulled {len(results)} followings for {target_username}.")
    return results

if __name__ == "__main__":
    # Test the module
    followings = get_instagram_followings("ahmi.x012", max_items=10)
    if followings:
        for f in followings:
            print(f"- {f.get('username')}: {f.get('fullName')}")
