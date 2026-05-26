import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  Download,
  GitBranch,
  KeyRound,
  Layers3,
  Link2,
  Plus,
  Server,
  Trash2,
  Wand2,
  X,
  Edit3,
  ShieldCheck,
  FileJson,
  Cpu,
  Activity,
  TestTube,
  ChevronDown,
  ChevronRight,
  FileCode,
  Folder,
  FolderOpen,
  Terminal,
  Sparkles,
  Loader2,
  Check,
  Copy,
  RotateCcw,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

type Lang = "fr" | "en";

type Field = {
  id: string;
  name: string;
  type: string;
  primary?: boolean;
  nullable?: boolean;
  unique?: boolean;
};

type Relation = {
  id: string;
  fromTableId: number;
  fromFieldId: string;
  toTableId: number;
  toFieldId: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
};

type TableSchema = {
  id: number;
  name: string;
  fields: Field[];
  x: number;
  y: number;
};

type DraggingInfo = {
  tableId: number;
  offsetX: number;
  offsetY: number;
} | null;

type RelationDrawing = {
  fromTableId: number;
  fromFieldId: string;
  fromX: number;
  fromY: number;
} | null;

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

// Tree builder helper to construct directory nodes from AI file list paths
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
  const isExpanded = expandedPaths[node.path] ?? true;

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

