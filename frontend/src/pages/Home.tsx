import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowRight,
  Bot,
  Code2,
  Database,
  Globe2,
  Languages,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("codentsika_lang");

    if (savedLang === "fr" || savedLang === "en") {
      setLang(savedLang);
    }

    const token = localStorage.getItem("session_token");
    if (token) {
      setIsLoggedIn(true);
    }

    const timer = setTimeout(() => setLoading(false), 2200);

    return () => clearTimeout(timer);
  }, []);

  const changeLanguage = (value: "fr" | "en") => {
    setLang(value);
    localStorage.setItem("codentsika_lang", value);
  };

  const t = {
    fr: {
      badge: "Plateforme IA nouvelle génération pour développeurs",
      title1: "Créez des applications",
      title2: "API intelligentes & Backends",
      title3: "propulsés par l’IA",
      desc: "Codentsika est une plateforme IA conçue pour accélérer le développement logiciel grâce à l’automatisation, la génération de code et des outils intelligents.",
      start: "Commencer",
      doc: "Documentation",
      features: "Fonctionnalités",
      sectionTitle: "Des outils puissants pour construire plus rapidement",
      discover: "En savoir plus",
      loadingTitle: "Expérience intelligente",
      loadingDesc:
        "Une expérience moderne combinant intelligence artificielle, animations fluides et interface premium.",
    },
    en: {
      badge: "Next-generation AI platform for developers",
      title1: "Build powerful",
      title2: "APIs & Backends",
      title3: "powered by AI",
      desc: "Codentsika is an AI-powered platform designed to accelerate software development through automation, code generation and intelligent tools.",
      start: "Get Started",
      doc: "Documentation",
      features: "Features",
      sectionTitle: "Powerful tools built for modern developers",
      discover: "Learn more",
      loadingTitle: "Intelligent Experience",
      loadingDesc:
        "Modern interface powered by AI, smooth animations and premium design.",
    },
  };

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "AI Assistant",
      desc:
        lang === "fr"
          ? "Assistant intelligent capable de générer, corriger et expliquer votre code instantanément."
          : "Smart AI assistant capable of generating, fixing and explaining your code instantly.",
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "API Generator",
      desc:
        lang === "fr"
          ? "Générez automatiquement des routes, endpoints, contrôleurs et documentation API."
          : "Generate routes, endpoints, controllers and API documentation automatically.",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Backend Studio",
      desc:
        lang === "fr"
          ? "Créez une architecture backend complète avec authentification, base de données et logique métier."
          : "Create a complete backend architecture with authentication, database and business logic.",
    },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-blue-500" />
            <Code2 className="h-7 w-7 text-blue-600" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Codentsika
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="page-shell overflow-hidden">
      <Navbar lang={lang} onChangeLanguage={changeLanguage} />

      <section className="relative flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="ambient-orb left-10 top-32 h-40 w-40 bg-blue-400/20" />
        <div className="ambient-orb bottom-20 right-10 h-56 w-56 bg-sky-300/25" />

        <div
          className="relative mx-auto max-w-7xl text-center"
          style={{ animation: "page-fade-up .7s ease-out" }}
        >
          <div className="mb-6 flex justify-center">
            <div className="floating-chip flex items-center gap-2 rounded-full border border-white/80 bg-white/85 p-1 shadow-[0_18px_50px_-24px_rgba(37,99,235,0.28)] backdrop-blur-xl">
              <span className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 sm:flex">
                <Code2 className="h-4 w-4" />
                Codentsika AI
              </span>

              <button
                onClick={() => changeLanguage("fr")}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${
                  lang === "fr"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-blue-700 hover:bg-blue-50"
                }`}
              >
                <Languages className="h-4 w-4" />
                FR
              </button>

              <button
                onClick={() => changeLanguage("en")}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${
                  lang === "en"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-blue-700 hover:bg-blue-50"
                }`}
              >
                <Globe2 className="h-4 w-4" />
                EN
              </button>
            </div>
          </div>

          <Badge className="rounded-full border border-blue-200 bg-white/70 px-5 py-2 text-blue-700 shadow-sm backdrop-blur-xl">
            {t[lang].badge}
          </Badge>

          <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            {t[lang].title1}
            <br />
            {t[lang].title2}
            <br />
            <span className="bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              {t[lang].title3}
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            {t[lang].desc}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={isLoggedIn ? "/dashboard" : "/signin"}>
              <Button
                size="lg"
                className="h-12 rounded-2xl bg-blue-600 px-8 text-base text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 hover:bg-blue-700"
              >
                {t[lang].start}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-blue-200 bg-white/70 px-8 text-base text-blue-700 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-blue-50"
            >
              {t[lang].doc}
            </Button>
          </div>

          <div className="surface-card mx-auto mt-16 max-w-4xl p-4">
            <div className="flex items-center gap-2 border-b border-blue-100 px-4 pb-4">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-sm text-slate-400">
                codentsika.ai/studio
              </span>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-3">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="surface-card surface-card-hover rounded-2xl bg-white/95 p-5 text-left shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <Badge className="rounded-full border-blue-100 bg-blue-50 px-4 py-2 text-blue-700">
            <Wand2 className="mr-2 h-4 w-4" />
            {t[lang].features}
          </Badge>

          <h2 className="mt-6 text-4xl font-black text-slate-950 md:text-5xl">
            {t[lang].sectionTitle}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="surface-card surface-card-hover group rounded-3xl bg-white/88"
            >
              <CardContent className="p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-500">{feature.desc}</p>

                <Button
                  variant="ghost"
                  className="mt-6 p-0 text-blue-700 hover:bg-transparent hover:text-blue-800"
                >
                  {t[lang].discover}
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="surface-card mt-20 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 animate-spin items-center justify-center rounded-full border border-blue-200 border-t-blue-600 text-blue-600">
            <Code2 className="h-7 w-7" />
          </div>

          <h3 className="text-3xl font-black text-slate-950">
            {t[lang].loadingTitle}
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            {t[lang].loadingDesc}
          </p>
        </div>
      </section>
    </main>
  );
}
