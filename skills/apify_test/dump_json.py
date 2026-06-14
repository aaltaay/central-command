import requests
import json
import os
from dotenv import load_dotenv

load_dotenv(r"C:\Users\aalta\.gemini\antigravity\.env.secrets")
apify_token = os.getenv("APIFY_API_KEY")

dataset_id = "pbAeD0zhZE6QfQu0N" # we'll just pull from the run ID
dataset_url = f"https://api.apify.com/v2/actor-runs/{dataset_id}/dataset/items?token={apify_token}"
res = requests.get(dataset_url)

with open("out.json", "w", encoding="utf-8") as f:
    json.dump(res.json(), f, indent=2, ensure_ascii=False)
