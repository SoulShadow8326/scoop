from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings

def get_fast_model() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.fast_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.0,
        max_retries=settings.max_retries,
    )

def get_reasoning_model() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.reasoning_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.2,
        max_retries=settings.max_retries,
    )
