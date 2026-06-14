import os
import uuid
import argparse
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from embedder import get_embedding

secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(secrets_path, override=True)

INDEX_NAME = "local-drive"

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def main():
    parser = argparse.ArgumentParser(description="Index a directory into Pinecone")
    parser.add_argument("dir_path", help="Path to the directory to index")
    args = parser.parse_args()

    api_key = os.environ.get("PINECONE_API_KEY")
    if not api_key:
        print("Error: PINECONE_API_KEY not found.")
        return

    pc = Pinecone(api_key=api_key)
    
    # Check if index exists, if not create it
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]
    if INDEX_NAME not in existing_indexes:
        print(f"Creating index '{INDEX_NAME}'...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=3072, # Gemini-2 embeddings are 3072 dims
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
    
    index = pc.Index(INDEX_NAME)
    
    # Supported extensions
    valid_exts = {'.py', '.txt', '.md', '.json', '.html', '.css', '.js', '.ts', '.tsx'}
    
    print(f"Crawling directory: {args.dir_path}")
    vectors_to_upsert = []
    
    for root, dirs, files in os.walk(args.dir_path):
        dirs[:] = [d for d in dirs if d not in {'.git', 'node_modules', '.next', 'venv', '.venv', '__pycache__'}]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in valid_exts:
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    if not content.strip():
                        continue
                        
                    chunks = chunk_text(content)
                    for i, chunk in enumerate(chunks):
                        vec = get_embedding(chunk)
                        
                        vec_id = f"{filepath}_{i}"
                        vectors_to_upsert.append({
                            "id": vec_id,
                            "values": vec,
                            "metadata": {
                                "filepath": filepath,
                                "chunk_index": i,
                                "content": chunk
                            }
                        })
                        
                        # Upsert in batches of 100
                        if len(vectors_to_upsert) >= 100:
                            index.upsert(vectors=vectors_to_upsert)
                            print(f"Upserted 100 vectors... (Last file: {file})")
                            vectors_to_upsert = []
                except Exception as e:
                    print(f"Failed to read/process {filepath}: {e}")
                    
    # Upsert remaining
    if vectors_to_upsert:
        index.upsert(vectors=vectors_to_upsert)
        print(f"Upserted final {len(vectors_to_upsert)} vectors.")
        
    print("Indexing complete.")

if __name__ == "__main__":
    main()
