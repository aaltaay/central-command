import requests
import json
import time
import os

from dotenv import load_dotenv

# Load env variables from global secrets
load_dotenv(r"C:\Users\aalta\.gemini\antigravity\.env.secrets")
apify_token = os.getenv("APIFY_API_KEY")

# We'll use apify/instagram-profile-scraper as it's the most robust for pure profile data
actor_id = "apify~instagram-profile-scraper"
url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={apify_token}"

# Payload for the profile scraper
payload = {
    "usernames": ["ahmi.x012"]
}

print(f"Starting Actor {actor_id} for @ahmi.x012...")
response = requests.post(url, json=payload)
if not response.ok:
    print(f"Failed to start actor: {response.text}")
    exit(1)

run_data = response.json().get('data', {})
run_id = run_data.get('id')
dataset_id = run_data.get('defaultDatasetId')

print(f"Run started successfully! Run ID: {run_id}")
print("Waiting for run to finish (this might take 15-45 seconds)...")

# Poll for completion
status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={apify_token}"
while True:
    res = requests.get(status_url)
    status = res.json().get('data', {}).get('status')
    if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
        print(f"Run finished with status: {status}")
        break
    time.sleep(3)

if status == "SUCCEEDED":
    print("\nFetching dataset results...")
    dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={apify_token}"
    data_res = requests.get(dataset_url)
    items = data_res.json()
    
    if items:
        # Print a nice summary of the profile
        profile = items[0]
        print("\n--- INSTAGRAM PROFILE DATA ---")
        print(f"Username: {profile.get('username')}")
        print(f"Full Name: {profile.get('fullName')}")
        print(f"Followers: {profile.get('followersCount')}")
        print(f"Following: {profile.get('followsCount')}")
        print(f"Posts: {profile.get('postsCount')}")
        print(f"Biography: {profile.get('biography')}")
        print(f"Is Verified: {profile.get('isVerified')}")
        print(f"Is Private: {profile.get('isPrivate')}")
        print(f"Profile Pic URL: {profile.get('profilePicUrlHD') or profile.get('profilePicUrl')}")
        print("------------------------------")
    else:
        print("No items found in dataset. Make sure the profile is public or exists.")
