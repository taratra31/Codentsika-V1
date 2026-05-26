# auth/cookie.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(tags=["GDPR & Cookie Consent"])

# Modèles Pydantic pour la validation
class CookieConsentCreate(BaseModel):
    analytics: bool = False
    marketing: bool = False
    preferences: bool = False
    consent_status: str  # accepted, refused, custom
    session_id: Optional[str] = None

class CookieConsentUpdate(BaseModel):
    analytics: bool
    marketing: bool
    preferences: bool
    consent_status: str

class CookieConsentResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    necessary: bool = True
    analytics: bool = False
    marketing: bool = False
    preferences: bool = False
    consent_status: str
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: str
    updated_at: str

# Helpers pour la base de données
def get_db():
    from .auth import get_db_connection
    return get_db_connection()

def get_user(token: str):
    if not token:
        return None
    from .auth import get_user_by_session
    try:
        return get_user_by_session(token)
    except Exception:
        return None

def fetch_consent_from_db(user_id: Optional[int], session_id: Optional[str]):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        if user_id:
            cursor.execute(
                "SELECT * FROM cookie_consents WHERE user_id = %s LIMIT 1",
                (user_id,)
            )
        elif session_id:
            cursor.execute(
                "SELECT * FROM cookie_consents WHERE session_id = %s AND user_id IS NULL LIMIT 1",
                (session_id,)
            )
        else:
            return None
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

# ========== ROUTES ==========

@router.get("/api/cookies/consent")
async def get_cookie_consent(request: Request):
    """
    Récupère le consentement actuel.
    Cherche en priorité via le jeton de session de l'utilisateur (X-Session-Token),
    puis via l'identifiant invité (session_id en query/headers).
    """
    session_token = request.headers.get("X-Session-Token")
    guest_session_id = request.headers.get("X-Guest-Session-ID") or request.query_params.get("session_id")
    
    user = get_user(session_token)
    user_id = user["id"] if user else None
    
    consent = fetch_consent_from_db(user_id, guest_session_id)
    
    if not consent:
        # Si aucun choix n'a été enregistré, renvoyer un état par défaut "pending"
        return {
            "necessary": True,
            "analytics": False,
            "marketing": False,
            "preferences": False,
            "consent_status": "pending",
            "created_at": None,
            "updated_at": None
        }
        
    # Formater les dates pour le JSON
    if isinstance(consent.get("created_at"), datetime):
        consent["created_at"] = consent["created_at"].isoformat()
    if isinstance(consent.get("updated_at"), datetime):
        consent["updated_at"] = consent["updated_at"].isoformat()
        
    return consent


