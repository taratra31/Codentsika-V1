import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Code2, Globe2, User, LogOut, ChevronDown } from "lucide-react";

const API_URL = "https://codentsika-v1.onrender.com";

interface User {
  id: number;
  email: string;
  name: string;
  provider: string;
  role: string;
  avatar_url?: string;
}

interface NavbarProps {
  lang?: "fr" | "en";
  onChangeLanguage?: (lang: "fr" | "en") => void;
}

export default function Navbar({ lang = "fr", onChangeLanguage }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const sessionToken = localStorage.getItem("session_token");

      if (!sessionToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/me`, {
          headers: {
            "X-Session-Token": sessionToken,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem("session_token");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem("session_token");
    if (sessionToken) {
      try {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            "X-Session-Token": sessionToken,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("session_token");
    setUser(null);
    navigate("/signin");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const t = {
    fr: {
      brand: "Codentsika",
      features: "Fonctionnalités",
      api: "API",
      backend: "Backend",
      signup: "Connexion",
      dashboard: "Tableau de bord",
      profile: "Mon profil",
      settings: "Paramètres",
      logout: "Déconnexion",
    },
    en: {
      brand: "Codentsika",
      features: "Features",
      api: "API",
      backend: "Backend",
      signup: "Sign In",
      dashboard: "Dashboard",
      profile: "My profile",
      settings: "Settings",
      logout: "Logout",
    },
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/80 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white shadow-[0_18px_40px_-18px_rgba(37,99,235,0.65)] transition-transform duration-300 group-hover:scale-[1.03]">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-black tracking-tight text-slate-950">
              {t[lang].brand}
            </span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Build faster
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a
            href="/#features"
            className="font-medium text-slate-600 transition hover:text-blue-700"
          >
            {t[lang].features}
          </a>
          <a
            href="/#api"
            className="font-medium text-slate-600 transition hover:text-blue-700"
          >
            {t[lang].api}
          </a>
          <a
            href="/#backend"
            className="font-medium text-slate-600 transition hover:text-blue-700"
          >
            {t[lang].backend}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          {onChangeLanguage && (
            <button
              onClick={() => onChangeLanguage(lang === "fr" ? "en" : "fr")}
              className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-slate-500 shadow-sm transition hover:bg-white"
            >
              <Globe2 className="h-5 w-5" />
            </button>
          )}

          {/* User section */}
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button className="rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.7)] transition hover:-translate-y-0.5 hover:bg-blue-700">
                  {t[lang].dashboard}
                </Button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white text-sm font-bold">
                    {getInitials(user.name || user.email)}
                  </div>
                  <span className="hidden text-sm font-semibold text-slate-800 sm:inline-block">
                    {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-3xl border border-white/80 bg-white/92 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl z-50">
                      <div className="border-b border-blue-100 px-4 py-3">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {user.provider === "google"
                            ? "Google"
                            : user.provider === "github"
                              ? "GitHub"
                              : "Email"}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-blue-50"
                        >
                          <User className="h-4 w-4" />
                          {t[lang].dashboard}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {t[lang].logout}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link to="/signin">
              <Button className="rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.7)] transition hover:-translate-y-0.5 hover:bg-blue-700">
                {t[lang].signup}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
