# auth/admin.py
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
import bcrypt
import secrets
from datetime import datetime, timedelta
from mysql.connector import pooling
from config import config

MYSQL_CONFIG = config.MYSQL_CONFIG
connection_pool = pooling.MySQLConnectionPool(**MYSQL_CONFIG)

def get_db_connection():
    return connection_pool.get_connection()

def verify_admin_session(request: Request):
    session_token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not session_token:
        raise HTTPException(status_code=401, detail="No authorization token")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT u.id, u.email, u.name, u.role, s.expires_at
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.session_token = %s AND u.role = 'admin'
        """, (session_token,))

        session = cursor.fetchone()

        if not session:
            raise HTTPException(status_code=401, detail="Unauthorized or session expired")

        expires_at = session["expires_at"]

        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)

        if expires_at < datetime.now():
            raise HTTPException(status_code=401, detail="Session expired")

        return session

    finally:
        cursor.close()
        conn.close()

router = APIRouter(prefix="/admin", tags=["Admin"])

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    session_token: str | None = None
    message: str

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(request_data: AdminLoginRequest, request: Request):
    email = request_data.email.strip().lower()
    password = request_data.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id, password_hash, role, name
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied: admin role required")

        if not user["password_hash"]:
            raise HTTPException(status_code=401, detail="No password configured for this admin")

        if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(days=30)
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

        cursor.execute("""
            INSERT INTO user_sessions 
            (user_id, session_token, ip_address, user_agent, expires_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (user["id"], session_token, ip_address, user_agent, expires_at))

        conn.commit()

        return AdminLoginResponse(
            success=True,
            session_token=session_token,
            message=f"Welcome admin {user['name']}"
        )

    finally:
        cursor.close()
        conn.close()

@router.get("/dashboard/stats")
async def get_dashboard_stats(session: dict = Depends(verify_admin_session)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total_users = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as total FROM user_sessions WHERE expires_at > NOW()")
        active_sessions = cursor.fetchone()["total"]

        cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        roles = cursor.fetchall()

        cursor.execute("""
            SELECT COUNT(*) as total
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        recent_registrations = cursor.fetchone()["total"]

        return {
            "total_users": total_users,
            "active_sessions": active_sessions,
            "roles": roles,
            "recent_registrations": recent_registrations,
            "last_updated": datetime.now().isoformat()
        }

    finally:
        cursor.close()
        conn.close()

@router.get("/users")
async def get_users(skip: int = 0, limit: int = 20, session: dict = Depends(verify_admin_session)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id, email, name, role, created_at, last_login
            FROM users
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """, (limit, skip))

        users = cursor.fetchall()

        cursor.execute("SELECT COUNT(*) as total FROM users")
        total = cursor.fetchone()["total"]

        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    finally:
        cursor.close()
        conn.close()

@router.put("/users/{user_id}/role")
async def update_user_role(user_id: int, new_role: str, session: dict = Depends(verify_admin_session)):
    valid_roles = ["user", "admin"]

    if new_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (new_role, user_id))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"success": True, "message": f"User role updated to {new_role}"}

    finally:
        cursor.close()
        conn.close()

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, session: dict = Depends(verify_admin_session)):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM user_sessions WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"success": True, "message": "User deleted successfully"}

    finally:
        cursor.close()
        conn.close()

@router.get("/sessions")
async def get_sessions(session: dict = Depends(verify_admin_session)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT s.id, s.user_id, u.email, u.name, s.ip_address,
                   s.user_agent, s.created_at, s.expires_at
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.expires_at > NOW()
            ORDER BY s.created_at DESC
        """)

        sessions = cursor.fetchall()

        return {
            "sessions": sessions,
            "total": len(sessions)
        }

    finally:
        cursor.close()
        conn.close()

@router.delete("/sessions/{session_id}")
async def revoke_session(session_id: int, session: dict = Depends(verify_admin_session)):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM user_sessions WHERE id = %s", (session_id,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Session not found")

        return {"success": True, "message": "Session revoked"}

    finally:
        cursor.close()
        conn.close()

@router.post("/logout")
async def admin_logout(request: Request, session: dict = Depends(verify_admin_session)):
    session_token = request.headers.get("Authorization", "").replace("Bearer ", "")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM user_sessions WHERE session_token = %s", (session_token,))
        conn.commit()

        return {"success": True, "message": "Logged out successfully"}

    finally:
        cursor.close()
        conn.close()