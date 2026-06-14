import ctypes
import sys
import argparse

def show_prompt(browser_name):
    # ctypes MessageBoxW arguments:
    # 0: Handle to owner window (0 = no owner)
    # Text: Message content
    # Title: Message box title
    # Type: 4 (MB_YESNO) | 32 (MB_ICONQUESTION) | 4096 (MB_SYSTEMMODAL - keeps it on top)
    # Return values: 6 (IDYES), 7 (IDNO)
    
    msg = f"Antigravity Agent is requesting permission to connect to your local {browser_name} browser.\n\nAllow connection?"
    title = "Antigravity Security Certification"
    
    result = ctypes.windll.user32.MessageBoxW(0, msg, title, 4 | 32 | 4096)
    
    if result == 6:
        print("APPROVED")
        sys.exit(0)
    else:
        print("DENIED")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", type=str, required=True, help="Name of the browser (e.g. Chrome, Edge)")
    args = parser.parse_args()
    
    show_prompt(args.browser)
