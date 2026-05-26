import React, { useContext, useState, useEffect } from "react";
import { CookieContext } from "@/context/CookieContext";
import { Settings2, X, Shield, Eye, Target, Palette, Check } from "lucide-react";

const CookiePreferencesModal = () => {
  const context = useContext(CookieContext);

  if (!context) {
    return null;
  }

  const {
    showPreferencesModal,
    closePreferences,
    preferences,
    updatePreferences,
    resetPreferences,
    acceptCookies,
    refuseCookies,
  } = context;

  // État local pour gérer les interrupteurs temporairement dans le modal
  const [localPrefs, setLocalPrefs] = useState({
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Synchronise l'état local avec l'état global du context à l'ouverture
  useEffect(() => {
    if (showPreferencesModal) {
      setLocalPrefs({
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        preferences: preferences.preferences,
      });
    }
  }, [showPreferencesModal, preferences]);

  if (!showPreferencesModal) {
    return null;
  }

  const handleToggle = (key: "analytics" | "marketing" | "preferences") => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updatePreferences(localPrefs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg rounded-[2.5rem] border border-white/80 bg-white/95 p-6 md:p-8 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.35)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Préférences Cookies</h2>
              <p className="text-xs font-semibold text-slate-400">Gérez votre consentement RGPD</p>
            </div>
          </div>
          <button 
            onClick={closePreferences} 
            className="rounded-full p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition outline-none cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-grow scrollbar-thin">
          
          {/* Necessary (Always Enabled) */}
          <div className="flex items-start justify-between rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Indispensables (Toujours actifs)</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 max-w-sm">
                  Ces cookies sont essentiels pour vous connecter et utiliser en toute sécurité les fonctionnalités fondamentales de Codentsika.
                </p>
              </div>
            </div>
            <div className="flex h-6 w-11 shrink-0 items-center rounded-full bg-emerald-500 p-1 opacity-60 cursor-not-allowed">
              <div className="h-4 w-4 rounded-full bg-white ml-auto" />
            </div>
          </div>

          {/* Preferences */}
          <div className="flex items-start justify-between rounded-3xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/40">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Préférences</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 max-w-sm">
                  Permettent au site de mémoriser vos choix (comme la langue choisie ou le thème d'affichage) pour personnaliser votre espace.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("preferences")}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors outline-none cursor-pointer ${
                localPrefs.preferences ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <div className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                localPrefs.preferences ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between rounded-3xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/40">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Analytiques</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 max-w-sm">
                  Nous aident à comprendre comment vous interagissez avec la plateforme pour mesurer l'audience et améliorer la réactivité de notre IA.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("analytics")}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors outline-none cursor-pointer ${
                localPrefs.analytics ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <div className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                localPrefs.analytics ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Marketing */}
          <div className="flex items-start justify-between rounded-3xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/40">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Marketing & Publicité</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 max-w-sm">
                  Utilisés pour vous proposer des actualités ciblées et des promotions exclusives adaptées à vos besoins de développeur.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("marketing")}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors outline-none cursor-pointer ${
                localPrefs.marketing ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <div className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                localPrefs.marketing ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

        </div>

        {/* Buttons Actions */}
        <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <button 
              onClick={refuseCookies}
              className="rounded-2xl border border-slate-200 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 bg-white transition text-xs h-11 px-4 outline-none cursor-pointer"
            >
              Tout refuser
            </button>
            <button 
              onClick={acceptCookies}
              className="rounded-2xl border border-blue-100 font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 transition text-xs h-11 px-4 outline-none cursor-pointer"
            >
              Tout accepter
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white hover:opacity-95 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] text-xs h-12 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
          >
            <Check className="h-4 w-4" />
            Enregistrer mes préférences
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookiePreferencesModal;
