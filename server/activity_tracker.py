import ctypes
from ctypes import wintypes
import time
import os
import sys
import json
from datetime import datetime

# Windows last input struct
class LASTINPUTINFO(ctypes.Structure):
    _fields_ = [("cbSize", wintypes.UINT),
                ("dwTime", wintypes.UINT)]

def get_idle_duration():
    last_input_info = LASTINPUTINFO()
    last_input_info.cbSize = ctypes.sizeof(LASTINPUTINFO)
    # Using windll.user32
    if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(last_input_info)):
        tick = ctypes.windll.kernel32.GetTickCount()
        elapsed = (tick - last_input_info.dwTime) & 0xFFFFFFFF
        return elapsed / 1000.0  # Convert to seconds
    return 0.0

def main():
    # Setup data directory
    data_dir = r"C:\Users\aalta\.gemini\antigravity"
    os.makedirs(data_dir, exist_ok=True)
    
    lock_file = os.path.join(data_dir, "activity_tracker.lock")
    log_file = os.path.join(data_dir, "activity_log.json")
    
    # 1. Check/create lockfile to prevent multiple running instances
    try:
        if os.path.exists(lock_file):
            with open(lock_file, "r") as lf:
                old_pid = int(lf.read().strip())
            # Check if old_pid is actually running on Windows
            import subprocess
            res = subprocess.run(f"tasklist /FI \"PID eq {old_pid}\"", capture_output=True, text=True, shell=True)
            if str(old_pid) in res.stdout:
                print(f"Activity tracker already running with PID {old_pid}. Exiting.")
                sys.exit(0)
    except Exception as e:
        print(f"Lockfile check failed: {e}. Proceeding.")
        
    # Write current PID
    with open(lock_file, "w") as lf:
        lf.write(str(os.getpid()))
        
    print(f"Starting activity tracker daemon with PID {os.getpid()}...")
    
    interval = 30  # Poll every 30 seconds
    idle_threshold = 300  # 5 minutes
    
    # Initialize session tracking state
    session_seconds = 0
    try:
        if os.path.exists(log_file):
            with open(log_file, "r") as f:
                log_data = json.load(f)
            today_str = datetime.now().strftime("%Y-%m-%d")
            if today_str in log_data and "last_active" in log_data[today_str] and log_data[today_str]["last_active"]:
                last_active_time = datetime.fromisoformat(log_data[today_str]["last_active"])
                # If last active was less than 5 minutes ago, restore session_seconds
                if (datetime.now() - last_active_time).total_seconds() < idle_threshold:
                    session_seconds = log_data[today_str].get("session_seconds", 0)
    except Exception as e:
        print(f"Failed to restore session_seconds: {e}")

    while True:
        try:
            idle_sec = get_idle_duration()
            now = datetime.now()
            today_str = now.strftime("%Y-%m-%d")
            hour_str = str(now.hour)
            
            # Read existing log
            log_data = {}
            if os.path.exists(log_file):
                try:
                    with open(log_file, "r") as f:
                        log_data = json.load(f)
                except Exception:
                    pass
            
            # Initialize today's entry if not present
            if today_str not in log_data:
                log_data[today_str] = {
                    "active_seconds": 0,
                    "session_seconds": 0,
                    "hourly_breakdown": {str(h): 0 for h in range(24)},
                    "last_active": ""
                }
                session_seconds = 0
                
            # If user was active during this 30s interval
            if idle_sec < idle_threshold:
                # Add interval seconds
                log_data[today_str]["active_seconds"] += interval
                session_seconds += interval
                log_data[today_str]["session_seconds"] = session_seconds
                
                # Make sure hourly_breakdown exists
                if "hourly_breakdown" not in log_data[today_str]:
                    log_data[today_str]["hourly_breakdown"] = {str(h): 0 for h in range(24)}
                
                # Add to hourly breakdown (cap at 3600 per hour)
                current_hour_val = log_data[today_str]["hourly_breakdown"].get(hour_str, 0)
                log_data[today_str]["hourly_breakdown"][hour_str] = min(3600, current_hour_val + interval)
                
                # Update last active timestamp
                log_data[today_str]["last_active"] = now.isoformat()
            else:
                # User is idle, reset current session duration
                session_seconds = 0
                log_data[today_str]["session_seconds"] = 0
                
            # Save updated log
            with open(log_file, "w") as f:
                json.dump(log_data, f, indent=2)
                
        except Exception as e:
            print(f"Error in tracking loop: {e}")
            
        time.sleep(interval)

if __name__ == "__main__":
    main()
