import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    print("Connecting to Edge on port 9223...")
    try:
        browser = p.chromium.connect_over_cdp("http://localhost:9223")
    except Exception as e:
        print(f"Failed to connect: {e}")
        exit(1)
        
    context = browser.contexts[0]
    
    meta_page = None
    for pg in context.pages:
        print(f"Found page: {pg.title()} ({pg.url})")
        if "facebook" in pg.url or "meta" in pg.url or "developer" in pg.url:
            meta_page = pg
            break
            
    if not meta_page:
        meta_page = context.pages[0] # fallback
        
    print(f"Using page: {meta_page.title()} ({meta_page.url})")
    meta_page.bring_to_front()
    meta_page.screenshot(path="step1_start.png")
    
    try:
        # We are on the Apps page. Click the app.
        print("Clicking Altay Studio Automation...")
        app_box = meta_page.get_by_text("Altay Studio Automation")
        if app_box.count() > 0:
            app_box.first.click(timeout=5000)
        else:
            print("Could not find 'Altay Studio Automation' text. Taking screenshot.")
            meta_page.screenshot(path="error.png")
            exit(1)
            
        time.sleep(3)
        meta_page.screenshot(path="step2_app_clicked.png")
        
        # Click App settings
        print("Clicking App settings...")
        settings_btn = meta_page.get_by_text("App settings")
        if settings_btn.count() > 0:
            settings_btn.first.click(timeout=5000)
            time.sleep(1)
            
            # Click Basic
            print("Clicking Basic...")
            meta_page.get_by_text("Basic").first.click(timeout=5000)
        else:
            print("App settings not found.")
            
        time.sleep(4)
        meta_page.screenshot(path="step3_basic_settings.png")
        
        print("Extracting HTML to find Privacy Policy input...")
        html = meta_page.content()
        with open("meta_html.txt", "w", encoding="utf-8") as f:
            f.write(html)
            
        print("SUCCESS_PARTIAL")
    except Exception as e:
        print(f"FAILED: {e}")
        meta_page.screenshot(path="error.png")