export default function BackendStudio() {
  const [lang, setLang] = useState<Lang>("fr");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [projectName, setProjectName] = useState("");
  const [framework, setFramework] = useState<"fastapi">("fastapi");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{
    tableId: number;
    fieldId: string;
  } | null>(null);

  // Dynamic requirements checkboxes
  const [options, setOptions] = useState<Record<string, boolean>>({
    auth: true,
    docker: false,
    docs: true,
    cors: true,
    rate_limit: false,
    tests: false,
  });

  const [tables, setTables] = useState<TableSchema[]>([
    {
      id: 1,
      name: "users",
      x: 80,
      y: 80,
      fields: [
        { id: "users_id", name: "id", type: "bigint", primary: true },
        { id: "users_name", name: "name", type: "string" },
        { id: "users_email", name: "email", type: "string", unique: true },
        { id: "users_password", name: "password", type: "string" },
        { id: "users_timestamps", name: "timestamps", type: "timestamps" },
      ],
    },
    {
      id: 2,
      name: "posts",
      x: 520,
      y: 200,
      fields: [
        { id: "posts_id", name: "id", type: "bigint", primary: true },
        { id: "posts_user_id", name: "user_id", type: "foreignId" },
        { id: "posts_title", name: "title", type: "string" },
        { id: "posts_content", name: "content", type: "text" },
        { id: "posts_timestamps", name: "timestamps", type: "timestamps" },
      ],
    },
  ]);

  const [relations, setRelations] = useState<Relation[]>([
    {
      id: "rel_1",
      fromTableId: 2,
      fromFieldId: "posts_user_id",
      toTableId: 1,
      toFieldId: "users_id",
      type: "one-to-many",
    },
  ]);

  const [dragging, setDragging] = useState<DraggingInfo>(null);
  const [drawingRelation, setDrawingRelation] = useState<RelationDrawing>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // AI Generation states
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>(
    {},
  );
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
                ? "Extraction du schéma relationnel de la base de données..."
                : "Extracting database relational schema...",
            );
            return prev + 1.2;
          } else if (prev < 55) {
            setProgressMessage(
              lang === "fr"
                ? "Génération des fichiers de migration et configurations SQL..."
                : "Generating migration files and SQL configs...",
            );
            return prev + 1.0;
          } else if (prev < 75) {
            setProgressMessage(
              lang === "fr"
                ? `Création des modèles et contrôleurs CRUD (${framework})...`
                : `Creating ${framework} models and CRUD controllers...`,
            );
            return prev + 0.8;
          } else if (prev < 85) {
            setProgressMessage(
              lang === "fr"
                ? "Configuration des middleware, Docker Compose et Swagger..."
                : "Configuring middleware, Docker Compose, and Swagger...",
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
      badge: "Backend Studio",
      title: "Créer un Projet Backend Scaffolding",
      subtitle:
        "Dessinez votre schéma de base de données, sélectionnez vos packages indispensables, et l'IA génère le code prêt pour la production.",
      projectName: "Nom du projet",
      projectPlaceholder: "ex: ecommerce-api",
      chooseFramework: "1. Choisissez votre Framework",
      chooseOptions: "2. Options & Requirements",
      describeProject: "3. Spécifications du projet",
      stack: "Stack backend",
      database: "Base de données",
      next: "Suivant",
      schemaTitle: "Visual Table Designer",
      schemaSubtitle:
        "Glissez les tables, connectez les clés étrangères (FK) vers les clés primaires (PK) pour structurer vos relations.",
      addTable: "Ajouter une table",
      addField: "Ajouter un champ",
      addRelation: "Ajouter une relation",
      generate: "Compiler & Scaffolder le Projet",
      export: "Télécharger Schema JSON",
      relations: "Relations Détectées",
      ready: "Projet Prêt",
      back: "Retour",
      resetZoom: "Réinitialiser",
      connectFields:
        "Cliquez sur une colonne FK, puis sur une PK pour lier les tables",
      noFileSelected: "Sélectionnez un fichier pour l'examiner",
      copyCode: "Copier",
      codeCopied: "Copié !",
      downloadZip: "Télécharger (.ZIP)",
      createAnother: "Scaffolder un autre projet",
      generatingTitle: "Scaffolding de votre backend en cours...",
      generatingSub:
        "L'IA analyse le schéma de base de données, met en place les middleware requis et écrit le code source...",
    },
    en: {
      badge: "Backend Studio",
      title: "Create a Backend Scaffold Project",
      subtitle:
        "Design your database schema, check required packages and scopes, and AI compiles the production-ready code.",
      projectName: "Project name",
      projectPlaceholder: "ex: ecommerce-api",
      chooseFramework: "1. Choose your Framework",
      chooseOptions: "2. Options & Requirements",
      describeProject: "3. Project specifications",
      stack: "Backend stack",
      database: "Database",
      next: "Next",
      schemaTitle: "Visual Table Designer",
      schemaSubtitle:
        "Drag tables, connect foreign keys (FK) to primary keys (PK) to structure relations.",
      addTable: "Add table",
      addField: "Add field",
      addRelation: "Add relation",
      generate: "Compile & Scaffold Project",
      export: "Download JSON Schema",
      relations: "Detected Relations",
      ready: "Project Ready",
      back: "Back",
      resetZoom: "Reset Zoom",
      connectFields:
        "Click a FK column, then a PK column to connect the tables",
      noFileSelected: "Select a file to inspect the code",
      copyCode: "Copy",
      codeCopied: "Copied !",
      downloadZip: "Download (.ZIP)",
      createAnother: "Scaffold another project",
      generatingTitle: "Scaffolding your backend...",
      generatingSub:
        "AI is inspecting your database schema, applying required middleware, and writing files...",
    },
  };

  const scaffoldOptions = [
    {
      id: "auth",
      label_fr: "Authentification (JWT / Sanctum)",
      label_en: "Authentication (JWT / Sanctum)",
      desc_fr: "Sécurise vos routes et gère l'inscription/connexion.",
      desc_en: "Secures routes and handles registration/login.",
      icon: ShieldCheck,
    },
    {
      id: "docker",
      label_fr: "Support Docker & Compose",
      label_en: "Docker & Compose Support",
      desc_fr: "Génère automatiquement Dockerfile et compose.yml.",
      desc_en: "Automatically generates Dockerfile and compose.yml.",
      icon: Layers3,
    },
    {
      id: "docs",
      label_fr: "Documentation interactive (Swagger)",
      label_en: "Interactive Documentation (Swagger)",
      desc_fr: "Génère la documentation OpenAPI pour tester en direct.",
      desc_en: "Generates OpenAPI documentation for direct testing.",
      icon: FileJson,
    },
    {
      id: "cors",
      label_fr: "Middleware CORS configuré",
      label_en: "Configured CORS Middleware",
      desc_fr: "Autorise les requêtes provenant de domaines tiers.",
      desc_en: "Allows requests originating from external domains.",
      icon: Cpu,
    },
    {
      id: "rate_limit",
      label_fr: "Limiteur de Débit (Rate Limiter)",
      label_en: "Rate Limiting Middleware",
      desc_fr: "Protège l'API contre les attaques par force brute.",
      desc_en: "Protects the API against brute force attacks.",
      icon: Activity,
    },
    {
      id: "tests",
      label_fr: "Scaffold de Tests Unitaires",
      label_en: "Unit Testing Scaffolding",
      desc_fr: "Configure les fichiers d'exemple PHPUnit ou Pytest.",
      desc_en: "Configures sample PHPUnit or Pytest test cases.",
      icon: TestTube,
    },
  ];

  const fieldTypes = [
    "bigint",
    "string",
    "text",
    "integer",
    "boolean",
    "decimal",
    "date",
    "datetime",
    "foreignId",
    "timestamps",
  ];

  const getTable = (id: number) => tables.find((table) => table.id === id);
  const getField = (tableId: number, fieldId: string) =>
    getTable(tableId)?.fields.find((field) => field.id === fieldId);

  const addTable = () => {
    const id = Date.now();
    const newTable: TableSchema = {
      id,
      name: "new_table",
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      fields: [
        { id: `${id}_id`, name: "id", type: "bigint", primary: true },
        { id: `${id}_timestamps`, name: "timestamps", type: "timestamps" },
      ],
    };
    setTables([...tables, newTable]);
    setSelectedTable(id);
  };

  const removeTable = (id: number) => {
    setTables(tables.filter((table) => table.id !== id));
    setRelations(
      relations.filter(
        (relation) => relation.fromTableId !== id && relation.toTableId !== id,
      ),
    );
    if (selectedTable === id) setSelectedTable(null);
  };

  const updateTableName = (id: number, name: string) => {
    setTables(
      tables.map((table) => (table.id === id ? { ...table, name } : table)),
    );
  };

  const addField = (tableId: number) => {
    const fieldId = `${tableId}_${Date.now()}`;
    setTables(
      tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              fields: [
                ...table.fields,
                { id: fieldId, name: "new_field", type: "string" },
              ],
            }
          : table,
      ),
    );
  };

  const updateField = (
    tableId: number,
    fieldId: string,
    key: keyof Field,
    value: string | boolean,
  ) => {
    setTables(
      tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              fields: table.fields.map((field) =>
                field.id === fieldId ? { ...field, [key]: value } : field,
              ),
            }
          : table,
      ),
    );
  };

  const removeField = (tableId: number, fieldId: string) => {
    setTables(
      tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              fields: table.fields.filter((field) => field.id !== fieldId),
            }
          : table,
      ),
    );
    setRelations(
      relations.filter(
        (relation) =>
          relation.fromFieldId !== fieldId && relation.toFieldId !== fieldId,
      ),
    );
  };

  const handleTableMouseDown = (e: React.MouseEvent, tableId: number) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.stopPropagation();
    const table = getTable(tableId);
    if (!table) return;
    setSelectedTable(tableId);
    setDragging({
      tableId,
      offsetX: e.clientX - table.x * zoom,
      offsetY: e.clientY - table.y * zoom,
    });
  };

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      if (dragging) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === dragging.tableId
              ? {
                  ...t,
                  x: (e.clientX - dragging.offsetX) / zoom,
                  y: (e.clientY - dragging.offsetY) / zoom,
                }
              : t,
          ),
        );
      }

      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setCanvasOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    },
    [dragging, isPanning, panStart, zoom],
  );

  const handleCanvasMouseUp = () => {
    setDragging(null);
    setIsPanning(false);
  };

  const handleFieldConnectStart = (
    e: React.MouseEvent,
    tableId: number,
    fieldId: string,
  ) => {
    e.stopPropagation();
    const table = getTable(tableId);
    const field = getField(tableId, fieldId);
    if (!table || !field) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fromX = (table.x + 260) * zoom;
    const fromY =
      (table.y +
        70 +
        table.fields.findIndex((f) => f.id === fieldId) * 36 +
        18) *
      zoom;
    setDrawingRelation({
      fromTableId: tableId,
      fromFieldId: fieldId,
      fromX,
      fromY,
    });
  };

  const handleFieldConnectEnd = (tableId: number, fieldId: string) => {
    if (!drawingRelation) return;
    if (
      drawingRelation.fromTableId === tableId &&
      drawingRelation.fromFieldId === fieldId
    ) {
      setDrawingRelation(null);
      return;
    }

    const fromField = getField(
      drawingRelation.fromTableId,
      drawingRelation.fromFieldId,
    );
    if (fromField && fromField.type !== "foreignId") {
      updateField(
        drawingRelation.fromTableId,
        drawingRelation.fromFieldId,
        "type",
        "foreignId",
      );
    }

    const newRelation: Relation = {
      id: `rel_${Date.now()}`,
      fromTableId: drawingRelation.fromTableId,
      fromFieldId: drawingRelation.fromFieldId,
      toTableId: tableId,
      toFieldId: fieldId,
      type: "one-to-many",
    };

    setRelations([...relations, newRelation]);
    setDrawingRelation(null);
  };

  const removeRelation = (id: string) => {
    setRelations(relations.filter((relation) => relation.id !== id));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".table-card")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const exportSchema = () => {
    const data = {
      projectName,
      framework,
      database: "MySQL",
      options,
      tables: tables.map(({ id, name, fields }) => ({ id, name, fields })),
      relations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName || "scaffold-schema"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRelationPath = (relation: Relation) => {
    const fromTable = getTable(relation.fromTableId);
    const toTable = getTable(relation.toTableId);
    if (!fromTable || !toTable) return "";

    const fromFieldIndex = fromTable.fields.findIndex(
      (f) => f.id === relation.fromFieldId,
    );
    const toFieldIndex = toTable.fields.findIndex(
      (f) => f.id === relation.toFieldId,
    );

    const x1 = fromTable.x + 260;
    const y1 = fromTable.y + 36 + fromFieldIndex * 36 + 18;
    const x2 = toTable.x;
    const y2 = toTable.y + 36 + toFieldIndex * 36 + 18;

    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
  const resetZoom = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const toggleOption = (optId: string) => {
    setOptions((prev) => ({
      ...prev,
      [optId]: !prev[optId],
    }));
  };

  // Ajouter dans le composant BackendStudio

  const handleCompileScaffold = async () => {
    setLoading(true);
    setErrorMsg("");
    setProject(null);
    setStep(3);

    const sessionToken = localStorage.getItem("session_token");
    const activeOptions = Object.keys(options)
      .filter((key) => options[key])
      .reduce((acc, key) => ({ ...acc, [key]: true }), {});

    // Préparer les tables et relations pour l'API
    const tablesData = tables.map((t) => ({
      name: t.name,
      fields: t.fields.map((f) => ({
        name: f.name,
        type: f.type,
        primary: f.primary || false,
        unique: f.unique || false,
        nullable: f.nullable || false,
      })),
    }));

    const relationsData = relations.map((r) => {
      const fromTable = getTable(r.fromTableId);
      const toTable = getTable(r.toTableId);
      const fromField = getField(r.fromTableId, r.fromFieldId);
      const toField = getField(r.toTableId, r.toFieldId);
      return {
        from_table: fromTable?.name,
        from_field: fromField?.name,
        to_table: toTable?.name,
        to_field: toField?.name,
        type: r.type,
      };
    });

    const promptText = `Génère une API backend complète avec les fonctionnalités suivantes: ${projectName || "scaffold_backend"}`;

    try {
      console.log("🚀 Démarrage de la génération du projet...");
      console.log("Framework:", framework);
      console.log("Tables:", tablesData.length);
      console.log("Relations:", relationsData.length);

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
          prompt: promptText.trim(),
          tables: tablesData,
          relations: relationsData,
          options: activeOptions,
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

  const selectedFile = project?.files.find((f) => f.path === selectedPath);

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]">
        <div className="space-y-7 p-4 md:p-6 lg:p-8">
          {/* Header Panel */}
          <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/60 md:p-8">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge className="mb-4 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-blue-700 hover:bg-blue-50 font-black">
                  <Server className="mr-2 h-3.5 w-3.5" />
                  {t[lang].badge}
                </Badge>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  {step === 1
                    ? t[lang].title
                    : step === 2
                      ? t[lang].schemaTitle
                      : t[lang].ready}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 font-bold md:text-base">
                  {step === 1
                    ? t[lang].subtitle
                    : step === 2
                      ? t[lang].schemaSubtitle
                      : ""}
                </p>
              </div>
              <div className="flex rounded-2xl border border-blue-100 bg-blue-50 p-1 shrink-0">
                <button
                  onClick={() => setLang("fr")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${lang === "fr" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${lang === "en" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                >
                  EN
                </button>
              </div>
            </div>
          </section>

          {/* STEP 1: SCAFFOLD OPTIONS & REQUIREMENTS CONFIGURATION */}
          {step === 1 && (
            <section className="grid gap-6 xl:grid-cols-3">
              {/* Setup Pane */}
              <Card className="border border-blue-100 bg-white shadow-xl shadow-blue-100/50 xl:col-span-2 rounded-[2rem] p-6">
                <CardContent className="space-y-6 p-0">
                  {/* Name input */}
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">
                      {t[lang].projectName}
                    </label>
                    <input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder={t[lang].projectPlaceholder}
                      className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Framework Choices */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-700">
                      {t[lang].chooseFramework}
                    </h3>
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
                              FastAPI
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">
                              Python (Pydantic, SQLAlchemy)
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Options Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-black text-slate-700">
                      {t[lang].chooseOptions}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {scaffoldOptions.map((opt) => {
                        const Icon = opt.icon;
                        const active = options[opt.id];
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleOption(opt.id)}
                            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                              active
                                ? "border-blue-600 bg-blue-50/30"
                                : "border-blue-100 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                                active
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                  : "bg-slate-50 text-slate-500"
                              }`}
                            >
                              <Icon className="h-5.5 w-5.5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-black text-slate-900 leading-snug">
                                {lang === "fr" ? opt.label_fr : opt.label_en}
                              </h4>
                              <p className="text-xxs font-bold text-slate-400 mt-0.5 leading-normal">
                                {lang === "fr" ? opt.desc_fr : opt.desc_en}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    disabled={!projectName.trim()}
                    onClick={() => setStep(2)}
                    className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 font-black text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>{t[lang].next}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Sidebar Info Panel */}
              <Card className="border border-blue-100 bg-white shadow-xl shadow-blue-100/50 rounded-[2rem] p-6">
                <CardContent className="p-0">
                  <h2 className="mb-5 text-xl font-black text-slate-950">
                    Architect Scaffold
                  </h2>
                  <div className="space-y-3">
                    {[
                      ["Migrations DB", GitBranch],
                      ["Modèles ORM", Layers3],
                      ["Controllers CRUD", Code2],
                      ["Relations UML", Link2],
                      ["Docker Scaffolds", Server],
                    ].map(([label, Icon]: any) => (
                      <div
                        key={label}
                        className="flex items-center gap-4 rounded-2xl border border-blue-50 bg-blue-50/40 p-4 font-bold text-slate-800 text-xs"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        {label}
                        <CheckCircle2 className="ml-auto h-5 w-5 text-blue-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* STEP 2: DRAW.IO DATABASE MODEL DESIGNER */}
          {step === 2 && (
            <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <div className="space-y-4">
                {/* Canvas Control Bar */}
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-90"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                      {projectName} ({framework})
                    </p>
                  </div>

                  <div className="ml-auto flex flex-wrap gap-2 items-center">
                    <Button
                      onClick={addTable}
                      size="sm"
                      className="rounded-xl bg-blue-600 font-black text-white hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t[lang].addTable}
                    </Button>
                    <Button
                      onClick={zoomOut}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-blue-100 font-bold"
                    >
                      -
                    </Button>
                    <span className="text-sm font-bold text-slate-600 px-1">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      onClick={zoomIn}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-blue-100 font-bold"
                    >
                      +
                    </Button>
                    <Button
                      onClick={resetZoom}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-blue-100 font-bold text-xs"
                    >
                      {t[lang].resetZoom}
                    </Button>
                    <Button
                      onClick={exportSchema}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-blue-100 bg-white font-black text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t[lang].export}
                    </Button>
                  </div>
                </div>

                {/* Draw Canvas viewport */}
                <div
                  ref={canvasRef}
                  className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] bg-[size:24px_24px] shadow-inner"
                  style={{
                    height: "600px",
                    cursor: isPanning
                      ? "grabbing"
                      : drawingRelation
                        ? "crosshair"
                        : "grab",
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                >
                  <div
                    style={{
                      transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
                      transformOrigin: "0 0",
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {/* SVG relation lines */}
                    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                      {relations.map((relation) => (
                        <g key={relation.id}>
                          <path
                            d={getRelationPath(relation)}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2.5"
                            strokeDasharray="8 6"
                            markerEnd="url(#arrowhead)"
                          />
                        </g>
                      ))}
                      {drawingRelation && (
                        <path
                          d={`M ${drawingRelation.fromX} ${drawingRelation.fromY} L ${mousePos.x} ${mousePos.y}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          strokeDasharray="8 6"
                        />
                      )}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="10"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
                        </marker>
                      </defs>
                    </svg>

                    {/* Table Scopes */}
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className={`table-card absolute rounded-2xl border bg-white shadow-lg transition-shadow ${
                          selectedTable === table.id
                            ? "border-blue-500 shadow-blue-200 ring-4 ring-blue-100"
                            : "border-blue-100 shadow-blue-100/50"
                        }`}
                        style={{
                          left: table.x,
                          top: table.y,
                          width: "260px",
                          cursor: dragging ? "grabbing" : "grab",
                          zIndex: selectedTable === table.id ? 10 : 1,
                        }}
                        onMouseDown={(e) => handleTableMouseDown(e, table.id)}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2 rounded-t-2xl bg-blue-600 px-3 py-2 text-white">
                          <Database className="h-4 w-4 shrink-0" />
                          <input
                            value={table.name}
                            onChange={(e) =>
                              updateTableName(table.id, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-sm font-black outline-none placeholder:text-blue-200"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTable(table.id);
                            }}
                            className="rounded-lg p-1 text-blue-200 hover:bg-red-500 hover:text-white shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Column Fields */}
                        <div className="p-2 space-y-1">
                          {table.fields.map((field) => (
                            <div
                              key={field.id}
                              className={`group flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs transition ${drawingRelation ? "cursor-crosshair hover:bg-amber-50" : "hover:bg-blue-50"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (drawingRelation) {
                                  handleFieldConnectEnd(table.id, field.id);
                                }
                              }}
                            >
                              <div
                                className={`flex h-5 w-7 items-center justify-center rounded-md text-xxs font-black ${
                                  field.primary
                                    ? "bg-amber-100 text-amber-700"
                                    : field.type === "foreignId"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {field.primary
                                  ? "PK"
                                  : field.type === "foreignId"
                                    ? "FK"
                                    : field.type.slice(0, 3).toUpperCase()}
                              </div>
                              <span className="flex-1 font-bold text-slate-700 truncate">
                                {field.name}
                              </span>

                              <button
                                type="button"
                                onClick={(e) =>
                                  handleFieldConnectStart(e, table.id, field.id)
                                }
                                className="ml-1 hidden rounded-md p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-600 group-hover:block shrink-0"
                                title="Connect relation"
                              >
                                <Link2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField({
                                    tableId: table.id,
                                    fieldId: field.id,
                                  });
                                }}
                                className="hidden rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 group-hover:block shrink-0"
                                title="Edit field"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addField(table.id);
                            }}
                            className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-blue-200 py-1.5 text-xxs font-bold text-blue-500 hover:bg-blue-50 mt-1"
                          >
                            <Plus className="h-3 w-3" />
                            <span>{t[lang].addField}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {drawingRelation && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700 shadow-lg flex items-center gap-1">
                      <Link2 className="h-4 w-4" />
                      <span>{t[lang].connectFields}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Canvas Control Panel */}
              <div className="space-y-4">
                {/* Field Editor Panel */}
                {editingField && (
                  <Card className="border border-blue-200 bg-white shadow-xl shadow-blue-100/50 rounded-2xl">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="border border-blue-100 bg-blue-50 text-blue-700 font-bold">
                          <Edit3 className="mr-1 h-3.5 w-3.5" /> Modifier
                        </Badge>
                        <button
                          onClick={() => setEditingField(null)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {(() => {
                        const table = getTable(editingField.tableId);
                        const field = getField(
                          editingField.tableId,
                          editingField.fieldId,
                        );
                        if (!table || !field) return null;

                        return (
                          <div className="space-y-3">
                            <input
                              value={field.name}
                              onChange={(e) =>
                                updateField(
                                  table.id,
                                  field.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="h-10 w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 text-xs font-bold outline-none focus:bg-white"
                            />
                            <select
                              value={field.type}
                              onChange={(e) =>
                                updateField(
                                  table.id,
                                  field.id,
                                  "type",
                                  e.target.value,
                                )
                              }
                              className="h-10 w-full rounded-xl border border-blue-100 bg-blue-50/40 px-3 text-xs font-bold outline-none focus:bg-white"
                            >
                              {fieldTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateField(
                                    table.id,
                                    field.id,
                                    "primary",
                                    !field.primary,
                                  )
                                }
                                className={`rounded-full px-2.5 py-1 text-xxs font-black ${field.primary ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                PK
                              </button>
                              <button
                                onClick={() =>
                                  updateField(
                                    table.id,
                                    field.id,
                                    "unique",
                                    !field.unique,
                                  )
                                }
                                className={`rounded-full px-2.5 py-1 text-xxs font-black ${field.unique ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                UNIQUE
                              </button>
                              <button
                                onClick={() =>
                                  updateField(
                                    table.id,
                                    field.id,
                                    "nullable",
                                    !field.nullable,
                                  )
                                }
                                className={`rounded-full px-2.5 py-1 text-xxs font-black ${field.nullable ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                NULL
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                removeField(table.id, field.id);
                                setEditingField(null);
                              }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Supprimer ce champ</span>
                            </button>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Relations list */}
                <Card className="border border-blue-100 bg-white shadow-xl shadow-blue-100/50 rounded-2xl">
                  <CardContent className="p-4">
                    <Badge className="mb-3 border border-blue-100 bg-blue-50 text-blue-700 font-bold">
                      <Link2 className="mr-2 h-3.5 w-3.5" />
                      {t[lang].relations} ({relations.length})
                    </Badge>
                    <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                      {relations.map((rel) => {
                        const fromTable = getTable(rel.fromTableId);
                        const toTable = getTable(rel.toTableId);
                        const fromField = getField(
                          rel.fromTableId,
                          rel.fromFieldId,
                        );
                        const toField = getField(rel.toTableId, rel.toFieldId);

                        return (
                          <div
                            key={rel.id}
                            className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-2 text-xxs leading-snug"
                          >
                            <div className="flex-1 font-bold text-slate-700">
                              <span>
                                {fromTable?.name}.{fromField?.name}
                              </span>
                              <span className="mx-1 text-blue-400">→</span>
                              <span>
                                {toTable?.name}.{toField?.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeRelation(rel.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 shrink-0 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                      {relations.length === 0 && (
                        <p className="text-center text-xxs font-bold text-slate-400 py-4 leading-normal">
                          Aucune relation liasée. Connectez vos tables FK → PK.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Project Scaffolder Summary Actions */}
                <Card className="border border-blue-100 bg-white shadow-xl shadow-blue-100/50 rounded-2xl">
                  <CardContent className="p-4 space-y-4">
                    <Badge className="border border-blue-100 bg-blue-50 text-blue-700 font-bold">
                      {t[lang].ready}
                    </Badge>
                    <div>
                      <h3 className="text-md font-black text-slate-950 truncate">
                        {projectName}
                      </h3>
                      <p className="text-xxs font-bold text-slate-400 mt-0.5 capitalize">
                        {framework} / MySQL
                      </p>
                    </div>

                    <div className="space-y-2 text-xxs font-bold text-slate-600">
                      <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <span>Tables</span>
                        <span className="text-slate-900">{tables.length}</span>
                      </div>
                      <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <span>Relations</span>
                        <span className="text-slate-900">
                          {relations.length}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCompileScaffold}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>{t[lang].generate}</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full h-10 rounded-2xl border-blue-100 bg-white font-black text-slate-500 hover:bg-slate-50 transition active:scale-95 text-xs"
                    >
                      {t[lang].back}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* SEEDING LOADER SCREEN */}
          {step === 3 && loading && (
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
                  {/* Animated shimmer */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                      animation: "shimmer 1.5s infinite",
                      width: "200%",
                      transform: "translateX(-100%)",
                    }}
                  />
                  {/* Fill */}
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background:
                        "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)",
                    }}
                  />
                </div>

                {/* Steps indicator */}
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
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-500 ${progress >= step.threshold ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-blue-100"}`}
                      />
                      <span
                        className={`text-[9px] font-bold transition-colors duration-300 ${progress >= step.threshold ? "text-blue-600" : "text-slate-300"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info pills */}
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
                  {lang === "fr" ? "~2-5 min" : "~2-5 min"}
                </span>
              </div>
            </div>
          )}

          {/* COMPLETED WORKSPACE SCaffold IDE */}
          {step === 3 && !loading && project && (
            <div className="space-y-6">
              {/* Control Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
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
                    onClick={() => {
                      setProject(null);
                      setStep(1);
                    }}
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

              {/* VS Code styled workbench editor viewport */}
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] rounded-[2rem] border border-blue-100 bg-white shadow-xl shadow-blue-100/50 overflow-hidden min-h-[580px]">
                {/* Explorer Left Panel */}
                <div className="border-b lg:border-b-0 lg:border-r border-slate-200/80 p-4 bg-slate-50/50 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-wider mb-4 pl-1">
                    <Terminal className="h-4 w-4 text-blue-500" />
                    <span>Explorateur</span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
                    <FileTreeNode
                      node={buildTree(project.files)}
                      depth={0}
                      expandedPaths={expandedPaths}
                      togglePath={(prevPath) =>
                        setExpandedPaths((prev) => ({
                          ...prev,
                          [prevPath]: !prev[prevPath],
                        }))
                      }
                      selectedPath={selectedPath}
                      onSelectFile={setSelectedPath}
                    />
                  </div>
                </div>

                {/* Code Editor Right Panel */}
                <div className="flex flex-col bg-slate-950 overflow-hidden h-full">
                  {selectedFile ? (
                    <>
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

                      <div className="flex-1 overflow-auto max-h-[460px] flex font-mono bg-slate-950">
                        <div className="select-none text-right pr-4 pl-3 py-4 text-slate-700 bg-slate-950/40 border-r border-slate-900 shrink-0 text-xs leading-relaxed">
                          {selectedFile.content.split("\n").map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>

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
