import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # App
    SECRET_KEY = os.getenv("SECRET_KEY", "change_this_super_secret_key_123456789")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    
    # MySQL
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "Codentsika")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    
    # OAuth Google
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # OAuth GitHub
    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
    
    # NVIDIA AI
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
    NVIDIA_API_URL = os.getenv("NVIDIA_API_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "minimaxai/minimax-m2.7")
    
    @property
    def MYSQL_CONFIG(self):
        return {
            "host": self.MYSQL_HOST,
            "port": self.MYSQL_PORT,
            "user": self.MYSQL_USER,
            "password": self.MYSQL_PASSWORD,
            "database": self.MYSQL_DATABASE,
            "pool_name": "mypool",
            "pool_size": 10,
        }

# Instance unique à importer partout
config = Config()