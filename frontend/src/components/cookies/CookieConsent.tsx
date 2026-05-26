import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { CookieContext } from "@/context/CookieContext";
import { Cookie, Sparkles } from "lucide-react";

const CookieConsent = () => {
  const context = useContext(CookieContext);

  if (!context) {
    return null;
  }

  const { showBanner, acceptCookies, refuseCookies, openPreferences } = context;

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 mx-auto flex w-auto max-w-4xl flex-col gap-5 rounded-[2.5rem] border border-white/80 bg-white/85 p-6 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.3)] backdrop-blur-2xl transition-all duration-300 md:flex-row md:items-center md:justify-between animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-start gap-4">
        {/* Glow Cookie Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)]">
          <Cookie className="h-6 w-6 animate-pulse" />
        </div>
        
        <div className="space-y-1">
          <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
            Gestion de vos cookies
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          </h4>
          <p className="text-xs font-semibold leading-relaxed text-slate-500 max-w-xl md:max-w-2xl">
            Codentsika Studio utilise des cookies pour optimiser votre expérience, analyser les performances et vous proposer des services personnalisés et sécurisés. Vous pouvez choisir de tout accepter, de personnaliser ou de continuer en refusant.
          </p>
        </div>
      </div>
      
      {/* Responsive Buttons Layout */}
      <div className="flex flex-col gap-2 min-w-fit sm:flex-row md:flex-col lg:flex-row">
        <button 
          onClick={openPreferences}
          className="rounded-2xl border border-slate-200 font-bold text-slate-700 bg-white/50 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs h-11 px-4 shrink-0 shadow-sm outline-none cursor-pointer"
        >
          Personnaliser
        </button>
        <button 
          onClick={refuseCookies}
          className="rounded-2xl border border-slate-200 font-bold text-slate-700 bg-white/50 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs h-11 px-4 shrink-0 shadow-sm outline-none cursor-pointer"
        >
          Refuser
        </button>
        <button 
          onClick={acceptCookies}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white hover:opacity-95 transition-all text-xs h-11 px-5 shrink-0 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] outline-none cursor-pointer"
        >
          Accepter tout
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
