import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from mysql.connector import pooling
from datetime import datetime, timedelta
import secrets
from .login import router as login_router
from .admin import router as admin_router
from .cookie import router as cookie_router
# Import de la configuration
from config import config

load_dotenv()

# ---------- CONFIGURATION ----------
SECRET_KEY = config.SECRET_KEY
FRONTEND_URL = "https://codentsikav1.andriamtaratra5.workers.dev"

# Configuration MySQL depuis config.py
MYSQL_CONFIG = config.MYSQL_CONFIG

# Création du connection pool MySQL
connection_pool = pooling.MySQLConnectionPool(**MYSQL_CONFIG)

def get_db_connection():
    """Retourne une connexion MySQL depuis le pool"""
    return connection_pool.get_connection()

import json
import re
import asyncio

def generate_and_save_mock_apis(count: int = 5):
    """
    Appelle l'IA pour générer 5 configurations d'API REST fictives (mock) réalistes et modernes,
    puis les stocke dans la table `mock_apis` de MySQL.
    """
    from .aiassistant import call_ai_chat

    prompt = (
        f"Génère exactement un tableau JSON de {count} configurations d'API REST modernes, professionnelles et réalistes "
        f"utiles pour le développement web/mobile (ex: banque, météo, e-commerce, cryptomonnaie, messagerie, etc.).\n\n"
        f"Chaque objet du tableau doit obligatoirement avoir les clés exactes suivantes :\n"
        f"- 'name' : le nom de l'API (ex: 'Création de Cartes Virtuelles')\n"
        f"- 'path' : le chemin d'URL relatif sans slash au début ni à la fin (ex: 'cards', 'weather/forecast', 'products/search')\n"
        f"- 'method' : le verbe HTTP ('GET', 'POST', 'PUT', 'DELETE')\n"
        f"- 'description' : une description concise en français du rôle de l'API\n"
        f"- 'response_body' : un objet JSON (ou tableau JSON) contenant des données simulées réalistes, riches et modernes "
        f"représentant la réponse de l'API.\n\n"
        f"Retourne UNIQUEMENT le tableau JSON brut valide. Ne mets pas d'explication textuelle, pas de phrases d'introduction "
        f"ni de conclusion, et n'utilise pas de backticks de code markdown. Exemple de format de retour :\n"
        f"[\n"
        f"  {{\n"
        f"    \"name\": \"Virtual Cards\",\n"
        f"    \"path\": \"cards\",\n"
        f"    \"method\": \"GET\",\n"
        f"    \"description\": \"Récupère les cartes bancaires virtuelles.\",\n"
        f"    \"response_body\": {{\"status\": \"success\", \"cards\": []}}\n"
        f"  }}\n"
        f"]"
    )

    try:
        response = call_ai_chat([{"role": "user", "content": prompt}])
        content = response.get("content", "").strip()

        # Nettoyage robuste si l'IA inclut des blocs markdown de code JSON
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n", "", content)
            content = re.sub(r"\n```$", "", content)
        content = content.strip()

        # Essayer de décoder le JSON
        apis = json.loads(content)
        if not isinstance(apis, list):
            raise Exception("Le format retourné par l'IA n'est pas un tableau.")

        conn = get_db_connection()
        cursor = conn.cursor()

        saved_count = 0
        for api in apis:
            name = api.get("name", "Mock API")
            path = api.get("path", "").strip().strip("/")
            method = api.get("method", "GET").upper()
            description = api.get("description", "")
            response_body_data = api.get("response_body", {})

            # Si le path est vide, ignorer
            if not path:
                continue

            # Convertir le response_body en string JSON propre
            response_body = json.dumps(response_body_data, ensure_ascii=False)

            try:
                # INSERT IGNORE ou ON DUPLICATE KEY UPDATE pour éviter les plantages
                cursor.execute("""
                    INSERT INTO mock_apis (name, path, method, description, response_body)
                    VALUES (%s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        method = VALUES(method),
                        description = VALUES(description),
                        response_body = VALUES(response_body)
                """, (name, path, method, description, response_body))
                saved_count += 1
            except Exception as e:
                print(f"Error saving specific mock API: {e}")

        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ {saved_count} mock APIs generated and saved in MySQL successfully!")
        return saved_count

    except Exception as e:
        print(f"❌ Error during mock API generation task: {e}")
        return 0

