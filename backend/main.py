from auth.auth import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "auth.auth:app",
        host="127.0.0.1",
        port=8000,
        reload=False  # Désactivé pour voir les erreurs
    )
