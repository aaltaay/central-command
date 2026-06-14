import os
import argparse
import google.generativeai as genai
from pinecone import Pinecone
from dotenv import load_dotenv

# Load secrets
secrets_path = r"C:\Users\aalta\.gemini\antigravity\.env.secrets"
load_dotenv(secrets_path, override=True)

# Configure Gemini
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found in .env.secrets")
genai.configure(api_key=gemini_api_key)

# Configure Pinecone
pinecone_api_key = os.environ.get("PINECONE_API_KEY")
if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY not found in .env.secrets")
pc = Pinecone(api_key=pinecone_api_key)

INDEX_NAME = "marketing-expert"

def get_query_embedding(text: str):
    """Generates an embedding for the search query."""
    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=text,
        task_type="retrieval_query"
    )
    return result['embedding']

def ask_marketing_agent(question: str):
    """Queries Pinecone and asks Gemini to act as the expert."""
    try:
        index = pc.Index(INDEX_NAME)
    except Exception as e:
        return f"Error connecting to Pinecone index '{INDEX_NAME}': {e}"
        
    print(f"\nSearching marketing knowledge base for: '{question}'...")
    
    # 1. Embed query
    query_vec = get_query_embedding(question)
    
    # 2. Search Pinecone
    search_results = index.query(
        vector=query_vec,
        top_k=8,
        include_metadata=True
    )
    
    if not search_results['matches']:
        return "I couldn't find any relevant marketing principles for this question."
        
    # 3. Compile Context
    context_chunks = []
    sources = set()
    for match in search_results['matches']:
        score = match['score']
        metadata = match['metadata']
        text = metadata.get('text', '')
        source = metadata.get('source', 'Unknown')
        sources.add(source)
        
        context_chunks.append(f"--- [From: {source} (Relevance: {score:.2f})] ---\n{text}\n")
        
    compiled_context = "\n".join(context_chunks)
    
    print(f"Found highly relevant insights from: {', '.join(sources)}")
    print("Synthesizing expert answer...")
    
    # 4. Generate Answer with Gemini
    system_prompt = (
        "You are a world-class marketing expert and consultant. "
        "Your advice is strictly based on the provided context, which contains core principles from "
        "Alex Hormozi's frameworks (Leads, Offers, Money/Models). "
        "Do NOT invent advice outside of this context. If the context does not answer the question, "
        "say 'I cannot find a direct answer to this in the core frameworks, but here is what relates...' "
        "Be concise, actionable, and authoritative."
    )
    
    user_prompt = f"Based on the following marketing principles, answer this question: {question}\n\nCONTEXT:\n{compiled_context}"
    
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=system_prompt
    )
    
    response = model.generate_content(user_prompt)
    return response.text

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Marketing Expert Agent")
    parser.add_argument("query", type=str, help="Your marketing question")
    args = parser.parse_args()
    
    answer = ask_marketing_agent(args.query)
    print("\n" + "="*50)
    print("MARKETING EXPERT ADVICE")
    print("="*50)
    print(answer)
    print("="*50 + "\n")
