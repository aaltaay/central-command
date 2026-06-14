import os
import pickle
import argparse
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

def get_service():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        raise Exception("Credentials invalid or missing. Run auth.py first.")
    return build('drive', 'v3', credentials=creds)

def search_files(query, limit=10):
    service = get_service()
    results = service.files().list(
        q=query,
        pageSize=limit,
        fields="nextPageToken, files(id, name, mimeType, modifiedTime)"
    ).execute()
    items = results.get('files', [])
    for item in items:
        print(f"Name: {item['name']}, ID: {item['id']}, Type: {item['mimeType']}, Modified: {item['modifiedTime']}")

def download_file(file_id, output_path):
    service = get_service()
    file = service.files().get(fileId=file_id).execute()
    mime_type = file.get('mimeType')
    
    if mime_type.startswith('application/vnd.google-apps.'):
        # Export Google Docs format
        export_mime_type = 'application/pdf'
        if mime_type == 'application/vnd.google-apps.document':
            export_mime_type = 'text/plain'
        elif mime_type == 'application/vnd.google-apps.spreadsheet':
            export_mime_type = 'text/csv'
            
        request = service.files().export_media(fileId=file_id, mimeType=export_mime_type)
    else:
        request = service.files().get_media(fileId=file_id)
        
    fh = io.FileIO(output_path, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    print(f"Downloading {file.get('name')} to {output_path}...")
    while done is False:
        status, done = downloader.next_chunk()
        print(f"Download {int(status.progress() * 100)}%.")
    print("Download complete.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Google Drive Client")
    parser.add_argument('--action', choices=['search', 'download'], required=True)
    parser.add_argument('--query', help="Search query (e.g. \"name contains 'Project'\")")
    parser.add_argument('--file-id', help="File ID to download")
    parser.add_argument('--output', help="Output file path for download")
    args = parser.parse_args()
    
    if args.action == 'search':
        search_files(args.query if args.query else "")
    elif args.action == 'download':
        if not args.file_id or not args.output:
            print("Error: --file-id and --output required for download.")
        else:
            download_file(args.file_id, args.output)
