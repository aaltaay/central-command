import json
import os
import psycopg2
from dotenv import load_dotenv

# Load secrets
secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
if os.path.exists(secrets_path):
    load_dotenv(secrets_path)

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

if not SUPABASE_DB_URL:
    print("Error: Missing SUPABASE_DB_URL in .env.secrets")
    exit(1)

def get_db_connection():
    # Fix for IPv6/DNS issues with direct connection on Windows
    url = SUPABASE_DB_URL
    if "db.tulkhaeurclnbshxuqhn.supabase.co" in url:
        url = url.replace("db.tulkhaeurclnbshxuqhn.supabase.co", "aws-0-us-west-2.pooler.supabase.com")
        url = url.replace("postgres:", "postgres.tulkhaeurclnbshxuqhn:")
        url = url.replace(":5432", ":5432")
    return psycopg2.connect(url)

def main():
    json_path = "scored_leads_output.json"
    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        leads = json.load(f)
        
    print(f"Loaded {len(leads)} leads from {json_path}")

    conn = get_db_connection()
    cursor = conn.cursor()
    
    inserted_count = 0
    updated_count = 0

    for lead in leads:
        try:
            cursor.execute("""
                INSERT INTO public.leads (
                    business_name, address, phone, website, google_maps_url, 
                    trust_score, opportunity_score, ai_hook, status,
                    business_volume_estimate, identified_leaks
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (google_maps_url) 
                DO UPDATE SET 
                    trust_score = EXCLUDED.trust_score,
                    opportunity_score = EXCLUDED.opportunity_score,
                    ai_hook = EXCLUDED.ai_hook,
                    business_volume_estimate = EXCLUDED.business_volume_estimate,
                    identified_leaks = EXCLUDED.identified_leaks,
                    updated_at = NOW();
            """, (
                lead.get('business_name'),
                lead.get('address'),
                lead.get('phone'),
                lead.get('website'),
                lead.get('google_maps_url'),
                lead.get('trust_score'),
                lead.get('opportunity_score'),
                lead.get('ai_hook'),
                lead.get('status', 'new'),
                lead.get('business_volume_estimate', 'Unknown'),
                json.dumps(lead.get('identified_leaks', []))
            ))
            inserted_count += 1
        except Exception as e:
            print(f"Error inserting {lead.get('business_name')}: {e}")
            conn.rollback()
            continue

    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\n[DONE] Processed {inserted_count} leads into the database.")

if __name__ == "__main__":
    main()
