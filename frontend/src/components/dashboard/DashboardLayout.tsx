// components/dashboard/DashboardLayout.tsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Code2,
  Bell,
  Search,
  Menu,
  X,
  Home,
  Layers,
  Wand2,
  Bot,
  Terminal,
  Settings,
  LogOut,
  BookOpen,
  ChevronDown,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const API_URL = "https://codentsika-v1.onrender.com";

interface User {
  id: number;
  email: string;
  name: string;
  provider: string;
  role: string;
  avatar_url?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Projet généré avec succès",
      description: "Votre backend Laravel est prêt.",
      timestamp: "Il y a 2 min",
      read: false,
      icon: CheckCircle,
    },
    {
      id: 2,
      type: "info",
      title: "API mock créée",
      description: "Une nouvelle API mock a été ajoutée.",
      timestamp: "Il y a 10 min",
      read: false,
      icon: Code2,
    },
    {
      id: 3,
      type: "warning",
      title: "Limite IA bientôt atteinte",
      description: "Vous approchez de votre quota gratuit.",
      timestamp: "Il y a 1h",
      read: false,
      icon: AlertTriangle,
    },
    {
      id: 4,
      type: "message",
      title: "Nouveau message assistant IA",
      description: "L’assistant IA a répondu à votre demande.",
      timestamp: "Il y a 3h",
      read: true,
      icon: MessageCircle,
    },
  ]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedLang = localStorage.getItem("codentsika_lang");
    if (savedLang === "fr" || savedLang === "en") setLang(savedLang);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("session_token");

      if (tokenFromUrl) {
        localStorage.setItem("session_token", tokenFromUrl);
        window.history.replaceState({}, "", window.location.pathname);
      }

      const sessionToken = localStorage.getItem("session_token");

      if (!sessionToken) {
        navigate("/signin");
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
          navigate("/signin");
        }
      } catch {
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

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
      } catch {
        // Ignore logout errors
      }
    }

    localStorage.removeItem("session_token");
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

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const getNotificationBgClass = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-500";
      case "warning":
        return "bg-amber-500";
      case "message":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  const t = {
    fr: {
      search: "Rechercher...",
      home: "Accueil",
      generate: "Générer",
      myProjects: "Mes Projets",
      api: "Générateur d'API",
      ai: "Assistant IA",
      backend: "Backend Studio",
      docs: "Documentation",
      settings: "Paramètres",
      logout: "Déconnexion",
    },
    en: {
      search: "Search...",
      home: "Home",
      generate: "Generate",
      myProjects: "My Projects",
      api: "API Generator",
      ai: "AI Assistant",
      backend: "Backend Studio",
      docs: "Documentation",
      settings: "Settings",
      logout: "Logout",
    },
  };

  const menuItems = [
    {
      path: "/dashboard",
      icon: <Home className="h-4 w-4" />,
      label: t[lang].home,
    },
    {
      path: "/dashboard/projects",
      icon: <Wand2 className="h-4 w-4" />,
      label: t[lang].generate,
    },
    {
      path: "/dashboard/my-projects",
      icon: <Layers className="h-4 w-4" />,
      label: t[lang].myProjects,
    },
    {
      path: "/dashboard/api-generator",
      icon: <Code2 className="h-4 w-4" />,
      label: t[lang].api,
    },
    {
      path: "/dashboard/ai-assistant",
      icon: <Bot className="h-4 w-4" />,
      label: t[lang].ai,
    },
    {
      path: "/dashboard/backend-studio",
      icon: <Terminal className="h-4 w-4" />,
      label: t[lang].backend,
    },
    {
      path: "/dashboard/subscription",
      icon: <DollarSign className="h-4 w-4" />,
      label: "Abonnement",
    },
    {
      path: "/dashboard/cookies",
      icon: <ShieldCheck className="h-4 w-4" />,
      label: "Cookies",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page-shell soft-grid">
      <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link to="/dashboard" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white shadow-[0_18px_40px_-18px_rgba(37,99,235,0.7)] transition-transform duration-300 group-hover:scale-[1.03]">
                <Code2 className="h-4 w-4" />
              </div>

              <div className="hidden sm:block">
                <span className="block text-[15px] font-black tracking-tight text-slate-950">
                  Codentsika
                </span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Studio
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t[lang].search}
                className="soft-input h-11 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <button
              className="relative rounded-2xl border border-white/70 bg-white/80 p-2.5 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              onClick={() => setShowNotificationsMenu((prev) => !prev)}
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {showNotificationsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotificationsMenu(false)}
                />
                <div className="absolute right-0 top-14 z-50 w-80 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-950">
                      Notifications
                    </h3>
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto pr-2">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Aucune notification
                      </p>
                    ) : (
                      notifications.map((notif) => {
                        const Icon = notif.icon;

                        return (
                          <button
                            type="button"
                            key={notif.id}
                            className={`mb-2 flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 ${
                              notif.read ? "opacity-70" : ""
                            }`}
                            onClick={() => handleNotificationClick(notif.id)}
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${getNotificationBgClass(
                                notif.type,
                              )}`}
                            >
                              <Icon className="h-5 w-5 text-white" />
                            </div>

                            <div className="flex-1">
                              <p
                                className={`text-sm font-semibold ${
                                  notif.read
                                    ? "text-slate-700"
                                    : "text-slate-900"
                                }`}
                              >
                                {notif.title}
                              </p>
                              <p
                                className={`text-xs ${
                                  notif.read
                                    ? "text-slate-500"
                                    : "text-slate-700"
                                }`}
                              >
                                {notif.description}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {notif.timestamp}
                              </p>
                            </div>

                            {!notif.read && (
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-sm sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-sm font-bold text-white">
                {getInitials(user.name || user.email)}
              </div>
              <div className="hidden md:block">
                <p className="max-w-[150px] truncate text-sm font-bold text-slate-800">
                  {user.email}
                </p>
                <p className="text-xs text-slate-500">{user.provider}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 flex-col border-r border-white/70 bg-white/55 p-4 backdrop-blur-xl">
          <div className="mb-3 px-2">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              Workspace
            </p>
          </div>

          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_18px_40px_-22px_rgba(37,99,235,0.85)]"
                    : "text-slate-600 hover:bg-white/90 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-[1.75rem] border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 font-bold text-white">
                {getInitials(user.name || user.email)}
              </div>

              <div className="flex-1 truncate">
                <p className="truncate text-sm font-bold text-slate-800">
                  {user.email}
                </p>
                <p className="truncate text-xs text-slate-500">{user.name}</p>
              </div>
            </div>

            <Link
              to="/dashboard/docs"
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                isActive("/dashboard/docs")
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {t[lang].docs}
            </Link>

            <Link
              to="/dashboard/settings"
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                isActive("/dashboard/settings")
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings className="h-4 w-4" />
              {t[lang].settings}
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t[lang].logout}
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              className="fixed inset-0 bg-black/20"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-white/80 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 font-bold text-white">
                  {getInitials(user.name || user.email)}
                </div>

                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {user.email}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.name}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-1 border-t border-slate-200 pt-4">
                <Link
                  to="/dashboard/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive("/dashboard/docs")
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  {t[lang].docs}
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive("/dashboard/settings")
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  {t[lang].settings}
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {t[lang].logout}
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="min-h-[calc(100vh-4rem)] flex-1 lg:ml-72">
          {children}
        </main>
      </div>
    </div>
  );
}