@router.post("/api/cookies/consent")
async def save_cookie_consent(request: Request, consent_data: CookieConsentCreate):
    """
    Crée ou met à jour le choix de consentement de cookies.
    """
    session_token = request.headers.get("X-Session-Token")
    user = get_user(session_token)
    user_id = user["id"] if user else None
    
    session_id = consent_data.session_id or request.headers.get("X-Guest-Session-ID")
    
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Vérifier s'il existe déjà un enregistrement
        existing = None
        if user_id:
            cursor.execute("SELECT id FROM cookie_consents WHERE user_id = %s LIMIT 1", (user_id,))
            existing = cursor.fetchone()
        elif session_id:
            cursor.execute("SELECT id FROM cookie_consents WHERE session_id = %s AND user_id IS NULL LIMIT 1", (session_id,))
            existing = cursor.fetchone()
            
        now = datetime.now()
        
        if existing:
            # Mettre à jour l'enregistrement existant
            cursor.execute("""
                UPDATE cookie_consents
                SET necessary = 1,
                    analytics = %s,
                    marketing = %s,
                    preferences = %s,
                    consent_status = %s,
                    user_agent = %s,
                    ip_address = %s,
                    updated_at = %s
                WHERE id = %s
            """, (
                consent_data.analytics,
                consent_data.marketing,
                consent_data.preferences,
                consent_data.consent_status,
                user_agent,
                ip_address,
                now,
                existing["id"]
            ))
            consent_id = existing["id"]
        else:
            # Créer un nouvel enregistrement
            cursor.execute("""
                INSERT INTO cookie_consents (
                    user_id, session_id, necessary, analytics, marketing, preferences, 
                    consent_status, user_agent, ip_address, created_at, updated_at
                ) VALUES (%s, %s, 1, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                session_id,
                consent_data.analytics,
                consent_data.marketing,
                consent_data.preferences,
                consent_data.consent_status,
                user_agent,
                ip_address,
                now,
                now
            ))
            consent_id = cursor.lastrowid
            
        conn.commit()
        
        # Récupérer l'état final
        cursor.execute("SELECT * FROM cookie_consents WHERE id = %s", (consent_id,))
        result = cursor.fetchone()
        
        if result:
            if isinstance(result.get("created_at"), datetime):
                result["created_at"] = result["created_at"].isoformat()
            if isinstance(result.get("updated_at"), datetime):
                result["updated_at"] = result["updated_at"].isoformat()
                
        return result
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la sauvegarde du consentement : {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/api/cookies/consent")
async def update_cookie_consent(request: Request, consent_data: CookieConsentUpdate):
    """
    Met à jour les préférences de cookies existantes.
    """
    session_token = request.headers.get("X-Session-Token")
    guest_session_id = request.headers.get("X-Guest-Session-ID") or request.query_params.get("session_id")
    
    user = get_user(session_token)
    user_id = user["id"] if user else None
    
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    try:
        existing = None
        if user_id:
            cursor.execute("SELECT id FROM cookie_consents WHERE user_id = %s LIMIT 1", (user_id,))
            existing = cursor.fetchone()
        elif guest_session_id:
            cursor.execute("SELECT id FROM cookie_consents WHERE session_id = %s AND user_id IS NULL LIMIT 1", (guest_session_id,))
            existing = cursor.fetchone()
            
        if not existing:
            # Si aucun enregistrement n'existe, on le crée en redirigeant vers le POST interne
            cursor.close()
            conn.close()
            from pydantic import ValidationError
            try:
                create_data = CookieConsentCreate(
                    analytics=consent_data.analytics,
                    marketing=consent_data.marketing,
                    preferences=consent_data.preferences,
                    consent_status=consent_data.consent_status,
                    session_id=guest_session_id
                )
                return await save_cookie_consent(request, create_data)
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))
                
        now = datetime.now()
        cursor.execute("""
            UPDATE cookie_consents
            SET necessary = 1,
                analytics = %s,
                marketing = %s,
                preferences = %s,
                consent_status = %s,
                user_agent = %s,
                ip_address = %s,
                updated_at = %s
            WHERE id = %s
        """, (
            consent_data.analytics,
            consent_data.marketing,
            consent_data.preferences,
            consent_data.consent_status,
            user_agent,
            ip_address,
            now,
            existing["id"]
        ))
        conn.commit()
        
        cursor.execute("SELECT * FROM cookie_consents WHERE id = %s", (existing["id"],))
        result = cursor.fetchone()
        
        if result:
            if isinstance(result.get("created_at"), datetime):
                result["created_at"] = result["created_at"].isoformat()
            if isinstance(result.get("updated_at"), datetime):
                result["updated_at"] = result["updated_at"].isoformat()
                
        return result
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour : {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/api/cookies/consent")
async def delete_cookie_consent(request: Request):
    """
    Réinitialise (supprime) le consentement de cookies pour la session active.
    """
    session_token = request.headers.get("X-Session-Token")
    guest_session_id = request.headers.get("X-Guest-Session-ID") or request.query_params.get("session_id")
    
    user = get_user(session_token)
    user_id = user["id"] if user else None
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        if user_id:
            cursor.execute("DELETE FROM cookie_consents WHERE user_id = %s", (user_id,))
        elif guest_session_id:
            cursor.execute("DELETE FROM cookie_consents WHERE session_id = %s AND user_id IS NULL", (guest_session_id,))
        else:
            return {"success": False, "message": "Aucune session ou identifiant invité fourni"}
            
        conn.commit()
        return {"success": True, "message": "Consentement de cookies réinitialisé avec succès"}
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression : {str(e)}")
    finally:
        cursor.close()
        conn.close()
