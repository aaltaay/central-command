import os
import sys
import argparse
from dotenv import load_dotenv
from firecrawl import FirecrawlApp

# Load secrets from global .env.secrets
secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(secrets_path)

def main():
    parser = argparse.ArgumentParser(description="Firecrawl Web Scraper")
    parser.add_argument("url", help="URL to scrape")
    args = parser.parse_args()
    
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        print("Error: FIRECRAWL_API_KEY not found in .env.secrets")
        sys.exit(1)
        
    app = FirecrawlApp(api_key=api_key)
    try:
        print(f"Scraping {args.url}...")
        scrape_result = app.scrape(args.url, formats=['markdown'])
        
        md = None
        if hasattr(scrape_result, 'markdown'):
            md = scrape_result.markdown
        elif isinstance(scrape_result, dict):
            md = scrape_result.get('markdown')
            
        if md:
            print("\n--- SCRAPE RESULT (MARKDOWN) ---\n")
            print(md)
            print("\n--- END OF RESULT ---")
        else:
            print("Failed to get markdown format.")
            print(scrape_result)
    except Exception as e:
        print(f"Error scraping URL: {e}")

if __name__ == "__main__":
    main()
