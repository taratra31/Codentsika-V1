import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Folder,
  Calendar,
  Code2,
  Download,
  Eye,
  Trash2,
  Loader2,
  FileCode,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

interface SavedProject {
  id: number;
  project_name: string;
  description: string;
  framework: string;
  prompt: string;
  files_count: number;
  created_at: string;
  updated_at: string;
}

export default function MyProjects() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadProjects = async () => {
    setLoading(true);
    const sessionToken = localStorage.getItem("session_token");

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          "X-Session-Token": sessionToken || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        console.error("Erreur chargement projets");
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (projectId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;

    setDeleting(projectId);
    const sessionToken = localStorage.getItem("session_token");

    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "X-Session-Token": sessionToken || "",
        },
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (projectId: number) => {
    // Rediriger vers une page de détail (à créer)
    navigate(`/dashboard/project/${projectId}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFrameworkBadgeColor = (framework: string) => {
    return framework === "laravel"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-container">
          {/* Header */}
          <section className="page-hero flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="page-badge hover:bg-blue-50 font-black">
                <Folder className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Mes Projets
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Projets Générés
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 font-bold">
                Tous vos projets backend générés par l'IA
              </p>
            </div>
            <Button
              onClick={loadProjects}
              variant="outline"
              className="rounded-2xl border-slate-200 bg-white/90 font-bold flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </section>

          {/* Projects List */}
          {loading ? (
            <div className="surface-card flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-sm font-bold text-slate-500">
                Chargement des projets...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center py-16">
              <FileCode className="h-16 w-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-black text-slate-700">
                Aucun projet généré
              </h3>
              <p className="mt-2 text-sm text-slate-500 font-semibold max-w-md text-center">
                Commencez par générer votre premier projet backend avec l'IA !
              </p>
              <Button
                onClick={() => navigate("/dashboard/projects")}
                className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white shadow-lg"
              >
                Générer un projet
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="surface-card surface-card-hover rounded-[2rem] bg-white/90"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-900 truncate">
                          {project.project_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Framework Badge */}
                    <div className="mb-4">
                      <Badge
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${getFrameworkBadgeColor(project.framework)}`}
                      >
                        {project.framework === "laravel"
                          ? "Laravel 11"
                          : "FastAPI"}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs font-bold text-slate-500">
                          Fichiers
                        </div>
                        <div className="text-lg font-black text-slate-900">
                          {project.files_count}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs font-bold text-slate-500">
                          Créé le
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {new Date(project.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleView(project.id)}
                        className="flex-1 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 text-xs h-9"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Voir
                      </Button>
                      <Button
                        onClick={() => handleDelete(project.id)}
                        disabled={deleting === project.id}
                        variant="outline"
                        className="rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-50 text-xs h-9 px-3"
                      >
                        {deleting === project.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
