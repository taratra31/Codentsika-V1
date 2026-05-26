import React, { useContext } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CookieContext } from "@/context/CookieContext";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  RefreshCw, 
  Settings2, 
  HelpCircle, 
  Lock, 
  Eye, 
  Target, 
  Palette, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  FileText
} from "lucide-react";
import CookiePreferencesModal from "@/components/cookies/CookiePreferencesModal";

export default function Cookies() {
  const context = useContext(CookieContext);

  if (!context) {
    return (
      <DashboardLayout>
        <div className="page-shell">
          <div className="page-container flex items-center justify-center min-h-[60vh]">
            <p className="text-slate-500 font-bold">Chargement des données de cookies...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const {
    preferences,
    consentStatus,
    lastChoiceDate,
    openPreferences,
    resetPreferences,
  } = context;

  // Calcul du nombre de catégories actives (y compris la catégorie Nécessaire qui est toujours active)
  const activeCount = 1 + (preferences.analytics ? 1 : 0) + (preferences.marketing ? 1 : 0) + (preferences.preferences ? 1 : 0);

  // Date de dernier choix formatée
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Aucun choix enregistré";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = () => {
    switch (consentStatus) {
      case "accepted":
        return (
          <Badge className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            Tous acceptés
          </Badge>
        );
      case "refused":
        return (
          <Badge className="rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 flex items-center gap-1.5 shadow-sm">
            <XCircle className="h-4 w-4" />
            Refusés (Sauf essentiels)
          </Badge>
        );
      case "custom":
        return (
          <Badge className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 flex items-center gap-1.5 shadow-sm">
            <Settings2 className="h-4 w-4" />
            Personnalisé
          </Badge>
        );
      default:
        return (
          <Badge className="rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700 flex items-center gap-1.5 shadow-sm">
            <HelpCircle className="h-4 w-4" />
            En attente
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-container">
          
          {/* Header page-hero */}
          <section className="page-hero">
            <div className="ambient-orb -right-24 -top-24 h-72 w-72 bg-blue-500/10 blur-3xl" />
            <div className="ambient-orb -bottom-24 left-10 h-72 w-72 bg-purple-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge className="page-badge hover:bg-blue-50">
                  <ShieldCheck className="mr-2 h-3.5 w-3.5 text-blue-600" />
                  RGPD & Confidentialité
                </Badge>
                
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Gestion des cookies
                </h1>
                
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base font-semibold">
                  Ajustez vos préférences de traceurs et gérez la confidentialité de vos données conformément au RGPD.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col items-start lg:items-end">
                <div className="text-xs font-bold text-slate-400">État du consentement :</div>
                {getStatusBadge()}
              </div>
            </div>
          </section>

          {/* Quick Summary Dashboard Card */}
          <section className="grid gap-6 md:grid-cols-3">
            
            {/* Active Consent Score */}
            <div className="surface-card bg-white/90 border-white/70 p-6 flex flex-col justify-between md:col-span-2">
              <div>
                <div className="section-kicker">RÉSUMÉ DU CONSENTEMENT</div>
                <h3 className="text-xl font-black text-slate-900 mt-1">Vos préférences actuelles</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">Vous avez autorisé {activeCount} sur 4 catégories de traceurs.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Essentiels</div>
                  <div className="text-sm font-black text-emerald-600 mt-1">Toujours Actif</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Préférences</div>
                  <div className={`text-sm font-black mt-1 ${preferences.preferences ? "text-emerald-600" : "text-slate-400"}`}>
                    {preferences.preferences ? "Activé" : "Désactivé"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Analytics</div>
                  <div className={`text-sm font-black mt-1 ${preferences.analytics ? "text-emerald-600" : "text-slate-400"}`}>
                    {preferences.analytics ? "Activé" : "Désactivé"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Marketing</div>
                  <div className={`text-sm font-black mt-1 ${preferences.marketing ? "text-emerald-600" : "text-slate-400"}`}>
                    {preferences.marketing ? "Activé" : "Désactivé"}
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar & Date Card */}
            <div className="surface-card bg-white/90 border-white/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm mb-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Dernière mise à jour</h4>
                <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
                  {formatDate(lastChoiceDate)}
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={openPreferences}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white hover:opacity-95 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] text-xs h-11 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                >
                  <Settings2 className="h-4 w-4" />
                  Modifier
                </button>
                <button 
                  onClick={resetPreferences}
                  className="flex-1 rounded-2xl border border-slate-200 font-bold text-red-600 hover:bg-red-50 bg-white transition text-xs h-11 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Réinitialiser
                </button>
              </div>
            </div>

          </section>

          {/* Cookies Detailed Category Grid */}
          <section className="space-y-6">
            <div>
              <div className="section-kicker">DÉTAIL DES TRACEURS</div>
              <h2 className="section-title">Catégories de cookies utilisées</h2>
              <p className="section-subtitle">Chaque catégorie de cookie répond à des besoins spécifiques de navigation ou d'analyse.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              
              {/* Category 1: Necessary */}
              <div className="surface-card bg-white/95 border-white/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Strictement Nécessaires</span>
                    <Badge className="bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100 rounded-lg">Actif</Badge>
                  </div>
                  
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 shadow-sm mt-4">
                    <Lock className="h-5 w-5" />
                  </div>
                  
                  <h4 className="text-base font-black text-slate-900 mt-4">Essentiels</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-2 leading-relaxed">
                    Indispensables au bon fonctionnement technique de la plateforme. Ils gèrent la session utilisateur et la sécurité.
                  </p>
                </div>
              </div>

              {/* Category 2: Preferences */}
              <div className="surface-card bg-white/95 border-white/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Expérience Utilisateur</span>
                    <Badge className={`font-extrabold rounded-lg ${preferences.preferences ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                      {preferences.preferences ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm mt-4">
                    <Palette className="h-5 w-5" />
                  </div>
                  
                  <h4 className="text-base font-black text-slate-900 mt-4">Préférences</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-2 leading-relaxed">
                    Mémorisent vos choix d'interface tels que la langue française/anglaise ou le mode d'affichage de l'éditeur.
                  </p>
                </div>
              </div>

              {/* Category 3: Analytics */}
              <div className="surface-card bg-white/95 border-white/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Mesure d'Audience</span>
                    <Badge className={`font-extrabold rounded-lg ${preferences.analytics ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                      {preferences.analytics ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-sm mt-4">
                    <Eye className="h-5 w-5" />
                  </div>
                  
                  <h4 className="text-base font-black text-slate-900 mt-4">Analytiques</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-2 leading-relaxed">
                    Suivent le trafic et les parcours pour détecter d'éventuels bugs et améliorer l'efficacité de génération de code IA.
                  </p>
                </div>
              </div>

              {/* Category 4: Marketing */}
              <div className="surface-card bg-white/95 border-white/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Publicité Ciblée</span>
                    <Badge className={`font-extrabold rounded-lg ${preferences.marketing ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                      {preferences.marketing ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 shadow-sm mt-4">
                    <Target className="h-5 w-5" />
                  </div>
                  
                  <h4 className="text-base font-black text-slate-900 mt-4">Marketing</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-2 leading-relaxed">
                    Permettent de vous proposer des offres personnalisées sur les plans Pro/Business et de mesurer nos campagnes.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* GDPR / RGPD Educational & Compliance Section */}
          <section className="grid gap-6 md:grid-cols-2">
            
            {/* Why cookies card */}
            <div className="surface-card bg-white/90 border-white/70 p-6 md:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm mb-4">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Pourquoi utilisons-nous des cookies ?</h3>
              <p className="text-xs font-bold leading-relaxed text-slate-500 mt-3">
                Chez <strong>Codentsika Studio</strong>, la transparence est une priorité. Nous utilisons ces technologies pour :
              </p>
              
              <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>Maintenir votre session ouverte pour éviter les reconnexions répétées.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>Sauvegarder vos prompts récents et historiques dans l'Assistant IA.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>Résoudre les ralentissements techniques de génération en mesurant les performances en temps réel.</span>
                </li>
              </ul>
            </div>

            {/* GDPR Rights card */}
            <div className="surface-card bg-white/90 border-white/70 p-6 md:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Vos droits sous le RGPD</h3>
              <p className="text-xs font-bold leading-relaxed text-slate-500 mt-3">
                Conformément au Règlement Général sur la Protection des Données, vous disposez de droits complets sur vos traceurs :
              </p>

              <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Droit au choix</strong> : Vous pouvez refuser les cookies facultatifs à tout moment sans perturber votre accès aux fonctions de base.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Droit de retrait</strong> : Vous pouvez réinitialiser et modifier vos choix instantanément depuis cette page.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Anonymat</strong> : Aucune donnée de cookie n'est revendue à des tiers ou utilisée en dehors de Codentsika.</span>
                </li>
              </ul>
            </div>

          </section>

        </div>
      </div>
      
      {/* Rendu du modal de préférences */}
      <CookiePreferencesModal />
    </DashboardLayout>
  );
}
