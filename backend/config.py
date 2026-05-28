import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # App
    SECRET_KEY = os.getenv("SECRET_KEY")
    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "https://codentsikav1.andriamtaratra5.workers.dev"
    )
    BACKEND_URL = os.getenv(
        "BACKEND_URL",
        "https://codentsika-v1.onrender.com"
    )

    # MySQL
    MYSQL_HOST = os.getenv("MYSQL_HOST")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
    MYSQL_USER = os.getenv("MYSQL_USER")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")

    # OAuth Google
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

    # OAuth GitHub
    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

    # NVIDIA AI
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
    NVIDIA_API_URL = os.getenv(
        "NVIDIA_API_URL",
        "https://integrate.api.nvidia.com/v1"
    )
    NVIDIA_MODEL = os.getenv(
        "NVIDIA_MODEL",
        "minimaxai/minimax-m2.7"
    )

    @property
    def MYSQL_CONFIG(self):
        return {
            "host": self.MYSQL_HOST,
            "port": self.MYSQL_PORT,
            "user": self.MYSQL_USER,
            "password": self.MYSQL_PASSWORD,
            "database": self.MYSQL_DATABASE,
            "pool_name": "mypool",
            "pool_size": 1,
        }

config = Config()
