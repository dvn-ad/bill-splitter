from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_USERNAME: str
    APP_PASSWORD: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
