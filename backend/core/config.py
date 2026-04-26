from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from pydantic import AnyHttpUrl, Field

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Bill Splitter"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # MongoDB
    MONGODB_URL: str = Field("mongodb://localhost:27017", validation_alias="MONGODB_CONNECTION_STRING")
    DATABASE_NAME: str = "bill_splitter"

    # Gemini API
    GEMINI_API_KEY: str = ""

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    model_config = SettingsConfigDict(
        case_sensitive=True, 
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
