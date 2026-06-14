import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load secrets
secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(secrets_path, override=True)

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def get_embedding(text: str):
    """Generates a 768-dimensional embedding for the given text using Gemini."""
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found.")
    
    # Text embedding model
    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']
    
def get_query_embedding(text: str):
    """Generates an embedding for a search query."""
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found.")
        
    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=text,
        task_type="retrieval_query"
    )
    return result['embedding']

if __name__ == "__main__":
    print("Testing embedder...")
    vec = get_embedding("Hello world")
    print(f"Generated vector of length: {len(vec)}")
