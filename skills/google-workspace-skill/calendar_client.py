import os
import pickle
import argparse
import datetime
from googleapiclient.discovery import build

def get_service():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        raise Exception("Credentials invalid or missing. Run auth.py first.")
    return build('calendar', 'v3', credentials=creds)

def list_events(limit=10):
    service = get_service()
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    print(f'Getting the upcoming {limit} events')
    events_result = service.events().list(calendarId='primary', timeMin=now,
                                          maxResults=limit, singleEvents=True,
                                          orderBy='startTime').execute()
    events = events_result.get('items', [])

    if not events:
        print('No upcoming events found.')
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        print(f"[{start}] {event['summary']}")

def create_event(summary, start_time, end_time, description=""):
    service = get_service()
    event = {
      'summary': summary,
      'description': description,
      'start': {
        'dateTime': start_time,
        'timeZone': 'UTC',
      },
      'end': {
        'dateTime': end_time,
        'timeZone': 'UTC',
      },
    }
    event = service.events().insert(calendarId='primary', body=event).execute()
    print(f"Event created: {event.get('htmlLink')}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Google Calendar Client")
    parser.add_argument('--action', choices=['list', 'create'], required=True)
    parser.add_argument('--limit', type=int, default=10, help="Number of events to list")
    parser.add_argument('--summary', help="Event summary")
    parser.add_argument('--start', help="Start time in ISO format (e.g., 2026-05-10T09:00:00Z)")
    parser.add_argument('--end', help="End time in ISO format (e.g., 2026-05-10T10:00:00Z)")
    parser.add_argument('--desc', default="", help="Event description")
    args = parser.parse_args()
    
    if args.action == 'list':
        list_events(args.limit)
    elif args.action == 'create':
        if not args.summary or not args.start or not args.end:
            print("Error: --summary, --start, and --end required for create.")
        else:
            create_event(args.summary, args.start, args.end, args.desc)
