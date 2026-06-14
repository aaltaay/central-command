import sys
from playwright.sync_api import sync_playwright

def main():
    try:
        with sync_playwright() as p:
            print("Connecting to Edge over CDP...")
            browser = p.chromium.connect_over_cdp("http://localhost:9223")
            
            # Use the first context
            context = browser.contexts[0]
            
            # Create a new page in the existing context so we don't mess up current tabs
            page = context.new_page()
            
            print("Navigating to Meta Graph API Explorer...")
            page.goto("https://developers.facebook.com/tools/explorer/")
            page.wait_for_load_state("networkidle", timeout=15000)
            
            print("Extracting page title and checking login state...")
            title = page.title()
            print(f"Page Title: {title}")
            
            # Check if login button is present
            content = page.content()
            if "Log In" in content or "Log in" in content:
                print("Warning: Might not be fully authenticated, or login button is on page.")
            
            # Dump all buttons and text to find our "Meta App", "User or Page", "Generate Access Token" selectors
            buttons = page.locator("button").all_text_contents()
            print("\nFound Buttons on Page:")
            for b in buttons:
                b_clean = b.strip()
                if b_clean:
                    print(f"- {b_clean}")
            
            labels = page.locator("label").all_text_contents()
            print("\nFound Labels on Page:")
            for l in labels:
                l_clean = l.strip()
                if l_clean:
                    print(f"- {l_clean}")
            
            # Keep the page open for now so I can inspect it on the next run
            print("Done Phase 1. Page is open.")
            
    except Exception as e:
        print(f"Error connecting or navigating: {e}")

if __name__ == "__main__":
    main()
