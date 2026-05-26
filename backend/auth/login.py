# auth/login.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import bcrypt
import secrets
from datetime import datetime, timedelta
from mysql.connector import pooling
from config import config

# Configuration MySQL
MYSQL_CONFIG = config.MYSQL_CONFIG

# Création du connection pool MySQL
connection_pool = pooling.MySQLConnectionPool(**MYSQL_CONFIG)

def get_db_connection():
    """Retourne une connexion MySQL depuis le pool"""
    return connection_pool.get_connection()

def create_session(user_id: int, request: Request) -> str:
    """Crée une session pour l'utilisateur"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=30)
    
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    cursor.execute("""
        INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
        VALUES (%s, %s, %s, %s, %s)
    """, (user_id, session_token, ip_address, user_agent, expires_at))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return session_token

router = APIRouter(tags=["Email Authentication"])

# Modèles Pydantic
class EmailLoginRequest(BaseModel):
    email: str
    password: str

class EmailRegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class EmailChangePasswordRequest(BaseModel):
    email: str
    old_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str


def hash_password(password: str) -> str:
    """Hash le password avec bcrypt"""
    salt = bcrypt.gensalt(rounds=12)  # 12 rounds = sécurisé
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Vérifie le password avec bcrypt"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


# ========== ROUTES ==========

@router.post("/auth/register")
async def register_email(request: Request, register_data: EmailRegisterRequest):
    """Inscription avec email et mot de passe"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Vérifier si l'email existe déjà
        cursor.execute("SELECT * FROM users WHERE email = %s", (register_data.email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            return JSONResponse(
                status_code=400,
                content={"error": "Cet email est déjà utilisé"}
            )
        
        # Hasher le password avec bcrypt
        password_hash = hash_password(register_data.password)
        
        # Créer l'utilisateur
        now = datetime.now()
        
        cursor.execute("""
            INSERT INTO users (email, name, provider, password_hash, last_login, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (register_data.email, register_data.name, "email", password_hash, now, now, now))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Créer session
        session_token = create_session(user_id, request)
        
        return {
            "success": True,
            "session_token": session_token,
            "user": {
                "id": user_id,
                "email": register_data.email,
                "name": register_data.name,
                "provider": "email"
            }
        }
        
    except Exception as e:
        conn.rollback()
        return JSONResponse(
            status_code=500,
            content={"error": f"Erreur lors de l'inscription: {str(e)}"}
        )
    finally:
        cursor.close()
        conn.close()


@router.post("/auth/login/email")
async def login_email(request: Request, login_data: EmailLoginRequest):
    """Connexion avec email et mot de passe"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Chercher l'utilisateur
        cursor.execute("SELECT * FROM users WHERE email = %s", (login_data.email,))
        user = cursor.fetchone()
        
        if not user:
            return JSONResponse(
                status_code=401,
                content={"error": "Email ou mot de passe incorrect"}
            )
        
        # Vérifier le provider
        if user['provider'] != 'email':
            # Raha google na github, alefaso any amin'ny OAuth login
            return JSONResponse(
                status_code=401,
                content={
                    "error": f"Ce compte est connecté avec {user['provider']}",
                    "provider": user['provider'],
                    "redirect": f"/login/{user['provider']}"
                }
            )
        
        # Vérifier le password_hash existe
        if not user.get('password_hash'):
            return JSONResponse(
                status_code=401,
                content={"error": "Ce compte n'a pas de mot de passe. Utilisez la connexion sociale."}
            )
        
        # Vérifier le password avec bcrypt
        if not verify_password(login_data.password, user['password_hash']):
            return JSONResponse(
                status_code=401,
                content={"error": "Email ou mot de passe incorrect"}
            )
        
        # Mettre à jour last_login
        now = datetime.now()
        cursor.execute(
            "UPDATE users SET last_login = %s, updated_at = %s WHERE id = %s",
            (now, now, user['id'])
        )
        conn.commit()
        
        # Créer session
        session_token = create_session(user['id'], request)
        
        return {
            "success": True,
            "session_token": session_token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "provider": user['provider'],
                "role": user['role'],
                "avatar_url": user.get('avatar_url')
            }
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Erreur lors de la connexion: {str(e)}"}
        )
    finally:
        cursor.close()
        conn.close()


@router.post("/auth/change-password")
async def change_password(request: Request, change_data: EmailChangePasswordRequest):
    """Changer le mot de passe"""
    session_token = request.headers.get("X-Session-Token")
    
    if not session_token:
        return JSONResponse(
            status_code=401,
            content={"error": "Non authentifié"}
        )
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Vérifier la session
        cursor.execute("""
            SELECT user_id FROM user_sessions 
            WHERE session_token = %s AND expires_at > %s
        """, (session_token, datetime.now()))
        
        session = cursor.fetchone()
        if not session:
            return JSONResponse(
                status_code=401,
                content={"error": "Session invalide ou expirée"}
            )
        
        # Chercher l'utilisateur
        cursor.execute("SELECT * FROM users WHERE id = %s AND email = %s", 
                      (session['user_id'], change_data.email))
        user = cursor.fetchone()
        
        if not user:
            return JSONResponse(
                status_code=404,
                content={"error": "Utilisateur non trouvé"}
            )
        
        if user['provider'] != 'email':
            return JSONResponse(
                status_code=400,
                content={"error": "Ce compte utilise la connexion sociale"}
            )
        
        # Vérifier l'ancien mot de passe avec bcrypt
        if not verify_password(change_data.old_password, user['password_hash']):
            return JSONResponse(
                status_code=401,
                content={"error": "Ancien mot de passe incorrect"}
            )
        
        # Changer le mot de passe (hash avec bcrypt)
        new_password_hash = hash_password(change_data.new_password)
        cursor.execute(
            "UPDATE users SET password_hash = %s, updated_at = %s WHERE id = %s",
            (new_password_hash, datetime.now(), user['id'])
        )
        conn.commit()
        
        return {"success": True, "message": "Mot de passe changé avec succès"}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        cursor.close()
        conn.close()


@router.post("/auth/forgot-password")
async def forgot_password(forgot_data: ForgotPasswordRequest):
    """Demande de réinitialisation de mot de passe"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s AND provider = 'email'", 
                      (forgot_data.email,))
        user = cursor.fetchone()
        
        if not user:
            # Pour des raisons de sécurité, on ne dit pas si l'email existe
            return {"success": True, "message": "Si cet email existe, un lien de réinitialisation a été envoyé"}
        
        # Générer un token de réinitialisation
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=24)
        
        # Sauvegarder le token
        cursor.execute("""
            INSERT INTO password_resets (email, token, expires_at)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE token = %s, expires_at = %s, used = 0
        """, (forgot_data.email, reset_token, expires_at, reset_token, expires_at))
        conn.commit()
        
        # Ici, envoyer un email avec le lien
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}&email={forgot_data.email}"
        print(f"🔐 Lien de réinitialisation: {reset_link}")
        
        return {"success": True, "message": "Si cet email existe, un lien de réinitialisation a été envoyé"}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        cursor.close()
        conn.close()


@router.post("/auth/reset-password")
async def reset_password(reset_data: ResetPasswordRequest):
    """Réinitialiser le mot de passe avec token"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Vérifier le token
        cursor.execute("""
            SELECT * FROM password_resets 
            WHERE email = %s AND token = %s AND expires_at > %s AND used = 0
        """, (reset_data.email, reset_data.token, datetime.now()))
        
        reset_entry = cursor.fetchone()
        
        if not reset_entry:
            return JSONResponse(
                status_code=400,
                content={"error": "Lien invalide ou expiré"}
            )
        
        # Mettre à jour le mot de passe avec bcrypt
        new_password_hash = hash_password(reset_data.new_password)
        cursor.execute(
            "UPDATE users SET password_hash = %s, updated_at = %s WHERE email = %s",
            (new_password_hash, datetime.now(), reset_data.email)
        )
        
        # Marquer le token comme utilisé
        cursor.execute(
            "UPDATE password_resets SET used = 1 WHERE id = %s",
            (reset_entry['id'],)
        )
        conn.commit()
        
        return {"success": True, "message": "Mot de passe réinitialisé avec succès"}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/auth/check-email/{email}")
async def check_email_exists(email: str):
    """Vérifier si un email existe déjà"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id, provider FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        return {
            "exists": user is not None,
            "provider": user['provider'] if user else None
        }
    finally:
        cursor.close()
        conn.close()