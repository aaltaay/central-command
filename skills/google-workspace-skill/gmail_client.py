import os
import pickle
import argparse
import base64
from email.message import EmailMessage
from googleapiclient.discovery import build

def get_service():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        raise Exception("Credentials invalid or missing. Run auth.py first.")
    return build('gmail', 'v1', credentials=creds)

def search_emails(query, limit=5):
    service = get_service()
    results = service.users().messages().list(userId='me', q=query, maxResults=limit).execute()
    messages = results.get('messages', [])
    
    if not messages:
        print("No messages found.")
        return
        
    for msg in messages:
        message = service.users().messages().get(userId='me', id=msg['id'], format='metadata', metadataHeaders=['Subject', 'From', 'Date']).execute()
        headers = message.get('payload', {}).get('headers', [])
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
        date = next((h['value'] for h in headers if h['name'] == 'Date'), 'Unknown Date')
        print(f"[{date}] From: {sender} | Subject: {subject} | ID: {msg['id']}")

def read_email(msg_id):
    service = get_service()
    message = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    snippet = message.get('snippet')
    print(f"--- Snippet ---\n{snippet}\n")
    
def send_email(to, subject, body):
    service = get_service()
    message = EmailMessage()
    message.set_content(body)
    message['To'] = to
    message['From'] = 'me'
    message['Subject'] = subject
    
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    create_message = {'raw': encoded_message}
    
    send_message = (service.users().messages().send(userId="me", body=create_message).execute())
    print(f"Message Id: {send_message['id']} sent successfully.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Gmail Client")
    parser.add_argument('--action', choices=['search', 'read', 'send'], required=True)
    parser.add_argument('--query', help="Search query (e.g. 'is:unread')")
    parser.add_argument('--msg-id', help="Message ID to read")
    parser.add_argument('--to', help="Recipient email address")
    parser.add_argument('--subject', help="Email subject")
    parser.add_argument('--body', help="Email body")
    args = parser.parse_args()
    
    if args.action == 'search':
        search_emails(args.query if args.query else "")
    elif args.action == 'read':
        if not args.msg_id:
            print("Error: --msg-id required for read.")
        else:
            read_email(args.msg_id)
    elif args.action == 'send':
        if not args.to or not args.subject or not args.body:
            print("Error: --to, --subject, and --body required for send.")
        else:
            send_email(args.to, args.subject, args.body)
