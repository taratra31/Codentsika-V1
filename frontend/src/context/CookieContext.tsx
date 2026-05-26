import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import * as cookieApi from "../services/cookieApi";

export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieContextType {
  showBanner: boolean;
  showPreferencesModal: boolean;
  preferences: CookiePreferences;
  consentStatus: "accepted" | "refused" | "custom" | "pending";
  lastChoiceDate: string | null;
  isLoading: boolean;
  acceptCookies: () => void;
  refuseCookies: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
  updatePreferences: (prefs: CookiePreferences) => void;
  resetPreferences: () => void;
}

const defaultPreferences: CookiePreferences = {
  analytics: false,
  marketing: false,
  preferences: false,
};

export const CookieContext = createContext<CookieContextType | undefined>(
  undefined,
);

export const CookieProvider = ({ children }: { children: ReactNode }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ...defaultPreferences,
  });
  const [consentStatus, setConsentStatus] = useState<"accepted" | "refused" | "custom" | "pending">("pending");
  const [lastChoiceDate, setLastChoiceDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charge le consentement initial (Backend ou Fallback LocalStorage)
  useEffect(() => {
    const initializeConsent = async () => {
      setIsLoading(true);
      
      // 1. D'abord charger les préférences locales pour une réactivité instantanée
      const localPrefs = localStorage.getItem("cookie_preferences");
      const localStatus = localStorage.getItem("cookie_consent_status");
      const localDate = localStorage.getItem("cookie_consent_date");
      
      if (localPrefs && localStatus) {
        try {
          setPreferences(JSON.parse(localPrefs));
          setConsentStatus(localStatus as any);
          setLastChoiceDate(localDate);
          setShowBanner(false);
        } catch (e) {
          console.error("Erreur de parsing des cookies locaux:", e);
        }
      } else {
        setShowBanner(true);
      }

      // 2. Synchroniser ou charger depuis le backend si disponible
      try {
        const backendConsent = await cookieApi.getConsent();
        
        if (backendConsent && backendConsent.consent_status !== "pending") {
          const fetchedPrefs = {
            analytics: backendConsent.analytics,
            marketing: backendConsent.marketing,
            preferences: backendConsent.preferences,
          };
          
          setPreferences(fetchedPrefs);
          setConsentStatus(backendConsent.consent_status);
          
          const dateStr = backendConsent.updated_at || backendConsent.created_at || null;
          setLastChoiceDate(dateStr);
          
          // Mettre à jour le stockage local
          localStorage.setItem("cookie_preferences", JSON.stringify(fetchedPrefs));
          localStorage.setItem("cookie_consent_status", backendConsent.consent_status);
          if (dateStr) {
            localStorage.setItem("cookie_consent_date", dateStr);
          }
          
          setShowBanner(false);
        } else if (localPrefs && localStatus) {
          // Si le backend n'a aucun choix mais qu'on a un choix local, on le pousse au backend
          const parsedLocalPrefs: CookiePreferences = JSON.parse(localPrefs);
          await cookieApi.saveConsent({
            analytics: parsedLocalPrefs.analytics,
            marketing: parsedLocalPrefs.marketing,
            preferences: parsedLocalPrefs.preferences,
            consent_status: localStatus as any,
          });
        }
      } catch (err) {
        console.warn("Backend indisponible pour les cookies. Utilisation exclusive du localStorage :", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConsent();
  }, []);

  // Écoute les événements système personnalisés pour ouvrir les préférences
  useEffect(() => {
    const handleOpenPreferences = () => {
      setShowPreferencesModal(true);
    };
    
    window.addEventListener("open-cookie-preferences", handleOpenPreferences);
    return () => {
      window.removeEventListener("open-cookie-preferences", handleOpenPreferences);
    };
  }, []);

  // Accepter tous les cookies
  const acceptCookies = async () => {
    const allPrefs = { analytics: true, marketing: true, preferences: true };
    const dateNow = new Date().toISOString();
    
    setPreferences(allPrefs);
    setConsentStatus("accepted");
    setLastChoiceDate(dateNow);
    setShowBanner(false);
    
    // Sauvegarde locale
    localStorage.setItem("cookie_preferences", JSON.stringify(allPrefs));
    localStorage.setItem("cookie_consent_status", "accepted");
    localStorage.setItem("cookie_consent_date", dateNow);
    
    // Sauvegarde serveur
    try {
      await cookieApi.saveConsent({
        ...allPrefs,
        consent_status: "accepted",
      });
      console.log("Cookies accepted: Sync complete");
    } catch (err) {
      console.warn("Backend hors ligne. Consentement enregistré localement.");
    }
  };

  // Refuser tous les cookies (Sauf les cookies indispensables)
  const refuseCookies = async () => {
    const refusedPrefs = { analytics: false, marketing: false, preferences: false };
    const dateNow = new Date().toISOString();
    
    setPreferences(refusedPrefs);
    setConsentStatus("refused");
    setLastChoiceDate(dateNow);
    setShowBanner(false);
    
    // Sauvegarde locale
    localStorage.setItem("cookie_preferences", JSON.stringify(refusedPrefs));
    localStorage.setItem("cookie_consent_status", "refused");
    localStorage.setItem("cookie_consent_date", dateNow);
    
    // Sauvegarde serveur
    try {
      await cookieApi.saveConsent({
        ...refusedPrefs,
        consent_status: "refused",
      });
      console.log("Cookies refused: Sync complete");
    } catch (err) {
      console.warn("Backend hors ligne. Refus enregistré localement.");
    }
  };

  // Ouvrir le modal de gestion
  const openPreferences = () => {
    setShowPreferencesModal(true);
  };

  // Fermer le modal de gestion
  const closePreferences = () => {
    setShowPreferencesModal(false);
  };

  // Enregistrer des préférences précises (Personnalisation)
  const updatePreferences = async (newPrefs: CookiePreferences) => {
    const dateNow = new Date().toISOString();
    setPreferences(newPrefs);
    setConsentStatus("custom");
    setLastChoiceDate(dateNow);
    setShowBanner(false);
    
    // Sauvegarde locale
    localStorage.setItem("cookie_preferences", JSON.stringify(newPrefs));
    localStorage.setItem("cookie_consent_status", "custom");
    localStorage.setItem("cookie_consent_date", dateNow);
    
    // Sauvegarde serveur
    try {
      await cookieApi.saveConsent({
        ...newPrefs,
        consent_status: "custom",
      });
      console.log("Cookie preferences saved and synced");
    } catch (err) {
      console.warn("Backend hors ligne. Préférences personnalisées enregistrées localement.");
    }
    
    setShowPreferencesModal(false);
  };

  // Réinitialiser les choix (Effacer tout)
  const resetPreferences = async () => {
    setPreferences(defaultPreferences);
    setConsentStatus("pending");
    setLastChoiceDate(null);
    setShowBanner(true);
    
    // Nettoyer local
    localStorage.removeItem("cookie_preferences");
    localStorage.removeItem("cookie_consent_status");
    localStorage.removeItem("cookie_consent_date");
    
    // Nettoyer serveur
    try {
      await cookieApi.deleteConsent();
      console.log("Cookie preferences reset on backend");
    } catch (err) {
      console.warn("Backend hors ligne. Choix effacés localement.");
    }
    
    setShowPreferencesModal(false);
  };

  return (
    <CookieContext.Provider
      value={{
        showBanner,
        showPreferencesModal,
        preferences,
        consentStatus,
        lastChoiceDate,
        isLoading,
        acceptCookies,
        refuseCookies,
        openPreferences,
        closePreferences,
        updatePreferences,
        resetPreferences,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieProvider");
  }
  return context;
};
