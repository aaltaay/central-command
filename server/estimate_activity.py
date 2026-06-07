import os
import json
import time
from datetime import datetime, date

def get_today_mtimes():
    today = date.today()
    midnight = datetime.combine(today, datetime.min.time())
    midnight_ts = midnight.timestamp()
    
    timestamps = []
    
    # Paths to scan
    scan_paths = [
        r"C:\Users\aalta\.gemini\antigravity\brain",
        r"c:\Users\aalta\github"
    ]
    
    exclude_dirs = {
        'node_modules', '.git', '.next', 'dist', 'out', 'build', 
        '.tmp', '.od', '.vaunt', 'Cache', 'Data', '.cursor'
    }
    
    for base_path in scan_paths:
        if not os.path.exists(base_path):
            continue
            
        for root, dirs, files in os.walk(base_path):
            # Modify dirs in-place to prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                filepath = os.path.join(root, file)
                try:
                    mtime = os.path.getmtime(filepath)
                    if mtime >= midnight_ts:
                        timestamps.append(mtime)
                except Exception:
                    pass
                    
    return timestamps

def estimate_active_hours():
    timestamps = get_today_mtimes()
    if not timestamps:
        return 0, {str(h): 0 for h in range(24)}
        
    # Group into 10-minute bins
    # A bin key can be (hour, bin_of_10_min) -> e.g., (2, 1) for 02:10 - 02:20
    active_bins = set()
    for ts in timestamps:
        dt = datetime.fromtimestamp(ts)
        bin_idx = dt.minute // 10
        active_bins.add((dt.hour, bin_idx))
        
    # Each active bin is 10 minutes (600 seconds)
    hourly_breakdown = {str(h): 0 for h in range(24)}
    total_seconds = 0
    
    for (hour, bin_idx) in active_bins:
        hourly_breakdown[str(hour)] += 600
        total_seconds += 600
        
    # Cap each hour at 3600 seconds
    for h in hourly_breakdown:
        if hourly_breakdown[h] > 3600:
            hourly_breakdown[h] = 3600
            
    # Recalculate total seconds based on capped values
    total_seconds = sum(hourly_breakdown.values())
            
    return total_seconds, hourly_breakdown

def main():
    try:
        active_seconds, breakdown = estimate_active_hours()
        
        # Merge with existing activity_log.json if it exists
        log_file = r"C:\Users\aalta\.gemini\antigravity\activity_log.json"
        log_data = {}
        if os.path.exists(log_file):
            try:
                with open(log_file, "r") as f:
                    log_data = json.load(f)
            except Exception:
                pass
                
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        # Update today's entry only if it is missing or has less active_seconds
        # This acts as a fallback/initiator
        if today_str not in log_data or log_data[today_str].get("active_seconds", 0) < active_seconds:
            log_data[today_str] = {
                "active_seconds": active_seconds,
                "hourly_breakdown": breakdown,
                "last_active": datetime.now().isoformat(),
                "estimated": True
            }
            with open(log_file, "w") as f:
                json.dump(log_data, f, indent=2)
            print(f"Estimation complete. Wrote {active_seconds} seconds to log.")
        else:
            print("Existing log is already ahead of or equal to estimate. Skipped update.")
            
    except Exception as e:
        print(f"Estimation failed: {e}")

if __name__ == "__main__":
    main()
