# Apify Instagram Skill

This skill allows Antigravity (or the user) to securely and reliably scrape an Instagram profile using the direct Apify API.

## Features
- Bypasses Zapier, removing any "Missing Actor ID" dropdown issues.
- Automatically handles polling the Apify backend until the scrape finishes.
- Pulls authentication securely from the centralized `C:\Users\aalta\.gemini\antigravity\.env.secrets` file.
- Handles unicode emojis properly so Python doesn't crash on print.

## How to use via Python
You can import this as a modular building block into any other python pipeline (like the Signal Dashboard):

```python
from scrape_profile import scrape_instagram_profile

# Returns a huge dictionary of all profile metadata + latest posts
data = scrape_instagram_profile("ahmi.x012")
print(data.get("followersCount"))
```

## How to use via CLI (Unified Tool)

The `instagram.py` script routes your command to one of 6 highly-optimized Apify actors behind the scenes.

**1. Scrape a User's Profile & Posts:**
```bash
py instagram.py --action profile --target ahmi.x012
```

**2. Scrape a Hashtag:**
```bash
py instagram.py --action hashtag --target gapandgo --limit 10
```

**3. Scrape a Reel (by URL or Username):**
```bash
# By URL
py instagram.py --action reel --url https://www.instagram.com/reel/123...

# By Username (scrapes their reels)
py instagram.py --action reel --target ahmi.x012
```

**4. Scrape Comments on a Post:**
```bash
py instagram.py --action comments --url https://www.instagram.com/p/123...
```

**5. Scrape Tagged Posts:**
```bash
py instagram.py --action tagged --target ahmi.x012
```

**6. Advanced Universal Scraper:**
```bash
py instagram.py --action advanced --target ahmi.x012
py instagram.py --action advanced --url https://...
```

*Note: All output is automatically dropped as a `.json` file in the current directory!*
