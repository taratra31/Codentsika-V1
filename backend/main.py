from auth.auth import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "auth.auth:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
