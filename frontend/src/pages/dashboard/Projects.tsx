import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileCode,
  Folder,
  FolderOpen,
  Layers,
  Loader2,
  RotateCcw,
  Sparkles,
  Terminal,
  Wand2,
  Check,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

interface FileItem {
  path: string;
  content: string;
}

interface ProjectData {
  project_name: string;
  description: string;
  files: FileItem[];
}

interface FileNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: FileNode[];
}

// Helper tool to construct recursive folder hierarchy from flat paths
function buildTree(files: FileItem[]): FileNode {
  const root: FileNode = {
    name: "root",
    path: "",
    isFolder: true,
    children: [],
  };

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = index === parts.length - 1;

      let found = current.children.find((child) => child.name === part);
      if (!found) {
        found = {
          name: part,
          path: currentPath,
          isFolder: !isLast,
          children: [],
        };
        current.children.push(found);
      }
      current = found;
    });
  });

  // Sort tree: directories first, then files alphabetically
  const sortNodes = (node: FileNode) => {
    node.children.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNodes);
  };
  sortNodes(root);

  return root;
}

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  expandedPaths: Record<string, boolean>;
  togglePath: (path: string) => void;
  selectedPath: string;
  onSelectFile: (path: string) => void;
}

const FileTreeNode = ({
  node,
  depth,
  expandedPaths,
  togglePath,
  selectedPath,
  onSelectFile,
}: FileTreeNodeProps) => {
  const isExpanded = expandedPaths[node.path] ?? true; // Default expanded to see files immediately

  if (node.path === "") {
    return (
      <div className="space-y-0.5">
        {node.children.map((child) => (
          <FileTreeNode
            key={child.path}
            node={child}
            depth={depth}
            expandedPaths={expandedPaths}
            togglePath={togglePath}
            selectedPath={selectedPath}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    );
  }

  const paddingLeft = `${depth * 12}px`;

  if (node.isFolder) {
    return (
      <div className="select-none">
        <button
          type="button"
          onClick={() => togglePath(node.path)}
          style={{ paddingLeft }}
          className="flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-[0.99]"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-blue-500 fill-blue-50/50" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-blue-500 fill-blue-50/50" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {isExpanded && (
          <div className="mt-0.5">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                togglePath={togglePath}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    const isSelected = selectedPath === node.path;
    return (
      <button
        type="button"
        onClick={() => onSelectFile(node.path)}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
        className={`flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-left text-xs font-semibold transition active:scale-[0.99] ${
          isSelected
            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <FileCode
          className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`}
        />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
};

export default function Projects() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [framework, setFramework] = useState<"fastapi">("fastapi");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);

  // IDE interaction states
  const [selectedPath, setSelectedPath] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>(
    {},
  );
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Premium Progress states
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 15) {
            setProgressMessage(
              lang === "fr"
                ? "Initialisation de l'architecte Codentsika..."
                : "Initializing Codentsika architect...",
            );
            return prev + 1.5;
          } else if (prev < 35) {
            setProgressMessage(
              lang === "fr"
                ? "Extraction des entités et schémas..."
                : "Extracting entities and schemas...",
            );
            return prev + 1.2;
          } else if (prev < 55) {
            setProgressMessage(
              lang === "fr"
                ? "Génération des fichiers de migration SQL..."
                : "Generating SQL migration files...",
            );
            return prev + 1.0;
          } else if (prev < 75) {
            setProgressMessage(
              lang === "fr"
                ? `Création des modèles et contrôleurs CRUD (${framework})...`
                : `Creating ${framework} CRUD models & controllers...`,
            );
            return prev + 0.8;
          } else if (prev < 85) {
            setProgressMessage(
              lang === "fr"
                ? "Configuration des middleware et documentation..."
                : "Configuring middleware and documentation...",
            );
            return prev + 0.5;
          } else if (prev < 92) {
            setProgressMessage(
              lang === "fr"
                ? "Génération des fichiers de code source..."
                : "Generating source code files...",
            );
            return prev + 0.15;
          } else if (prev < 95) {
            setProgressMessage(
              lang === "fr"
                ? "Attente de la réponse du serveur..."
                : "Waiting for server response...",
            );
            return prev + 0.02;
          } else {
            // Bloquer à 95% jusqu'au retour du backend
            setProgressMessage(
              lang === "fr"
                ? "En attente du serveur... (cela peut prendre 2-5 min)"
                : "Waiting for server... (this may take 2-5 min)",
            );
            return 95;
          }
        });
      }, 600);
    } else {
      setProgress(0);
      setProgressMessage("");
    }
    return () => clearInterval(interval);
  }, [loading, framework, lang]);

  useEffect(() => {
    const savedLang = localStorage.getItem("codentsika_lang");
    if (savedLang === "fr" || savedLang === "en") setLang(savedLang);
  }, []);

  const t = {
    fr: {
      title: "Project Architect",
      badge: "Générateur de Projets",
      subtitle:
        "Concevez et téléchargez des projets backend complets (FastAPI) structurés en 30 secondes grâce à l'IA.",
      promptPlaceholder:
        "Décrivez votre projet (ex: Un système de gestion de bibliothèque avec membres, prêts de livres et gestion d'amendes)...",
      chooseFramework: "1. Choisissez votre Framework",
      describeProject: "2. Décrivez les spécifications du projet",
      generateBtn: "Concevoir le Projet",
      generatingTitle: "Conception du projet en cours...",
      generatingSub:
        "L'IA de Codentsika crée l'architecture, rédige le code source et prépare le package...",
      downloadZip: "Télécharger le Projet (.ZIP)",
      createAnother: "Créer un autre projet",
      noFileSelected: "Sélectionnez un fichier pour visualiser le code source",
      copyCode: "Copier",
      codeCopied: "Copié !",
      suggestionsTitle: "Exemples rapides :",
      sug1: "API E-commerce avec panier, commandes et gestion des stocks.",
      sug2: "Backend de Blog avec articles, commentaires et rôles d'auteurs.",
      sug3: "Système de réservation de vols avec passagers, escales et tickets.",
    },
    en: {
      title: "Project Architect",
      badge: "Project Generator",
      subtitle:
        "Design and download complete structured backend projects (FastAPI) in 30 seconds using AI.",
      promptPlaceholder:
        "Describe your project (e.g. A library management system with members, book loans and fine logs)...",
      chooseFramework: "1. Choose your Framework",
      describeProject: "2. Describe project specifications",
      generateBtn: "Design Project",
      generatingTitle: "Designing your project...",
      generatingSub:
        "Codentsika AI is structuring files, writing source code, and packaging the bundle...",
      downloadZip: "Download Project (.ZIP)",
      createAnother: "Create another project",
      noFileSelected: "Select a file to view the source code",
      copyCode: "Copy",
      codeCopied: "Copied !",
      suggestionsTitle: "Quick examples:",
      sug1: "E-commerce API with cart, orders, and stock inventory.",
      sug2: "Blog Backend with posts, comments, and author roles.",
      sug3: "Flight booking system with passengers, stops, and tickets.",
    },
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setProject(null);

    const sessionToken = localStorage.getItem("session_token");

    try {
      console.log("🚀 Démarrage de la génération du projet...");
      console.log("Framework:", framework);
      console.log("Prompt:", prompt.substring(0, 100) + "...");

      // Créer un AbortController avec timeout de 10 minutes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

      const response = await fetch(`${API_URL}/api/generator/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({
          framework,
          prompt: prompt.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("📡 Réponse reçue, status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données reçues:", {
          project_name: data.project_name,
          files_count: data.files?.length || 0,
        });

        setProgress(100);
        setProgressMessage(
          lang === "fr"
            ? "Projet généré avec succès !"
            : "Project generated successfully!",
        );
        setTimeout(() => {
          setProject(data);
          if (data.files && data.files.length > 0) {
            setSelectedPath(data.files[0].path);
          }
          setLoading(false);
        }, 800);
      } else {
        console.error("❌ Erreur HTTP:", response.status);
        const err = await response.json().catch(() => ({}));
        console.error("Détails erreur:", err);
        setErrorMsg(
          err.detail || `Erreur ${response.status}: ${response.statusText}`,
        );
        setLoading(false);
      }
    } catch (err: any) {
      console.error("❌ Exception capturée:", err);
      if (err.name === "AbortError") {
        setErrorMsg(
          lang === "fr"
            ? "La génération a pris trop de temps (timeout 10 min). Essayez avec un projet plus simple."
            : "Generation took too long (10 min timeout). Try with a simpler project.",
        );
      } else {
        setErrorMsg(
          lang === "fr"
            ? `Erreur: ${err.message || "Impossible de contacter le serveur backend."}`
            : `Error: ${err.message || "Unable to contact backend server."}`,
        );
      }
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!project) return;
    setDownloading(true);
    const sessionToken = localStorage.getItem("session_token");

    try {
      const response = await fetch(`${API_URL}/api/generator/project/zip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({
          project_name: project.project_name,
          files: project.files,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.project_name}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      // Silently handle
    } finally {
      setDownloading(false);
    }
  };

  const togglePath = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const selectedFile = project?.files.find((f) => f.path === selectedPath);

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]">
        <div className="space-y-7 p-4 md:p-6 lg:p-8">
          {/* Header Panel */}
          <section className="flex flex-col gap-4 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/60 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="mb-3 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-blue-700 hover:bg-blue-50 font-black">
                <Layers className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                {t[lang].badge}
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                {t[lang].title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 font-bold">
                {t[lang].subtitle}
              </p>
            </div>
          </section>

          {/* ERROR BOX */}
          {errorMsg && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-md">
              {errorMsg}
            </div>
          )}

          {/* GENERATION STATE: MOCK OR PROMPT SELECTOR */}
          {!loading && !project && (
            <div className="grid gap-6 md:grid-cols-[1fr_350px]">
              {/* Main configuration pane */}
              <Card className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/40">
                <CardContent className="p-0 space-y-6">
                  {/* 1. Framework Selection */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-sm font-black">
                        1
                      </span>
                      {t[lang].chooseFramework}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        type="button"
                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all active:scale-[0.98] border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100/40`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-black bg-blue-600 text-white`}
                          >
                            Py
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 text-sm">
                              FastAPI (Python)
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">
                              Pydantic, SQLAlchemy, Uvicorn
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Prompt input specifications */}
                  <div className="space-y-3 pt-2">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-sm font-black">
                        2
                      </span>
                      {t[lang].describeProject}
                    </h2>
                    <div className="relative rounded-2xl border border-blue-100 bg-slate-50 p-1 transition-all focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t[lang].promptPlaceholder}
                        className="w-full h-40 bg-transparent p-4 text-sm font-bold leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Generate trigger action */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-6 font-black text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>{t[lang].generateBtn}</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Sidebar prompt helper cards */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider pl-1">
                  {t[lang].suggestionsTitle}
                </h3>
                <button
                  onClick={() => setPrompt(t[lang].sug1)}
                  className="w-full text-left rounded-2xl border border-blue-100 bg-white p-4 font-bold text-xs text-slate-600 hover:bg-blue-50/50 hover:border-blue-200 transition-all active:scale-[0.98] shadow-sm leading-relaxed"
                >
                  {t[lang].sug1}
                </button>
                <button
                  onClick={() => setPrompt(t[lang].sug2)}
                  className="w-full text-left rounded-2xl border border-blue-100 bg-white p-4 font-bold text-xs text-slate-600 hover:bg-blue-50/50 hover:border-blue-200 transition-all active:scale-[0.98] shadow-sm leading-relaxed"
                >
                  {t[lang].sug2}
                </button>
                <button
                  onClick={() => setPrompt(t[lang].sug3)}
                  className="w-full text-left rounded-2xl border border-blue-100 bg-white p-4 font-bold text-xs text-slate-600 hover:bg-blue-50/50 hover:border-blue-200 transition-all active:scale-[0.98] shadow-sm leading-relaxed"
                >
                  {t[lang].sug3}
                </button>
              </div>
            </div>
          )}

          {/* SEEDING LOADER SCREEN — PREMIUM PROGRESS BAR */}
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-blue-100 bg-white py-16 px-8 shadow-xl shadow-blue-100/40 space-y-8">
              {/* Animated Icon */}
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-30" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: "#6366f1",
                    borderRightColor: "#3b82f6",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div className="relative z-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-300">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t[lang].generatingTitle}
                </h3>
                <p className="text-sm font-semibold text-slate-400 max-w-md leading-relaxed">
                  {t[lang].generatingSub}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">
                    {progressMessage ||
                      (lang === "fr" ? "Démarrage..." : "Starting...")}
                  </span>
                  <span className="text-sm font-black text-blue-600 tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* Track */}
                <div className="relative h-3 w-full rounded-full bg-blue-50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background:
                        "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)",
                    }}
                  />
                </div>

                {/* Step milestones */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[
                    {
                      label: lang === "fr" ? "Analyse" : "Analyze",
                      threshold: 15,
                    },
                    {
                      label: lang === "fr" ? "Migration" : "Migration",
                      threshold: 40,
                    },
                    {
                      label: lang === "fr" ? "Contrôleurs" : "Controllers",
                      threshold: 70,
                    },
                    {
                      label: lang === "fr" ? "Packaging" : "Packaging",
                      threshold: 95,
                    },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-500 ${progress >= s.threshold ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-blue-100"}`}
                      />
                      <span
                        className={`text-[9px] font-bold transition-colors duration-300 ${progress >= s.threshold ? "text-blue-600" : "text-slate-300"}`}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  FastAPI (Python)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  {lang === "fr"
                    ? "Génération IA NVIDIA"
                    : "NVIDIA AI Generation"}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                  ~2-5 min
                </span>
              </div>
            </div>
          )}

          {/* COMPLETED WORKSPACE IDE WORKBENCH */}
          {!loading && project && (
            <div className="space-y-6">
              {/* Workspace control bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setProject(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-600 hover:bg-blue-50 transition active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {project.project_name}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setProject(null)}
                    variant="outline"
                    className="rounded-2xl border-blue-100 bg-white font-black text-slate-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t[lang].createAnother}</span>
                  </Button>

                  <Button
                    onClick={handleDownloadZip}
                    disabled={downloading}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition active:scale-[0.98] flex items-center gap-2"
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>{t[lang].downloadZip}</span>
                  </Button>
                </div>
              </div>

              {/* VS-CODE STYLE INTERACTIVE WORKBENCH */}
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] rounded-[2rem] border border-blue-100 bg-white shadow-xl shadow-blue-100/50 overflow-hidden min-h-[580px]">
                {/* Left Side Explorer Tree Panel */}
                <div className="border-b lg:border-b-0 lg:border-r border-slate-200/80 p-4 bg-slate-50/50 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-wider mb-4 pl-1">
                    <Terminal className="h-4 w-4 text-blue-500" />
                    <span>Explorateur</span>
                  </div>

                  {/* Recursive Folder Tree display */}
                  <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
                    <FileTreeNode
                      node={buildTree(project.files)}
                      depth={0}
                      expandedPaths={expandedPaths}
                      togglePath={togglePath}
                      selectedPath={selectedPath}
                      onSelectFile={setSelectedPath}
                    />
                  </div>
                </div>

                {/* Right Side Editor Code Panel */}
                <div className="flex flex-col bg-slate-950 overflow-hidden h-full">
                  {selectedFile ? (
                    <>
                      {/* Editor Header Details */}
                      <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950 px-4 py-3 shrink-0">
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="h-4 w-4 text-blue-400 shrink-0" />
                          <span className="text-slate-400 font-mono text-xs truncate">
                            {selectedFile.path}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-bold text-xxs text-slate-400 hover:bg-slate-850 hover:text-white transition active:scale-95"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">
                                {t[lang].codeCopied}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>{t[lang].copyCode}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Editor Panel Viewer */}
                      <div className="flex-1 overflow-auto max-h-[460px] flex font-mono bg-slate-950">
                        {/* Left side line numbers */}
                        <div className="select-none text-right pr-4 pl-3 py-4 text-slate-700 bg-slate-950/40 border-r border-slate-900 shrink-0 text-xs leading-relaxed">
                          {selectedFile.content.split("\n").map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>

                        {/* Main Code pre content */}
                        <pre className="flex-1 text-slate-300 text-xs leading-relaxed p-4 bg-transparent outline-none overflow-x-auto select-text">
                          <code>{selectedFile.content}</code>
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 text-center px-4">
                      <Code2 className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
                      <span className="text-sm font-bold">
                        {t[lang].noFileSelected}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
