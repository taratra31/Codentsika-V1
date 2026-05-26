import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Bell,
  Camera,
  CheckCircle2,
  Globe2,
  Mail,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";

type Lang = "fr" | "en";

export default function Settings() {
  const [lang, setLang] = useState<Lang>("fr");
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    fullName: "Taratra Andriam",
    username: "andriamtaratra5",
    email: "andriamtaratra5@gmail.com",
    role: "Fullstack Developer",
    theme: "light",
    notifications: true,
    language: "fr",
    avatar: "",
  });

  useEffect(() => {
    const savedLang = localStorage.getItem("codentsika_lang");
    if (savedLang === "fr" || savedLang === "en") {
      setLang(savedLang);
      setSettings((prev) => ({ ...prev, language: savedLang }));
    }
  }, []);

  const t = {
    fr: {
      badge: "Paramètres",
      title: "Paramètres du compte",
      subtitle:
        "Gère ton profil, tes préférences et la configuration de ton espace.",
      profile: "Profil utilisateur",
      preferences: "Préférences",
      fullName: "Nom complet",
      username: "Nom d’utilisateur",
      email: "Adresse email",
      role: "Rôle",
      theme: "Thème",
      language: "Langue",
      notifications: "Notifications",
      enableNotifications: "Activer les notifications",
      save: "Enregistrer les paramètres",
      saved: "Paramètres enregistrés avec succès",
      light: "Clair",
      dark: "Sombre",
      upload: "Changer photo",
      status: "Compte actif",
    },
    en: {
      badge: "Settings",
      title: "Account settings",
      subtitle: "Manage your profile, preferences and workspace configuration.",
      profile: "User profile",
      preferences: "Preferences",
      fullName: "Full name",
      username: "Username",
      email: "Email address",
      role: "Role",
      theme: "Theme",
      language: "Language",
      notifications: "Notifications",
      enableNotifications: "Enable notifications",
      save: "Save settings",
      saved: "Settings saved successfully",
      light: "Light",
      dark: "Dark",
      upload: "Change photo",
      status: "Active account",
    },
  };

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "language" && (value === "fr" || value === "en")) {
      setLang(value);
      localStorage.setItem("codentsika_lang", value);
    }
  };

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSettings((prev) => ({ ...prev, avatar: imageUrl }));
  };

  const handleSave = () => {
    localStorage.setItem("codentsika_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
                  <SettingsIcon className="mr-2 h-3.5 w-3.5" />
                  {t[lang].badge}
                </Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  {t[lang].title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                  {t[lang].subtitle}
                </p>
              </div>

              <Badge className="w-fit rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t[lang].status}
              </Badge>
            </div>
          </section>

          {saved && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700 shadow-sm">
              {t[lang].saved}
            </div>
          )}

          <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
            <Card className="surface-card h-fit">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] bg-blue-50 text-blue-600 ring-4 ring-blue-100">
                  {settings.avatar ? (
                    <img
                      src={settings.avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12" />
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  {settings.fullName}
                </h2>

                <p className="mt-1 text-sm font-bold text-blue-600">
                  @{settings.username}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  {settings.role}
                </p>

                <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100">
                  <Camera className="mr-2 h-4 w-4" />
                  {t[lang].upload}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatar}
                    className="hidden"
                  />
                </label>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="surface-card">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">
                      {t[lang].profile}
                    </h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label={t[lang].fullName}
                      icon={<User className="h-4 w-4" />}
                      value={settings.fullName}
                      onChange={(value) => handleChange("fullName", value)}
                    />

                    <Field
                      label={t[lang].username}
                      icon={<User className="h-4 w-4" />}
                      value={settings.username}
                      onChange={(value) => handleChange("username", value)}
                    />

                    <Field
                      label={t[lang].email}
                      icon={<Mail className="h-4 w-4" />}
                      value={settings.email}
                      onChange={(value) => handleChange("email", value)}
                    />

                    <Field
                      label={t[lang].role}
                      icon={<Shield className="h-4 w-4" />}
                      value={settings.role}
                      onChange={(value) => handleChange("role", value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="surface-card">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <Palette className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">
                      {t[lang].preferences}
                    </h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        {t[lang].theme}
                      </label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleChange("theme", e.target.value)}
                        className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="light">{t[lang].light}</option>
                        <option value="dark">{t[lang].dark}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        {t[lang].language}
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) =>
                          handleChange("language", e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/40 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                          <Bell className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="font-black text-slate-950">
                            {t[lang].notifications}
                          </h3>
                          <p className="text-sm font-medium text-slate-500">
                            {t[lang].enableNotifications}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleChange("notifications", !settings.notifications)
                        }
                        className={`relative h-8 w-14 rounded-full transition ${
                          settings.notifications
                            ? "bg-blue-600"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                            settings.notifications ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface-card">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-200 text-gray-600">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">
                      Pages Légales
                    </h2>
                  </div>

                  <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600">
                    <Link
                      to="/legal/privacy"
                      className="hover:text-blue-600 hover:underline"
                    >
                      Politique de confidentialité
                    </Link>

                    <Link
                      to="/legal/terms"
                      className="hover:text-blue-600 hover:underline"
                    >
                      Conditions d&apos;utilisation
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("open-cookie-preferences"),
                        );
                      }}
                      className="text-left hover:text-blue-600 hover:underline"
                    >
                      Gestion des cookies
                    </button>
                  </nav>
                </CardContent>
              </Card>

              <Button
                onClick={handleSave}
                className="h-14 rounded-2xl bg-blue-600 px-7 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {t[lang].save}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <div className="flex h-14 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 px-4 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <span className="text-blue-500">{icon}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