def seed_initial_apis_if_empty():
    """
    Génère 10 mock APIs lors du premier démarrage si la base est vide.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM mock_apis")
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        if count == 0:
            print("🚀 La base de mock_apis est vide. Lancement de la génération initiale de 10 APIs...")
            generate_and_save_mock_apis(10)
    except Exception as e:
        print(f"Error checking or seeding initial APIs: {e}")

async def hourly_api_generator_loop():
    """
    Tâche d'arrière-plan périodique qui s'exécute chaque heure.
    Elle génère 5 nouveaux mock APIs automatiquement.
    """
    # Attendre quelques secondes après le démarrage complet d'Uvicorn
    await asyncio.sleep(5)

    # Seeder si vide dans un thread pool pour ne pas bloquer l'event loop asyncio de FastAPI
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, seed_initial_apis_if_empty)
    except Exception as e:
        print(f"Error executing startup seed task in executor: {e}")

    while True:
        await asyncio.sleep(3600)
        print("⏰ Exécution de la tâche périodique : Génération de 5 nouvelles mock APIs...")
        try:
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, generate_and_save_mock_apis, 5)
        except Exception as e:
            print(f"Error in background mock api loop execution: {e}")

def init_database():
    """Initialise les tables si elles n'existent pas"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Création table users (MISY EMAIL PROVIDER)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(191) NOT NULL UNIQUE,
            name VARCHAR(191),
            provider ENUM('google', 'github', 'email') NOT NULL,
            provider_id VARCHAR(191),
            password_hash VARCHAR(191) NULL,
            avatar_url TEXT,
            role ENUM('user', 'admin') DEFAULT 'user',
            plan VARCHAR(50) DEFAULT 'Gratuit',
            is_active BOOLEAN DEFAULT TRUE,
            last_login DATETIME,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            INDEX idx_email (email),
            INDEX idx_provider (provider),
            INDEX idx_provider_id (provider_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    # Vider les résultats non lus
    cursor.fetchall()

    # Ajouter la colonne plan si elle n'existe pas pour les bases existantes
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN plan VARCHAR(50) DEFAULT 'Gratuit'")
        cursor.fetchall()
    except Exception:
        pass

    # Création table sessions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(191) NOT NULL UNIQUE,
            ip_address VARCHAR(45),
            user_agent TEXT,
            expires_at DATETIME NOT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_session_token (session_token),
            INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    # Création table password_resets
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(191) NOT NULL,
            token VARCHAR(191) NOT NULL,
            expires_at DATETIME NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            INDEX idx_token (token),
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    # Création table api_keys (optionnel)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_keys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            api_key VARCHAR(64) NOT NULL UNIQUE,
            name VARCHAR(191),
            last_used DATETIME,
            expires_at DATETIME,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_api_key (api_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    # Création table conversations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(191) NOT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    # Création table messages
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT NOT NULL,
            role ENUM('user', 'assistant') NOT NULL,
            content LONGTEXT NOT NULL,
            image_url LONGTEXT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            INDEX idx_conversation_id (conversation_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    # Création table mock_apis
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mock_apis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(191) NOT NULL,
            path VARCHAR(191) NOT NULL,
            method VARCHAR(10) NOT NULL,
            description TEXT,
            response_body LONGTEXT NOT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            UNIQUE KEY unique_path_method (path, method)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    # Création table generated_projects
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS generated_projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            project_name VARCHAR(191) NOT NULL,
            description TEXT,
            framework VARCHAR(50) NOT NULL,
            prompt TEXT,
            files_count INT DEFAULT 0,
            files_data LONGTEXT,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    # Création table cookie_consents
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cookie_consents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            session_id VARCHAR(191) NULL,
            necessary BOOLEAN DEFAULT TRUE,
            analytics BOOLEAN DEFAULT FALSE,
            marketing BOOLEAN DEFAULT FALSE,
            preferences BOOLEAN DEFAULT FALSE,
            consent_status VARCHAR(50) NOT NULL,
            user_agent TEXT NULL,
            ip_address VARCHAR(45) NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_session_id (session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    cursor.fetchall()

    conn.commit()
    cursor.close()
    conn.close()

    print("✅ Database initialized successfully")

def save_or_update_user(email: str, name: str, provider: str, provider_id: str = None, avatar_url: str = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    now = datetime.now()

    if user:
        cursor.execute("""
            UPDATE users 
            SET provider = %s,
                provider_id = %s,
                name = %s,
                avatar_url = %s,
                last_login = %s,
                updated_at = %s
            WHERE email = %s
        """, (provider, provider_id, name, avatar_url, now, now, email))
        user_id = user["id"]
    else:
        cursor.execute("""
            INSERT INTO users (email, name, provider, provider_id, avatar_url, last_login, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (email, name, provider, provider_id, avatar_url, now, now, now))
        user_id = cursor.lastrowid

    conn.commit()
    cursor.close()
    conn.close()

    return user_id

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

def get_user_by_session(session_token: str):
    """Récupère l'utilisateur à partir du token de session"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT u.* FROM users u
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > %s
    """, (session_token, datetime.now()))

    user = cursor.fetchone()
    cursor.close()
    conn.close()

    return user

# ---------- FASTAPI APP ----------

app = FastAPI(title="Codentsika Auth API", version="1.0.0")

# Middlewares
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://codentsikav1.andriamtaratra5.workers.dev",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth Configuration
oauth = OAuth()

# Google OAuth
oauth.register(
    name="google",
    client_id=config.GOOGLE_CLIENT_ID,
    client_secret=config.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# GitHub OAuth
oauth.register(
    name="github",
    client_id=config.GITHUB_CLIENT_ID,
    client_secret=config.GITHUB_CLIENT_SECRET,
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "read:user user:email"},
)

# Initialiser la base de données au démarrage
@app.on_event("startup")
async def startup_event():
    init_database()
    print("🚀 Codentsika Auth API is running!")
    print(f"📍 Frontend URL: {FRONTEND_URL}")
    print(f"🗄️  Database: {MYSQL_CONFIG['database']} on {MYSQL_CONFIG['host']}")

# ---------- ROUTES ----------

@app.get("/")
def home():
    return {
        "message": "Codentsika Auth API is running",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "google_login": "/login/google",
            "github_login": "/login/github",
            "email_login": "/auth/login/email",
            "register": "/auth/register",
            "me": "/api/me",
            "logout": "/api/logout",
            "health": "/api/health"
        }
    }

@app.get("/login/google")
async def login_google(request: Request):
    redirect_uri = request.url_for("auth_google")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/login/github")
async def login_github(request: Request):
    redirect_uri = request.url_for("auth_github")
    return await oauth.github.authorize_redirect(request, redirect_uri)

# ========== GOOGLE CALLBACK AVEC GESTION D'ERREUR ==========
@app.get("/auth/google/callback")
async def auth_google(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get("userinfo")

        if not user:
            user = await oauth.google.parse_id_token(request, token)

        email = user.get("email")
        name = user.get("name")
        provider_id = user.get("sub")
        avatar_url = user.get("picture")

        if not email:
            return RedirectResponse(
                url=f"{FRONTEND_URL}/signin?error=no_email&error_description=No email found from Google"
            )

        # Sauvegarder dans la base
        user_id = save_or_update_user(email, name, "google", provider_id, avatar_url)

        # Créer session
        session_token = create_session(user_id, request)

        # Rediriger avec le token de session
        return RedirectResponse(
            url=f"{FRONTEND_URL}/signin?session_token={session_token}&provider=google&email={email}&name={name}"
        )
    except Exception as e:
        error_msg = str(e)
        print(f"Google auth error: {error_msg}")

        if "already registered" in error_msg.lower() or "email already" in error_msg.lower():
            return RedirectResponse(
                url=f"{FRONTEND_URL}/signin?error=email_exists&error_description={error_msg}"
            )

        return RedirectResponse(
            url=f"{FRONTEND_URL}/signin?error=auth_failed&error_description={error_msg}"
        )

# ========== GITHUB CALLBACK AVEC GESTION D'ERREUR ==========
@app.get("/auth/github/callback")
async def auth_github(request: Request):
    try:
        token = await oauth.github.authorize_access_token(request)

        user_response = await oauth.github.get("user", token=token)
        user = user_response.json()

        email = user.get("email")
        provider_id = str(user.get("id"))
        name = user.get("name") or user.get("login")
        avatar_url = user.get("avatar_url")

        if not email:
            emails_response = await oauth.github.get("user/emails", token=token)
            emails = emails_response.json()
            primary_email = next(
                (item for item in emails if item.get("primary") and item.get("verified")),
                None,
            )
            if primary_email:
                email = primary_email.get("email")

        if not email:
            return RedirectResponse(
                url=f"{FRONTEND_URL}/signin?error=no_email&error_description=No email found from GitHub"
            )

        user_id = save_or_update_user(email, name, "github", provider_id, avatar_url)
        session_token = create_session(user_id, request)

        return RedirectResponse(
            url=f"{FRONTEND_URL}/signin?session_token={session_token}&provider=github&email={email}&name={name}"
        )
    except Exception as e:
        error_msg = str(e)
        print(f"github auth error: {error_msg}")

        if "already registered" in error_msg.lower() or "email already" in error_msg.lower():
            return RedirectResponse(
                url=f"{FRONTEND_URL}/signin?error=email_exists&error_description={error_msg}"
            )

        return RedirectResponse(
            url=f"{FRONTEND_URL}/signin?error=auth_failed&error_description={error_msg}"
        )

# ========== AUTRES ROUTES ==========
@app.get("/api/me")
async def get_current_user(request: Request):
    """Récupère l'utilisateur connecté via son session_token"""
    session_token = request.headers.get("X-Session-Token")

    if not session_token:
        session_token = request.query_params.get("session_token")

    if not session_token:
        raise HTTPException(status_code=401, detail="No session token provided")

    user = get_user_by_session(session_token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "provider": user["provider"],
        "role": user["role"],
        "avatar_url": user.get("avatar_url"),
        "is_active": user.get("is_active"),
        "plan": user.get("plan") or "Gratuit"
    }

@app.post("/api/logout")
async def logout(request: Request):
    """Déconnexion - supprime la session"""
    session_token = request.headers.get("X-Session-Token")

    if not session_token:
        session_token = request.query_params.get("session_token")

    if session_token:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_sessions WHERE session_token = %s", (session_token,))
        conn.commit()
        cursor.close()
        conn.close()

    return {"message": "Logged out successfully"}

@app.get("/api/health")
async def health_check():
    """Vérifie la connexion à la base de données"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchall()  # ZAVA-DEHIBE: Vider les résultats non lus
        cursor.close()
        conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

from pydantic import BaseModel
from typing import List, Optional
from .aiassistant import call_ai_chat

# Helper functions for Conversations & Messages in MySQL
def get_user_conversations(user_id: int) -> list:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, title, created_at, updated_at FROM conversations WHERE user_id = %s ORDER BY updated_at DESC",
            (user_id,)
        )
        conversations = cursor.fetchall()
        for conv in conversations:
            if isinstance(conv.get("created_at"), datetime):
                conv["created_at"] = conv["created_at"].isoformat()
            if isinstance(conv.get("updated_at"), datetime):
                conv["updated_at"] = conv["updated_at"].isoformat()
        return conversations
    finally:
        cursor.close()
        conn.close()

def create_conversation(user_id: int, title: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO conversations (user_id, title) VALUES (%s, %s)",
            (user_id, title)
        )
        conn.commit()
        conv_id = cursor.lastrowid
        cursor.execute("SELECT id, title, created_at, updated_at FROM conversations WHERE id = %s", (conv_id,))
        conversation = cursor.fetchone()
        if conversation:
            if isinstance(conversation.get("created_at"), datetime):
                conversation["created_at"] = conversation["created_at"].isoformat()
            if isinstance(conversation.get("updated_at"), datetime):
                conversation["updated_at"] = conversation["updated_at"].isoformat()
        return conversation
    finally:
        cursor.close()
        conn.close()

def delete_conversation(user_id: int, conversation_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check first if conversation belongs to user
        cursor.execute(
            "SELECT id FROM conversations WHERE id = %s AND user_id = %s",
            (conversation_id, user_id)
        )
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=403, detail="Non autorisé à supprimer cette conversation")

        cursor.execute("DELETE FROM conversations WHERE id = %s", (conversation_id,))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def get_conversation_messages(conversation_id: int) -> list:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, role, content, image_url, created_at FROM messages WHERE conversation_id = %s ORDER BY created_at ASC",
            (conversation_id,)
        )
        messages = cursor.fetchall()
        for msg in messages:
            if isinstance(msg.get("created_at"), datetime):
                msg["created_at"] = msg["created_at"].isoformat()
        return messages
    finally:
        cursor.close()
        conn.close()

def add_message_to_conversation(conversation_id: int, role: str, content: str, image_url: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO messages (conversation_id, role, content, image_url) VALUES (%s, %s, %s, %s)",
            (conversation_id, role, content, image_url)
        )
        cursor.execute(
            "UPDATE conversations SET updated_at = NOW() WHERE id = %s",
            (conversation_id,)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


# API routes for conversations
@app.get("/api/conversations")
async def list_conversations(request: Request):
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    return get_user_conversations(user["id"])

@app.post("/api/conversations")
async def create_new_conversation(request: Request, data: dict):
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    title = data.get("title", "Nouvelle discussion")
    return create_conversation(user["id"], title)

@app.delete("/api/conversations/{conversation_id}")
async def remove_conversation(conversation_id: int, request: Request):
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    delete_conversation(user["id"], conversation_id)
    return {"status": "success", "message": "Conversation supprimée"}

@app.get("/api/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: int, request: Request):
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    # Verify ownership
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM conversations WHERE id = %s AND user_id = %s",
        (conversation_id, user["id"])
    )
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=403, detail="Non autorisé à lire cette conversation")
    cursor.close()
    conn.close()

    return get_conversation_messages(conversation_id)


class ChatMessage(BaseModel):
    role: str
    content: str
    image_url: Optional[str] = None

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    messages: List[ChatMessage]

@app.post("/api/chat")
async def chat_ai(request: Request, chat_data: ChatRequest):
    """Chat avec l'IA NVIDIA avec persistance MySQL et Streaming"""
    # Authentification de la session
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Non authentifié")

    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    # 1. Vérifier ou créer la conversation
    conv_id = chat_data.conversation_id
    last_user_msg = chat_data.messages[-1] if chat_data.messages else None

    if not last_user_msg:
        raise HTTPException(status_code=400, detail="Aucun message fourni")

    if not conv_id:
        title = last_user_msg.content[:40] if last_user_msg.content else "Nouvelle discussion"
        conv = create_conversation(user["id"], title)
        conv_id = conv["id"]

    # 2. Sauvegarder le dernier message de l'utilisateur dans MySQL (avec image éventuelle)
    add_message_to_conversation(
        conversation_id=conv_id,
        role="user",
        content=last_user_msg.content,
        image_url=last_user_msg.image_url
    )

    # 3. Récupérer l'historique complet pour alimenter le contexte IA
    db_messages = get_conversation_messages(conv_id)
    api_messages = []
    for msg in db_messages:
        api_messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    from .aiassistant import stream_ai_chat
    from fastapi.responses import StreamingResponse

    # 4. Envelopper le générateur pour capturer et sauvegarder la réponse finale de l'assistant
    async def response_generator():
        full_assistant_response = ""
        # Envoyer l'ID de conversation au tout début du flux pour informer le frontend
        yield f"[[CONVERSATION_ID:{conv_id}]]"

        async for chunk in stream_ai_chat(api_messages):
            full_assistant_response += chunk
            yield chunk

        # Sauvegarder dans MySQL une fois le flux entièrement reçu et reconstitué
        if full_assistant_response:
            add_message_to_conversation(
                conversation_id=conv_id,
                role="assistant",
                content=full_assistant_response
            )

    try:
        return StreamingResponse(
            response_generator(),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ---------- GENERATEUR DE MOCK APIS ----------

@app.api_route("/api/mock/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
def handle_mock_api(path: str, request: Request):
    """
    Route dynamique générique qui intercepte tous les appels vers /api/mock/...
    et sert le JSON simulé correspondant stocké en base.
    """
    path = path.strip().strip("/")
    method = request.method.upper()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT response_body FROM mock_apis
        WHERE path = %s AND method = %s
    """, (path, method))
    mock_api = cursor.fetchone()

    cursor.close()
    conn.close()

    if not mock_api:
        raise HTTPException(
            status_code=404,
            detail=f"Mock endpoint not found for PATH '{path}' and METHOD '{method}'"
        )

    try:
        response_data = json.loads(mock_api["response_body"])
        return JSONResponse(content=response_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse mock response JSON: {str(e)}"
        )

@app.get("/api/generator/apis")
def get_generator_apis(search: str = None, limit: int = 10):
    """
    Récupère la liste des APIs mockées générées, filtrable par recherche.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if search:
        query = """
            SELECT id, name, path, method, description, response_body, created_at
            FROM mock_apis
            WHERE name LIKE %s OR path LIKE %s OR description LIKE %s
            ORDER BY created_at DESC
            LIMIT %s
        """
        search_param = f"%{search}%"
        cursor.execute(query, (search_param, search_param, search_param, limit))
    else:
        query = """
            SELECT id, name, path, method, description, response_body, created_at
            FROM mock_apis
            ORDER BY created_at DESC
            LIMIT %s
        """
        cursor.execute(query, (limit,))

    apis = cursor.fetchall()
    cursor.close()
    conn.close()

    for api in apis:
        try:
            api["response_body"] = json.loads(api["response_body"])
        except Exception:
            api["response_body"] = {}

    return apis

@app.post("/api/generator/trigger")
def trigger_generator():
    """
    Déclenche manuellement la génération de 5 nouvelles mock APIs par l'IA.
    """
    try:
        saved_count = generate_and_save_mock_apis(5)
        return {
            "success": True,
            "message": f"Génération complétée ! {saved_count} nouvelles APIs mockées ajoutées avec succès (les doublons ont été ignorés)."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de génération : {str(e)}"
        )


class ProjectRequest(BaseModel):
    framework: str
    prompt: str
    tables: list[dict] = []
    relations: list[dict] = []
    options: dict = {}


class ProjectFile(BaseModel):
    path: str
    content: str


class ProjectZipRequest(BaseModel):
    project_name: str
    files: list[ProjectFile]


@app.post("/api/generator/project")
async def generate_project(request: Request, req: ProjectRequest):
    """
    Génère la structure de fichiers et les codes sources d'un projet FastAPI via l'IA.
    Exécuté dans un thread séparé pour ne pas bloquer l'event loop uvicorn.
    Sauvegarde le projet en base de données.
    """
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Token de session manquant")

    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expirée ou invalide")

    try:
        from auth.aibackend import call_ai_project_builder
        print(f"🚀 Scaffolding {req.framework} project: {req.prompt[:50]}...")
        print(f"  Tables: {len(req.tables)}, Relations: {len(req.relations)}")

        # Générer le projet avec l'IA
        project_data = await asyncio.to_thread(
            call_ai_project_builder,
            req.framework,
            req.prompt,
            req.tables,
            req.relations,
            req.options
        )
        print(f"✅ Project generated: {len(project_data.get('files', []))} files")

        # Sauvegarder en base de données
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            insert_query = """
                INSERT INTO generated_projects
                (user_id, project_name, description, framework, prompt, files_count, files_data)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """

            cursor.execute(insert_query, (
                user['id'],
                project_data['project_name'],
                project_data.get('description', ''),
                req.framework,
                req.prompt,
                len(project_data.get('files', [])),
                json.dumps(project_data['files'])
            ))

            project_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()

            print(f"💾 Projet sauvegardé en BDD avec l'ID: {project_id}")

            # Ajouter l'ID au résultat
            project_data['id'] = project_id

        except Exception as db_error:
            print(f"⚠️ Erreur sauvegarde BDD: {db_error}")
            # On continue même si la sauvegarde échoue

        return project_data

    except Exception as e:
        import traceback
        print(f"❌ ERREUR BACKEND: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generator/project/zip")
async def download_project_zip(request: Request, req: ProjectZipRequest):
    """
    Reçoit la liste des fichiers générés et compile à la volée un zip en mémoire RAM
    sans stockage local, retourné sous forme de flux binaire de téléchargement.
    """
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Token de session manquant")

    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expirée ou invalide")

    import io
    import zipfile
    from fastapi.responses import StreamingResponse

    zip_buffer = io.BytesIO()
    try:
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for file in req.files:
                clean_path = file.path.lstrip("/")
                zip_file.writestr(clean_path, file.content)

        zip_buffer.seek(0)
        filename = f"{req.project_name}.zip" if req.project_name else "codentsika_project.zip"

        return StreamingResponse(
            zip_buffer,
            media_type="application/x-zip-compressed",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la compression ZIP : {str(e)}")


@app.get("/api/projects")
async def get_user_projects(request: Request):
    """
    Récupère tous les projets générés par l'utilisateur connecté
    """
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Token de session manquant")

    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expirée ou invalide")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Récupérer les projets de l'utilisateur (sans le contenu des fichiers)
        query = """
            SELECT id, project_name, description, framework, prompt,
                   files_count, created_at, updated_at
            FROM generated_projects
            WHERE user_id = %s
            ORDER BY created_at DESC
        """

        cursor.execute(query, (user['id'],))
        projects = cursor.fetchall()

        cursor.close()
        conn.close()

        # Convertir les dates en chaînes ISO
        for project in projects:
            if project.get('created_at'):
                project['created_at'] = project['created_at'].isoformat()
            if project.get('updated_at'):
                project['updated_at'] = project['updated_at'].isoformat()

        return {"projects": projects}

    except Exception as e:
        import traceback
        print(f"❌ Erreur récupération projets: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}")
async def get_project_detail(project_id: int, request: Request):
    """
    Récupère le détail complet d'un projet (avec les fichiers)
    """
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Token de session manquant")

    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expirée ou invalide")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Récupérer le projet avec les fichiers
        query = """
            SELECT *
            FROM generated_projects
            WHERE id = %s AND user_id = %s
        """

        cursor.execute(query, (project_id, user['id']))
        project = cursor.fetchone()

        cursor.close()
        conn.close()

        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")

        # Parser le JSON des fichiers
        try:
            project['files'] = json.loads(project['files_data'])
            del project['files_data']  # Supprimer le champ brut
        except Exception:
            project['files'] = []

        # Convertir les dates
        if project.get('created_at'):
            project['created_at'] = project['created_at'].isoformat()
        if project.get('updated_at'):
            project['updated_at'] = project['updated_at'].isoformat()

        return project

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"❌ Erreur récupération projet: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: int, request: Request):
    """
    Supprime un projet généré
    """
    session_token = request.headers.get("X-Session-Token") or request.query_params.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Token de session manquant")

    user = get_user_by_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expirée ou invalide")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Supprimer le projet
        query = "DELETE FROM generated_projects WHERE id = %s AND user_id = %s"
        cursor.execute(query, (project_id, user['id']))

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Projet non trouvé")

        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Projet supprimé avec succès"}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"❌ Erreur suppression projet: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# Inclure les routes de login.py (email authentication)
app.include_router(login_router)
app.include_router(admin_router)
app.include_router(cookie_router)
