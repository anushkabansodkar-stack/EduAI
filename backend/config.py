import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "eduai-academic-secret-key-2026")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-service-account.json")
    FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL", "https://eduai-educational-platform.firebaseio.com")
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25 MB max limit
    ALLOWED_EXTENSIONS = {"pdf", "txt"}
    MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "saved_models")
