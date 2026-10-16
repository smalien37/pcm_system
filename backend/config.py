from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://pcm_user:pcm_user@localhost:5432/pcm_db1"

    # Email settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@syncflow.com"
    ISSUE_NOTIFY_EMAILS: str = "smalien37@gmail.com,vivek.synesiscon@gmail.com"

    class Config:
        env_file = ".env"

settings = Settings()
