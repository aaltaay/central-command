import os
import argparse
from dotenv import load_dotenv
from pinecone import Pinecone
from embedder import get_query_embedding

secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(secrets_path, override=True)

INDEX_NAME = "local-drive"

def main():
    parser = argparse.ArgumentParser(description="Search local drive conceptually")
    parser.add_argument("query", help="The conceptual query")
    parser.add_argument("--top_k", type=int, default=3, help="Number of results to return")
    args = parser.parse_args()

    api_key = os.environ.get("PINECONE_API_KEY")
    pc = Pinecone(api_key=api_key)
    
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]
    if INDEX_NAME not in existing_indexes:
        print(f"Index '{INDEX_NAME}' does not exist. Please run index_directory.py first.")
        return
        
    index = pc.Index(INDEX_NAME)
    
    print(f"Embedding query: '{args.query}'...")
    query_vec = get_query_embedding(args.query)
    
    print("Searching Pinecone...")
    results = index.query(
        vector=query_vec,
        top_k=args.top_k,
        include_metadata=True
    )
    
    print("\n--- SEARCH RESULTS ---")
    for match in results['matches']:
        score = match['score']
        filepath = match['metadata']['filepath']
        content = match['metadata']['content']
        
        print(f"\n[Score: {score:.4f}] File: {filepath}")
        print("-" * 40)
        # Print a snippet of the content
        preview = content[:300].replace('\n', ' ') + "..." if len(content) > 300 else content
        print(preview)
        print("-" * 40)

if __name__ == "__main__":
    main()
