from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://pcm_user:pcm_user@localhost:5432/pcm_db1"

    class Config:
        env_file = ".env"

settings = Settings()
