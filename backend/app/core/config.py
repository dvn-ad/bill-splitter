from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    GEMINI_API_KEY: str
    FRONTEND_URL: str = ""
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
