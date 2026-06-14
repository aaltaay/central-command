import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv(r"C:\Users\aalta\.gemini\antigravity\.env.secrets")
apify_token = os.getenv("APIFY_API_KEY")

actor_id = "louisdeconinck~instagram-following-scraper"
url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={apify_token}"

# Payload for the following scraper
payload = {
    "usernames": ["ahmi.x012"],
    "maxItems": 20  # Keep it small for a quick test
}

print(f"Starting {actor_id} for @ahmi.x012...")
response = requests.post(url, json=payload)
if not response.ok:
    print(f"Failed to start actor: {response.text}")
    exit(1)

run_data = response.json().get('data', {})
run_id = run_data.get('id')
dataset_id = run_data.get('defaultDatasetId')

print(f"Run started! Run ID: {run_id}")

status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={apify_token}"
while True:
    res = requests.get(status_url)
    status = res.json().get('data', {}).get('status')
    if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
        print(f"Status: {status}")
        break
    time.sleep(3)

if status == "SUCCEEDED":
    dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={apify_token}"
    data_res = requests.get(dataset_url)
    items = data_res.json()
    
    with open("following_scraper_out.json", "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    print(f"Dumped {len(items)} items to following_scraper_out.json")
    if items:
        print("\nFirst 3 accounts you follow:")
        for item in items[:3]:
            print(f"- @{item.get('username')} ({item.get('fullName')})")
