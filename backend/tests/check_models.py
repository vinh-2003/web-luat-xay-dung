import google.generativeai as genai
from app.core.config import settings

def check():
    genai.configure(api_key=settings.GEMINI_API_KEY)
    models = [m.name for m in genai.list_models()]
    print("All models:", models)
    embed_models = [m.name for m in genai.list_models() if 'embedContent' in m.supported_generation_methods]
    print("Embed models:", embed_models)

if __name__ == "__main__":
    check()
