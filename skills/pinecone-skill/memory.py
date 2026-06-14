import os
import sys
import argparse
import uuid
import json
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
from pinecone import Pinecone

secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(secrets_path)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env.secrets")
    sys.exit(1)
genai.configure(api_key=api_key)

# Configure Pinecone
pc_key = os.getenv("PINECONE_API_KEY")
if not pc_key:
    print("Error: PINECONE_API_KEY not found in .env.secrets")
    sys.exit(1)
pc = Pinecone(api_key=pc_key)
INDEX_NAME = "local-drive"
NAMESPACE = "conversational-memory"

def get_embedding(text):
    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=text,
        task_type="retrieval_document",
    )
    return result['embedding']

def log_memory(text):
    print(f"Embedding memory: '{text}'...")
    try:
        vector = get_embedding(text)
        index = pc.Index(INDEX_NAME)
        
        memory_id = f"mem-{uuid.uuid4().hex[:8]}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        metadata = {
            "text": text,
            "timestamp": timestamp
        }
        
        index.upsert(
            vectors=[{"id": memory_id, "values": vector, "metadata": metadata}],
            namespace=NAMESPACE
        )
        print(f"SUCCESS: Memory logged securely with ID {memory_id}.")
    except Exception as e:
        print(f"Error logging memory: {e}")

def recall_memory(query, limit=5):
    print(f"Recalling memories related to: '{query}'...")
    try:
        query_vector = get_embedding(query)
        index = pc.Index(INDEX_NAME)
        
        search_response = index.query(
            namespace=NAMESPACE,
            vector=query_vector,
            top_k=limit,
            include_metadata=True
        )
        
        if not search_response['matches']:
            print("No relevant memories found.")
            return
            
        print("\n--- RECALLED MEMORIES ---")
        for i, match in enumerate(search_response['matches']):
            score = match['score']
            text = match['metadata'].get('text', 'No text')
            timestamp = match['metadata'].get('timestamp', 'Unknown date')
            print(f"{i+1}. [Score: {score:.3f} | {timestamp}] {text}")
            
    except Exception as e:
        print(f"Error recalling memory: {e}")

def main():
    parser = argparse.ArgumentParser(description="Pinecone Long-Term Memory Interface")
    subparsers = parser.add_subparsers(dest="action", required=True)
    
    # Log parser
    log_parser = subparsers.add_parser("log", help="Log a new memory into Pinecone")
    log_parser.add_argument("text", type=str, help="The memory or rule to remember")
    
    # Recall parser
    recall_parser = subparsers.add_parser("recall", help="Recall memories from Pinecone")
    recall_parser.add_argument("query", type=str, help="The concept or question to search for")
    recall_parser.add_argument("--limit", type=int, default=5, help="Number of memories to return (default 5)")
    
    args = parser.parse_args()
    
    if args.action == "log":
        log_memory(args.text)
    elif args.action == "recall":
        recall_memory(args.query, args.limit)

if __name__ == "__main__":
    main()
