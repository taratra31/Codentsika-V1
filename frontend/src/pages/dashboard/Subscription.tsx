import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Download, 
  CheckCircle2, 
  Folder, 
  Sparkles, 
  Database, 
  Globe2, 
  CreditCard, 
  TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  subscriptionPlans,
  currentUsage,
  billingHistory,
} from "@/data/subscription";

export default function Subscription() {
  const [userPlan, setUserPlan] = useState('Gratuit');
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const token = searchParams.get('session_token');
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/me${token ? `?session_token=${token}` : ''}`)
      .then(res => res.json())
      .then(data => {
        if (data.plan) setUserPlan(data.plan);
      })
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-container">
          
          {/* Page Hero Header */}
          <section className="page-hero">
            {/* Ambient Glowing Orbs */}
            <div className="ambient-orb -right-24 -top-24 h-72 w-72 bg-blue-500/10 blur-3xl" />
            <div className="ambient-orb -bottom-24 left-10 h-72 w-72 bg-purple-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge className="page-badge hover:bg-blue-50">
                  <CreditCard className="mr-2 h-3.5 w-3.5 text-blue-600 animate-pulse" />
                  Abonnement
                </Badge>
                
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Abonnement & Facturation
                </h1>
                
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base font-bold">
                  Gérez votre formule, suivez votre consommation de ressources et consultez vos factures.
                </p>
              </div>

              {/* Current Active Plan Badge */}
              <Badge className="w-fit rounded-full border border-blue-100 bg-blue-50/90 px-5 py-3 text-sm font-extrabold text-blue-700 flex items-center gap-2 shadow-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Plan Actuel : <span className="underline decoration-indigo-400 decoration-2">{userPlan}</span>
              </Badge>
            </div>
          </section>

          {/* Plan Selection Section */}
          <section className="space-y-6">
            <div>
              <div className="section-kicker">FORMULES DE TARIFICATION</div>
              <h2 className="section-title">Choisissez le plan adapté à vos projets</h2>
              <p className="section-subtitle">Passez à la vitesse supérieure grâce à l'intelligence artificielle.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 pt-4">
              {subscriptionPlans.map((plan, index) => {
                const isPro = plan.name === "Pro";
                const isGratuit = plan.name === "Gratuit";
                
                return (
                  <div 
                    key={index}
                    className={`relative flex flex-col overflow-hidden rounded-[2.5rem] transition-all duration-300 ${
                      isPro 
                        ? "border-2 border-blue-500 bg-white shadow-[0_30px_70px_-25px_rgba(37,99,235,0.35)] md:-translate-y-2 scale-[1.02] z-10" 
                        : "border border-white/80 bg-white/90 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.15)] backdrop-blur-xl hover:-translate-y-1"
                    }`}
                  >
                    {isPro && (
                      <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                        Recommandé
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={`p-8 text-center ${
                      isPro 
                        ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white" 
                        : "bg-slate-50/50 border-b border-slate-100"
                    }`}>
                      <h3 className={`text-xl font-black ${isPro ? "text-white" : "text-slate-800"}`}>
                        {plan.name}
                      </h3>
                      
                      <div className="mt-4 flex items-baseline justify-center">
                        <span className={`text-4xl md:text-5xl font-black tracking-tight ${isPro ? "text-white" : "text-slate-950"}`}>
                          {plan.price === "Sur devis" ? plan.price : `${plan.price} €`}
                        </span>
                        {plan.priceBillingCycle && (
                          <span className={`ml-1 text-sm font-bold ${isPro ? "text-white/80" : "text-slate-500"}`}>
                            {plan.priceBillingCycle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content (Features) */}
                    <div className="flex-grow p-8">
                      <ul className="space-y-4">
                        {plan.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center text-sm font-bold text-slate-700"
                          >
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full mr-3 shrink-0 shadow-sm ${
                              isPro ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                            }`}>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                            <span className={isPro ? "text-slate-800" : "text-slate-600"}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card Footer */}
                    <div className="p-8 border-t border-slate-50">
                      {isGratuit ? (
                        <Button
                          disabled
                          className="w-full rounded-2xl bg-slate-100 text-slate-400 font-bold border border-slate-200 cursor-not-allowed py-6"
                        >
                          Plan actuel
                        </Button>
                      ) : isPro ? (
                        <Button
                          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white hover:opacity-95 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] py-6"
                        >
                          {plan.buttonText}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full rounded-2xl border-slate-200 font-black text-slate-700 bg-white hover:bg-slate-50 shadow-sm py-6"
                        >
                          {plan.buttonText}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Current Usage Section */}
          <section className="space-y-6 pt-4">
            <div>
              <div className="section-kicker">UTILISATION DU COMPTE</div>
              <h2 className="section-title">Consommation des ressources</h2>
              <p className="section-subtitle">Aperçu en temps réel des quotas et limites liés à votre abonnement.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              
              {/* Card 1: Projects */}
              <div className="surface-card surface-card-hover rounded-[2rem] bg-white/95 border-white/70 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.15)] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Projets générés</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                      <Folder className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {currentUsage.projects.current}
                    </span>
                    <span className="text-xs font-bold text-slate-400"> / {currentUsage.projects.limit}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Progress
                    value={(currentUsage.projects.current / currentUsage.projects.limit) * 100}
                    className="h-2 rounded-full bg-slate-100"
                  />
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Quota mensuel</span>
                    <span>{((currentUsage.projects.current / currentUsage.projects.limit) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Queries */}
              <div className="surface-card surface-card-hover rounded-[2rem] bg-white/95 border-white/70 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.15)] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Requêtes IA</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {currentUsage.iaQueries.current}
                    </span>
                    <span className="text-xs font-bold text-slate-400"> / {currentUsage.iaQueries.limit}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Progress
                    value={(currentUsage.iaQueries.current / currentUsage.iaQueries.limit) * 100}
                    className="h-2 rounded-full bg-slate-100"
                  />
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Crédits IA</span>
                    <span>{((currentUsage.iaQueries.current / currentUsage.iaQueries.limit) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Mock APIs */}
              <div className="surface-card surface-card-hover rounded-[2rem] bg-white/95 border-white/70 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.15)] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">APIs Mock générées</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 shadow-sm">
                      <Globe2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {currentUsage.mockApis.current}
                    </span>
                    <span className="text-xs font-bold text-slate-400"> / {currentUsage.mockApis.limit}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Progress
                    value={(currentUsage.mockApis.current / currentUsage.mockApis.limit) * 100}
                    className="h-2 rounded-full bg-slate-100"
                  />
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>APIs actives</span>
                    <span>{((currentUsage.mockApis.current / currentUsage.mockApis.limit) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Storage */}
              <div className="surface-card surface-card-hover rounded-[2rem] bg-white/95 border-white/70 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.15)] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Stockage utilisé</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                      <Database className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {currentUsage.storage.current}
                    </span>
                    <span className="text-xs font-bold text-slate-400"> {currentUsage.storage.unit} / {currentUsage.storage.limit} {currentUsage.storage.unit}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Progress
                    value={(currentUsage.storage.current / currentUsage.storage.limit) * 100}
                    className="h-2 rounded-full bg-slate-100"
                  />
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Espace disque</span>
                    <span>{((currentUsage.storage.current / currentUsage.storage.limit) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Billing History Section */}
          <section className="space-y-6 pt-4">
            <div>
              <div className="section-kicker">HISTORIQUE</div>
              <h2 className="section-title">Factures & transactions</h2>
              <p className="section-subtitle">Consultez et téléchargez vos factures passées en un clic.</p>
            </div>

            <Card className="surface-card rounded-[2.5rem] overflow-hidden bg-white/90 border-white/70 p-6 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400 pb-4">Date</th>
                      <th className="text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400 pb-4">Plan</th>
                      <th className="text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400 pb-4">Montant</th>
                      <th className="text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400 pb-4">Statut</th>
                      <th className="text-right text-xs font-black uppercase tracking-[0.12em] text-slate-400 pb-4">Facture</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((item, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-slate-50/50 hover:bg-slate-50/30 transition-colors last:border-b-0"
                      >
                        <td className="py-4 text-sm font-bold text-slate-700">{item.date}</td>
                        <td className="py-4">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-extrabold px-3 py-1 rounded-xl border border-slate-200/50">
                            {item.plan}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm font-black text-slate-900">{item.amount}</td>
                        <td className="py-4">
                          <Badge className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center w-fit gap-1.5 shadow-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-slate-200 bg-white/95 font-bold hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                            asChild
                          >
                            <Link to="#">
                              <Download className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                              {item.invoice}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}
