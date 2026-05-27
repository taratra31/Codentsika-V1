const API_URL = "https://codentsika-v1.onrender.com";

export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsentData {
  id?: number;
  user_id?: number | null;
  session_id?: string | null;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consent_status: "accepted" | "refused" | "custom" | "pending";
  user_agent?: string | null;
  ip_address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Récupère l'identifiant invité ou le génère s'il n'existe pas
export function getOrCreateGuestSessionId(): string {
  let guestSessionId = localStorage.getItem("guest_session_id");
  if (!guestSessionId) {
    guestSessionId = "guest_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("guest_session_id", guestSessionId);
  }
  return guestSessionId;
}

// Récupère les en-têtes standard avec token d'authentification et session invité
function getHeaders(): HeadersInit {
  const sessionToken = localStorage.getItem("session_token") || "";
  const guestSessionId = getOrCreateGuestSessionId();
  
  return {
    "Content-Type": "application/json",
    "X-Session-Token": sessionToken,
    "X-Guest-Session-ID": guestSessionId,
  };
}

// Récupère le consentement actuel depuis l'API
export async function getConsent(): Promise<CookieConsentData> {
  const response = await fetch(`${API_URL}/api/cookies/consent`, {
    method: "GET",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du consentement des cookies");
  }
  
  return response.json();
}

// Enregistre un nouveau choix de consentement
export async function saveConsent(data: {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consent_status: "accepted" | "refused" | "custom";
}): Promise<CookieConsentData> {
  const guestSessionId = getOrCreateGuestSessionId();
  
  const response = await fetch(`${API_URL}/api/cookies/consent`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      analytics: data.analytics,
      marketing: data.marketing,
      preferences: data.preferences,
      consent_status: data.consent_status,
      session_id: guestSessionId,
    }),
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de l'enregistrement du consentement des cookies");
  }
  
  return response.json();
}

// Met à jour les préférences de cookies existantes
export async function updateConsent(data: {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consent_status: "accepted" | "refused" | "custom";
}): Promise<CookieConsentData> {
  const response = await fetch(`${API_URL}/api/cookies/consent`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour des préférences de cookies");
  }
  
  return response.json();
}

// Réinitialise le consentement (suppression côté serveur)
export async function deleteConsent(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/cookies/consent`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du consentement des cookies");
  }
  
  return response.json();
}
