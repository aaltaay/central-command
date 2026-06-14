import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv(r"C:\Users\aalta\.gemini\antigravity\.env.secrets")
token = os.getenv("APIFY_API_KEY")

tests = [
    {
        "actor": "apify~instagram-reel-scraper",
        "payload": {"username": ["ahmi.x012"], "resultsLimit": 1}
    },
    {
        "actor": "apify~instagram-tagged-scraper",
        "payload": {"username": ["ahmi.x012"], "resultsLimit": 5}
    }
]

results = {}

for test in tests:
    actor_id = test["actor"]
    payload = test["payload"]
    print(f"\n--- Testing {actor_id} ---")
    url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={token}"
    res = requests.post(url, json=payload)
    if not res.ok:
        print(f"Failed to start {actor_id}: {res.text}")
        results[actor_id] = {"status": "START_FAILED", "error": res.text}
        continue
    
    run_data = res.json().get('data', {})
    run_id = run_data.get('id')
    dataset_id = run_data.get('defaultDatasetId')
    print(f"Started run {run_id}. Waiting...")
    
    status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={token}"
    while True:
        status_res = requests.get(status_url)
        status = status_res.json().get('data', {}).get('status')
        if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
            print(f"Status: {status}")
            break
        time.sleep(3)
        
    if status == "SUCCEEDED":
        dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={token}"
        data_res = requests.get(dataset_url)
        items = data_res.json()
        print(f"Fetched {len(items)} items.")
        results[actor_id] = {
            "status": "SUCCEEDED",
            "item_count": len(items),
            "first_item": items[0] if items else None
        }
    else:
        results[actor_id] = {"status": status}

with open("batch_test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print("\nDumped results to batch_test_results.json")
