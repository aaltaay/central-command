import os
import sys
import argparse
from dotenv import load_dotenv
from googleapiclient.discovery import build

secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(secrets_path)

def main():
    parser = argparse.ArgumentParser(description="YouTube Video Analyzer")
    parser.add_argument("video_id", help="The YouTube Video ID to analyze")
    args = parser.parse_args()
    
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        print("Error: YOUTUBE_API_KEY not found in .env.secrets")
        sys.exit(1)
        
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    try:
        print(f"Fetching details for Video ID: {args.video_id}")
        request = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=args.video_id
        )
        response = request.execute()
        
        if not response.get('items'):
            print("Video not found.")
            sys.exit(1)
            
        video = response['items'][0]
        snippet = video['snippet']
        stats = video['statistics']
        
        print("\n--- YOUTUBE VIDEO DETAILS ---")
        print(f"Title: {snippet['title']}")
        print(f"Channel: {snippet['channelTitle']}")
        print(f"Published At: {snippet['publishedAt']}")
        print(f"Views: {stats.get('viewCount', 'N/A')}")
        print(f"Likes: {stats.get('likeCount', 'N/A')}")
        print(f"Comments: {stats.get('commentCount', 'N/A')}")
        print("\nDescription Preview:")
        print(snippet['description'][:500] + "...\n" if len(snippet['description']) > 500 else snippet['description'])
        
    except Exception as e:
        print(f"Error fetching video data: {e}")

if __name__ == "__main__":
    main()
