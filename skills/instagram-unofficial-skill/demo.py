from client import get_client

def run_demo():
    print("--- Instagram Skill Demo ---")
    
    # Connect
    cl = get_client()
    
    print("\n[+] Connection Established!")
    
    # Get basic account info
    user_id = cl.user_id
    info = cl.user_info(user_id)
    
    print("\n--- Profile Stats ---")
    print(f"Username: {info.username}")
    print(f"Full Name: {info.full_name}")
    print(f"Followers: {info.follower_count}")
    print(f"Following: {info.following_count}")
    print(f"Media Count: {info.media_count}")
    
    print("\n--- Recent Notifications ---")
    try:
        notifications = cl.news_inbox()
        if hasattr(notifications, 'old_stories'):
            for story in notifications.old_stories[:3]:
                if hasattr(story, 'args') and hasattr(story.args, 'text'):
                    print(f"- {story.args.text}")
                else:
                    print("- (Notification structure varies)")
        else:
             print("- (No recent notifications found)")
    except Exception as e:
         print(f"Could not load notifications: {e}")

    print("\nDemo Complete!")

if __name__ == "__main__":
    run_demo()
