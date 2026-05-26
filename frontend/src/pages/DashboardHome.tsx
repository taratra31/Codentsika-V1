// src/pages/dashboard/DashboardHome.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Layers3,
  Plus,
  Sparkles,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";

export default function DashboardHome() {
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const savedLang = localStorage.getItem("codentsika_lang");
    if (savedLang === "fr" || savedLang === "en") setLang(savedLang);
  }, []);

  const t = {
    fr: {
      badge: "Tableau de bord",
      hello: "Bonjour, développeur",
      subtitle:
        "Gère tes projets, génère des APIs et automatise ton workflow avec Codentsika.",
      newProject: "Nouveau projet",
      askAI: "Assistant IA",
      overview: "Vue d’ensemble",
      projects: "Projets récents",
      quick: "Actions rapides",
      activity: "Activité récente",
      viewAll: "Voir tout",
      stats: [
        ["Projets actifs", "12", "+18%"],
        ["APIs générées", "48", "+32%"],
        ["Requêtes IA", "1 234", "+12%"],
        ["Performance", "99.9%", "Stable"],
      ],
    },
    en: {
      badge: "Dashboard",
      hello: "Welcome back, developer",
      subtitle:
        "Manage your projects, generate APIs and automate your workflow with Codentsika.",
      newProject: "New project",
      askAI: "AI Assistant",
      overview: "Overview",
      projects: "Recent projects",
      quick: "Quick actions",
      activity: "Recent activity",
      viewAll: "View all",
      stats: [
        ["Active projects", "12", "+18%"],
        ["Generated APIs", "48", "+32%"],
        ["AI requests", "1,234", "+12%"],
        ["Performance", "99.9%", "Stable"],
      ],
    },
  };

  const statIcons = [Code2, Wand2, Bot, TrendingUp];

  const projects = [
    { name: "E-commerce API", status: "Active", date: "2h ago", progress: 82 },
    {
      name: "Auth Microservice",
      status: "In progress",
      date: "5h ago",
      progress: 56,
    },
    {
      name: "Blog Backend",
      status: "Completed",
      date: "Yesterday",
      progress: 100,
    },
  ];

  const activities = [
    {
      icon: Zap,
      text: "E-commerce API generated successfully",
      time: "10 min",
    },
    {
      icon: Bot,
      text: "AI request processed: Code optimization",
      time: "45 min",
    },
    {
      icon: CheckCircle2,
      text: "Blog Backend deployment completed",
      time: "2h",
    },
  ];

  const statusStyle = (status: string) => {
    if (status === "Active") return "bg-blue-50 text-blue-700 border-blue-100";
    if (status === "Completed")
      return "bg-cyan-50 text-cyan-700 border-cyan-100";
    return "bg-sky-50 text-sky-700 border-sky-100";
  };

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-container">
          <section className="page-hero">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge className="page-badge hover:bg-blue-50">
                  <Layers3 className="mr-2 h-3.5 w-3.5" />
                  {t[lang].badge}
                </Badge>

                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  {t[lang].hello}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                  {t[lang].subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard/projects">
                  <Button className="rounded-2xl bg-blue-600 px-5 py-6 font-bold text-white shadow-[0_18px_45px_-24px_rgba(37,99,235,0.75)] hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    {t[lang].newProject}
                  </Button>
                </Link>

                <Link to="/dashboard/ai-assistant">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white/90 px-5 py-6 font-bold text-slate-700 shadow-sm hover:bg-white"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t[lang].askAI}
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {t[lang].stats.map(([label, value, growth], index) => {
              const Icon = statIcons[index];

              return (
                <Card
                  key={label}
                  className="surface-card surface-card-hover group border-white/80 bg-white/90"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>

                      <Badge className="rounded-full border border-cyan-100 bg-cyan-50 text-cyan-700 hover:bg-cyan-50">
                        {growth}
                      </Badge>
                    </div>

                    <p className="mt-5 text-3xl font-black text-slate-950">
                      {value}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card className="surface-card xl:col-span-2">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                      {t[lang].overview}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      {t[lang].projects}
                    </h2>
                  </div>

                  <Link to="/dashboard/projects">
                    <Button
                      variant="ghost"
                      className="font-bold text-blue-600 hover:bg-blue-50"
                    >
                      {t[lang].viewAll}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.name}
                      className="rounded-3xl border border-blue-50 bg-gradient-to-r from-white to-blue-50/40 p-5 transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                            <Database className="h-5 w-5" />
                          </div>

                          <div>
                            <h3 className="font-black text-slate-950">
                              {project.name}
                            </h3>

                            <div className="mt-1 flex items-center gap-2">
                              <Badge className={statusStyle(project.status)}>
                                {project.status}
                              </Badge>
                              <span className="text-xs font-medium text-slate-400">
                                {project.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="text-sm font-black text-blue-700">
                          {project.progress}%
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-blue-100 bg-white shadow-xl shadow-blue-100/50">
              <CardContent className="p-6">
                <h2 className="mb-5 text-xl font-black text-slate-950">
                  {t[lang].quick}
                </h2>

                <div className="space-y-3">
                  {[
                    ["Generate API", Wand2, "/dashboard/api-generator"],
                    ["AI Assistant", Bot, "/dashboard/ai-assistant"],
                    ["View Activity", Activity, "/dashboard/activity"],
                  ].map(([label, Icon, link]: any) => (
                    <Link
                      key={label}
                      to={link}
                      className="flex items-center gap-4 rounded-3xl border border-blue-50 bg-blue-50/40 p-4 font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-100/60"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                        <Icon className="h-5 w-5" />
                      </div>

                      {label}
                      <ArrowRight className="ml-auto h-4 w-4 text-blue-400" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="border border-blue-100 bg-white shadow-xl shadow-blue-100/50">
            <CardContent className="p-6">
              <h2 className="mb-5 text-xl font-black text-slate-950">
                {t[lang].activity}
              </h2>

              <div className="space-y-3">
                {activities.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.text}
                      className="flex items-center gap-4 rounded-3xl border border-blue-50 bg-blue-50/40 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                        <Icon className="h-4 w-4" />
                      </div>

                      <p className="flex-1 text-sm font-medium text-slate-600">
                        {item.text}
                      </p>

                      <div className="flex items-center gap-1 text-xs font-bold text-blue-400">
                        <Clock className="h-3.5 w-3.5" />
                        {item.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
