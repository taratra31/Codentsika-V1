import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Code2, ShieldCheck, AlertCircle, X } from "lucide-react";

const API_URL = "https://codentsika-v1.onrender.com";

export default function SignIn() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedLang = localStorage.getItem("codentsika_lang");
    if (savedLang === "fr" || savedLang === "en") {
      setLang(savedLang);
    }

    // Récupérer le token depuis l'URL après redirect
    const params = new URLSearchParams(location.search);
    const sessionToken = params.get("session_token");
    const errorParam = params.get("error");
    const errorDesc = params.get("error_description");

    // Raha misy session_token, stocker dans localStorage
    if (sessionToken) {
      console.log("✅ Session token trouvé:", sessionToken);
      localStorage.setItem("session_token", sessionToken);
      // Rediriger vers dashboard sans les params
      navigate("/dashboard", { replace: true });
      return;
    }

    // Vérifier les erreurs
    if (errorParam) {
      if (errorParam === "email_exists") {
        setError(
          t[lang].emailExists || "Cet email est déjà associé à un autre compte",
        );
      } else if (errorParam === "auth_failed") {
        setError(t[lang].authFailed || "Échec de l'authentification");
      } else if (errorParam === "no_email") {
        setError(t[lang].noEmail || "Aucun email trouvé depuis le fournisseur");
      } else {
        setError(
          errorDesc ||
            t[lang].unknownError ||
            "Une erreur inattendue est survenue",
        );
      }
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/signin");
    }

    // Vérifier si déjà connecté
    const existingToken = localStorage.getItem("session_token");
    if (existingToken) {
      navigate("/dashboard");
    }
  }, [location.search, lang, navigate]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    window.location.href = `${API_URL}/login/google`;
  };

  const handleGithubLogin = () => {
    setLoading(true);
    setError(null);
    window.location.href = `${API_URL}/login/github`;
  };

  const t = {
    fr: {
      back: "Retour",
      badge: "Codentsika AI Studio",
      title: "Connectez-vous à votre espace IA",
      highlight: "et développez plus rapidement.",
      desc: "Accédez à votre assistant IA, vos générateurs d'API et vos projets backend depuis une interface moderne et sécurisée.",
      secureTitle: "Connexion sécurisée",
      secureDesc: "Authentification rapide avec Google et GitHub.",
      fastTitle: "Espace développeur intelligent",
      fastDesc: "Une expérience fluide conçue pour créer plus vite.",
      loginTitle: "Se connecter",
      loginDesc: "Continuez avec votre compte",
      google: "Continuer avec Google",
      github: "Continuer avec GitHub",
      terms:
        "En vous connectant, vous acceptez les conditions d'utilisation et la politique de confidentialité.",
      emailExists:
        "Cet email est déjà utilisé avec un autre fournisseur. Veuillez vous connecter avec la méthode originale.",
      authFailed: "Échec de l'authentification. Veuillez réessayer.",
      noEmail: "Impossible de récupérer votre email. Vérifiez vos permissions.",
      unknownError: "Une erreur est survenue. Veuillez réessayer.",
      loading: "Connexion en cours...",
    },
    en: {
      back: "Back",
      badge: "Codentsika AI Studio",
      title: "Sign in to your AI workspace",
      highlight: "and build faster.",
      desc: "Access your AI assistant, API generators and backend projects from a modern and secure interface.",
      secureTitle: "Secure authentication",
      secureDesc: "Fast sign-in with Google and GitHub.",
      fastTitle: "Intelligent developer workspace",
      fastDesc: "A smooth experience designed to help you build faster.",
      loginTitle: "Sign in",
      loginDesc: "Continue with your account",
      google: "Continue with Google",
      github: "Continue with GitHub",
      terms:
        "By signing in, you agree to the terms of service and privacy policy.",
      emailExists:
        "This email is already used with another provider. Please sign in with the original method.",
      authFailed: "Authentication failed. Please try again.",
      noEmail: "Unable to retrieve your email. Check your permissions.",
      unknownError: "An error occurred. Please try again.",
      loading: "Connecting...",
    },
  };

  return (
    <main className="page-shell relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-slate-950">
      <div className="ambient-orb left-10 top-20 h-44 w-44 bg-blue-400/20" />
      <div className="ambient-orb bottom-20 right-10 h-60 w-60 bg-sky-300/25" />

      <Link
        to="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:bg-blue-50"
      >
        <ArrowLeft className="h-4 w-4" />
        {t[lang].back}
      </Link>

      {error && (
        <div className="fixed top-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-xl backdrop-blur-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <p className="flex-1 text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="rounded-full p-1 text-red-500 transition hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-lg font-semibold text-slate-700">
                {t[lang].loading}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="hidden animate-[fadeUp_.8s_ease-out] md:block">
          <Badge className="rounded-full border border-blue-200 bg-white/70 px-5 py-2 text-blue-700 shadow-sm backdrop-blur-xl">
            <Code2 className="mr-2 h-4 w-4" />
            {t[lang].badge}
          </Badge>
          <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight">
            {t[lang].title}
            <span className="block bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              {t[lang].highlight}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            {t[lang].desc}
          </p>
          <div className="mt-10 grid max-w-md gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">{t[lang].secureTitle}</h3>
                <p className="text-sm text-slate-500">{t[lang].secureDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                <Code2 className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold">{t[lang].fastTitle}</h3>
                <p className="text-sm text-slate-500">{t[lang].fastDesc}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="surface-card animate-[fadeScale_.8s_ease-out] rounded-[2rem] bg-white/88 shadow-[0_24px_70px_-32px_rgba(37,99,235,0.38)]">
          <CardContent className="p-8 md:p-10">
            <div className="mx-auto mb-8 flex flex-col items-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 text-white shadow-[0_24px_60px_-24px_rgba(37,99,235,0.55)]">
                <Code2 className="h-11 w-11 animate-pulse" />
                <div className="absolute inset-0 animate-spin rounded-[2rem] border-2 border-transparent border-t-white" />
                <div className="absolute -inset-4 rounded-[2.5rem] bg-blue-400/20 blur-xl" />
              </div>
              <h1 className="mt-5 bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-3xl font-black text-transparent">
                Codentsika
              </h1>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                AI STUDIO
              </p>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-black">{t[lang].loginTitle}</h2>
              <p className="mt-3 text-slate-500">{t[lang].loginDesc}</p>
            </div>

            <div className="mt-8 space-y-4">
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="h-14 w-full rounded-2xl border-slate-200 bg-white text-base font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg disabled:opacity-50"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="mr-3 h-6 w-6"
                />
                {t[lang].google}
              </Button>
              <Button
                onClick={handleGithubLogin}
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-slate-950 text-base font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
              >
                <img
                  src="https://github.githubassets.com/favicons/favicon.svg"
                  alt="GitHub"
                  className="mr-3 h-6 w-6 rounded-full bg-white p-0.5"
                />
                {t[lang].github}
              </Button>
            </div>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-blue-100" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Codentsika
              </span>
              <div className="h-px flex-1 bg-blue-100" />
            </div>
            <p className="text-center text-sm text-slate-500">
              {t[lang].terms}
            </p>
          </CardContent>
        </Card>
      </div>

      <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeScale { from { opacity: 0; transform: translateY(28px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes slide-in-from-top-5 { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
                .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
                .slide-in-from-top-5 { animation-name: slide-in-from-top-5; }
            `}</style>
    </main>
  );
}
