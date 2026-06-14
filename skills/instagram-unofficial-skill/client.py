import os
import json
from instagrapi import Client
from dotenv import load_dotenv

# Load secrets from the global .env.secrets file
global_secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(global_secrets_path)

USERNAME = os.getenv("INSTAGRAM_USERNAME")
PASSWORD = os.getenv("INSTAGRAM_PASSWORD")
SESSION_FILE = "session.json"

def get_client():
    cl = Client()
    
    # Try to load existing session
    if os.path.exists(SESSION_FILE):
        print("Loading existing session...")
        try:
            cl.load_settings(SESSION_FILE)
            # You can check if the session is still valid
            cl.login(USERNAME, PASSWORD)
            print("Session loaded successfully.")
            return cl
        except Exception as e:
            print(f"Failed to load session: {e}. Logging in fresh...")
            pass # Fall back to fresh login

    # Fresh login
    print("Logging in from scratch...")
    try:
        cl.login(USERNAME, PASSWORD)
    except Exception as e:
        if "Two-factor authentication required" in str(e) or "TwoFactorRequired" in str(type(e)):
            code = input("Enter 2FA code: ")
            cl.login(USERNAME, PASSWORD, verification_code=code)
        else:
            raise e
    
    # Save the session to avoid logging in again
    cl.dump_settings(SESSION_FILE)
    print("Session saved!")
    
    return cl

if __name__ == "__main__":
    # Test connection
    cl = get_client()
    print("Successfully connected as:", cl.username)
