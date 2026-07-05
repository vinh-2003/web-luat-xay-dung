from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Web Luat Xay Dung AI"
    API_V1_STR: str = "/api/v1"
    
    # Frontend URL and CORS
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: list[str] | str = ["http://localhost:3000"]
    
    # PostgreSQL Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/luatxaydung"
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    
    # JWT Configuration
    SECRET_KEY: str = "your-super-secret-key-change-it-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # NextAuth.js JWT Secret (for verifying requests from frontend if needed)
    NEXTAUTH_SECRET: str = ""
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    
    # First Superuser
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str
    
    # SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

settings = Settings()
