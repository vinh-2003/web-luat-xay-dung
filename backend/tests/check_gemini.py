import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.gemini import GeminiService

g = GeminiService()
try:
    vec = g.generate_embedding("test")
    print(f"Embedding length: {len(vec)}")
except Exception as e:
    print(f"Error: {e}")
