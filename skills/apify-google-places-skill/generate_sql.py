import json

def main():
    json_path = "scored_leads_output.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        leads = json.load(f)

    sql_statements = []
    
    for lead in leads:
        # Escape single quotes in text fields
        def escape(val):
            if val is None:
                return "NULL"
            if isinstance(val, str):
                return "'" + val.replace("'", "''") + "'"
            return str(val)

        sql = f"""
        INSERT INTO public.leads (business_name, address, phone, website, google_maps_url, trust_score, opportunity_score, ai_hook, status)
        VALUES (
            {escape(lead.get('business_name'))},
            {escape(lead.get('address'))},
            {escape(lead.get('phone'))},
            {escape(lead.get('website'))},
            {escape(lead.get('google_maps_url'))},
            {escape(lead.get('trust_score'))},
            {escape(lead.get('opportunity_score'))},
            {escape(lead.get('ai_hook'))},
            {escape(lead.get('status', 'new'))}
        )
        ON CONFLICT (google_maps_url) DO UPDATE SET
            trust_score = EXCLUDED.trust_score,
            opportunity_score = EXCLUDED.opportunity_score,
            ai_hook = EXCLUDED.ai_hook,
            updated_at = NOW();
        """
        sql_statements.append(sql.strip())

    with open("insert.sql", "w", encoding="utf-8") as f:
        f.write("\n\n".join(sql_statements))

    print(f"Generated insert.sql with {len(sql_statements)} statements.")

if __name__ == "__main__":
    main()
