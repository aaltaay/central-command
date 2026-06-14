import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv(r"C:\Users\aalta\.gemini\antigravity\.env.secrets")
apify_token = os.getenv("APIFY_API_KEY")

actor_id = "apify~instagram-api-scraper"
url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={apify_token}"

# Payload for the API scraper
payload = {
    "directUrls": ["https://www.instagram.com/ahmi.x012"],
    "resultsType": "details"
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
    
    with open("api_scraper_out.json", "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    print("Dumped items to api_scraper_out.json")
