# auth/login.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import hashlib
import os
from .utils import get_db_connection, create_session, get_user_by_email

router = APIRouter(prefix="/auth", tags=["Email Login"])

class EmailLoginRequest(BaseModel):
    email: str
    password: str

class EmailRegisterRequest(BaseModel):
    email: str
    password: str
    name: str

def hash_password(password: str) -> str:
    """Hash le password avec SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Vérifie le password"""
    return hash_password(password) == hashed

@router.post("/login/email")
async def login_email(request: Request, login_data: EmailLoginRequest):
    """Connexion avec email et mot de passe"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Chercher l'utilisateur
    cursor.execute("SELECT * FROM users WHERE email = %s", (login_data.email,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        return JSONResponse(
            status_code=401,
            content={"error": "Email ou mot de passe incorrect"}
        )
    
    # Vérifier le provider (doit être 'email')
    if user['provider'] != 'email':
        cursor.close()
        conn.close()
        return JSONResponse(
            status_code=401,
            content={"error": f"Ce compte est connecté avec {user['provider']}. Veuillez utiliser {user['provider']} pour vous connecter."}
        )
    
    # Vérifier le password (si vous avez un champ password_hash)
    # Raha mbola tsy manana ny column password_hash dia mila manampy aloha
    
    # Créer session
    session_token = create_session(user['id'], request)
    
    cursor.close()
    conn.close()
    
    return {
        "session_token": session_token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "provider": user['provider']
        }
    }

@router.post("/register/email")
async def register_email(request: Request, register_data: EmailRegisterRequest):
    """Inscription avec email et mot de passe"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Vérifier si l'email existe déjà
    cursor.execute("SELECT * FROM users WHERE email = %s", (register_data.email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        cursor.close()
        conn.close()
        return JSONResponse(
            status_code=400,
            content={"error": "Cet email est déjà utilisé"}
        )
    
    # Hasher le password
    password_hash = hash_password(register_data.password)
    
    # Créer l'utilisateur
    from datetime import datetime
    now = datetime.now()
    
    cursor.execute("""
        INSERT INTO users (email, name, provider, password_hash, last_login, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (register_data.email, register_data.name, "email", password_hash, now, now, now))
    
    user_id = cursor.lastrowid
    conn.commit()
    
    # Créer session
    session_token = create_session(user_id, request)
    
    cursor.close()
    conn.close()
    
    return {
        "session_token": session_token,
        "user": {
            "id": user_id,
            "email": register_data.email,
            "name": register_data.name,
            "provider": "email"
        }
    }