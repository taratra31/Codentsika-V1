import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    AlertCircle,
    LogOut,
    Users,
    Activity,
    UserCheck,
    TrendingUp,
    Search,
    Trash2,
    Edit2,
    LayoutDashboard,
    Shield,
    CreditCard,
    Clock,
    Menu,
    X,
    Sparkles,
    Braces,
    Server,
    Loader2,
    Check,
    Globe,
    Copy,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    created_at: string;
    last_login: string;
}

interface Session {
    id: number;
    user_id: number;
    email: string;
    name: string;
    ip_address: string;
    created_at: string;
    expires_at: string;
}

interface Stats {
    total_users: number;
    active_sessions: number;
    roles: Array<{ role: string; count: number }>;
    recent_registrations: number;
    last_updated: string;
}

interface Subscription {
    id: number;
    user_name: string;
    email: string;
    plan: string;
    status: "active" | "expired" | "pending" | "cancelled";
    amount: string;
    started_at: string;
    expires_at: string;
}

type ActivePage = "dashboard" | "users" | "sessions" | "subscriptions" | "apis";

interface MockApi {
    id: number;
    name: string;
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    description: string;
    response_body: any;
    created_at: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState<ActivePage>("dashboard");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<number | null>(null);
    const [newRole, setNewRole] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Mock APIs state
    const [mockApis, setMockApis] = useState<MockApi[]>([]);
    const [generating, setGenerating] = useState(false);
    const [triggerMessage, setTriggerMessage] = useState<string | null>(null);
    const [copiedApiIds, setCopiedApiIds] = useState<Record<number, boolean>>({});

    const navigate = useNavigate();
    const token = localStorage.getItem("admin_session_token");

    useEffect(() => {
        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }
        loadData();
        fetchMockApis();
    }, [token]);

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const statsRes = await fetch(`${API_URL}/admin/dashboard/stats`, { headers });
            if (statsRes.ok) setStats(await statsRes.json());

            const usersRes = await fetch(`${API_URL}/admin/users?limit=50`, { headers });
            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.users || []);
            }

            const sessionsRes = await fetch(`${API_URL}/admin/sessions`, { headers });
            if (sessionsRes.ok) {
                const data = await sessionsRes.json();
                setSessions(data.sessions || []);
            }

            const subscriptionsRes = await fetch(`${API_URL}/admin/subscriptions`, { headers });

            if (subscriptionsRes.ok) {
                const data = await subscriptionsRes.json();
                setSubscriptions(data.subscriptions || []);
            } else {
                setSubscriptions([
                    {
                        id: 1,
                        user_name: "Demo User",
                        email: "demo@example.com",
                        plan: "Premium",
                        status: "active",
                        amount: "15€ / mois",
                        started_at: new Date().toISOString(),
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                ]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // ── Mock APIs management ──
    const fetchMockApis = async (search = "") => {
        try {
            const res = await fetch(`${API_URL}/api/generator/apis?search=${encodeURIComponent(search)}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setMockApis(data);
            }
        } catch (err) {
            console.error("Failed to fetch mock APIs:", err);
        }
    };

    const handleTriggerGeneration = async () => {
        setGenerating(true);
        setTriggerMessage(null);
        try {
            const res = await fetch(`${API_URL}/api/generator/trigger`, {
                method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
                setTriggerMessage("✨ 5 nouvelles APIs mockées générées avec succès par Codentsika AI !");
                fetchMockApis(searchTerm);
                setTimeout(() => setTriggerMessage(null), 5000);
            } else {
                setTriggerMessage(`Erreur: ${data.detail || "Échec de la génération"}`);
            }
        } catch (err) {
            setTriggerMessage("Impossible de se connecter au serveur backend.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteApi = async (apiId: number) => {
        if (!confirm("Supprimer cette API mockée ?")) return;
        try {
            const res = await fetch(`${API_URL}/api/generator/apis/${apiId}`, {
                method: "DELETE",
                headers,
            });
            if (res.ok) {
                setMockApis(mockApis.filter((a) => a.id !== apiId));
            }
        } catch (err) {
            console.error("Failed to delete mock API:", err);
        }
    };

    const handleCopyApiUrl = async (id: number, path: string) => {
        const fullUrl = `${API_URL}/api/mock/${path}`;
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedApiIds((prev) => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedApiIds((prev) => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            // Ignore copy failure
        }
    };

    const apiMethodStyle = (method: string) => {
        if (method === "GET") return "bg-green-500/15 text-green-400 border-green-500/20";
        if (method === "POST") return "bg-blue-500/15 text-blue-400 border-blue-500/20";
        if (method === "PUT") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
        return "bg-red-500/15 text-red-400 border-red-500/20";
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/admin/logout`, {
                method: "POST",
                headers,
            });
        } catch (err) {
            console.error("Logout error:", err);
        }

        localStorage.removeItem("admin_session_token");
        navigate("/admin/login", { replace: true });
    };

    const handleUpdateUserRole = async (userId: number, role: string) => {
        try {
            const response = await fetch(
                `${API_URL}/admin/users/${userId}/role?new_role=${encodeURIComponent(role)}`,
                {
                    method: "PUT",
                    headers,
                }
            );

            if (!response.ok) throw new Error("Failed to update role");

            setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
            setEditingUser(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update role");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Supprimer cet utilisateur ?")) return;

        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: "DELETE",
                headers,
            });

            if (!response.ok) throw new Error("Failed to delete user");

            setUsers(users.filter((u) => u.id !== userId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete user");
        }
    };

    const handleRevokeSession = async (sessionId: number) => {
        if (!confirm("Révoquer cette session ?")) return;

        try {
            const response = await fetch(`${API_URL}/admin/sessions/${sessionId}`, {
                method: "DELETE",
                headers,
            });

            if (!response.ok) throw new Error("Failed to revoke session");

            setSessions(sessions.filter((s) => s.id !== sessionId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to revoke session");
        }
    };

    const filteredUsers = users.filter((u) =>
        `${u.email} ${u.name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSessions = sessions.filter((s) =>
        `${s.email} ${s.name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSubscriptions = subscriptions.filter((s) =>
        `${s.email} ${s.user_name} ${s.plan} ${s.status}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "users", label: "Utilisateurs", icon: Users },
        { id: "sessions", label: "Sessions", icon: Activity },
        { id: "subscriptions", label: "Abonnements", icon: CreditCard },
        { id: "apis", label: "Mock APIs", icon: Braces },
    ] as const;

    const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <div>
                        <h1 className="text-xl font-bold">Codentsika</h1>
                        <p className="text-xs text-slate-400">Admin Panel</p>
                    </div>

                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActivePage(item.id);
                                    setSearchTerm("");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
                    <Button
                        onClick={handleLogout}
                        className="w-full bg-slate-800 hover:bg-red-600 text-white flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </Button>
                </div>
            </aside>

            <div className="lg:pl-72">
                <header className="h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
                    <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div>
                                <h2 className="text-lg font-semibold">
                                    {menuItems.find((m) => m.id === activePage)?.label}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Gestion administrative de la plateforme
                                </p>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
                            <Shield className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-slate-300">Admin connecté</span>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-20 text-center text-slate-400">Chargement...</div>
                    ) : (
                        <>
                            {activePage === "dashboard" && stats && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                        <StatCard title="Total Users" value={stats.total_users} icon={Users} />
                                        <StatCard title="Sessions actives" value={stats.active_sessions} icon={Activity} />
                                        <StatCard title="Nouveaux inscrits" value={stats.recent_registrations} icon={UserCheck} />
                                        <StatCard title="Abonnements actifs" value={activeSubscriptions} icon={CreditCard} />
                                        <StatCard title="Mock APIs" value={mockApis.length} icon={Braces} />
                                    </div>

                                    <Card className="bg-slate-900 border-slate-800">
                                        <CardHeader>
                                            <CardTitle className="text-white">Résumé plateforme</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InfoBox label="Admins" value={stats.roles.find((r) => r.role === "admin")?.count || 0} />
                                            <InfoBox label="Users" value={stats.roles.find((r) => r.role === "user")?.count || 0} />
                                            <InfoBox label="Dernière mise à jour" value={new Date(stats.last_updated).toLocaleString()} />
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activePage === "users" && (
                                <PageCard
                                    title="Gestion des utilisateurs"
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    placeholder="Rechercher un utilisateur..."
                                >
                                    <Table>
                                        <thead className="bg-slate-800">
                                            <tr>
                                                <Th>Email</Th>
                                                <Th>Nom</Th>
                                                <Th>Rôle</Th>
                                                <Th>Inscription</Th>
                                                <Th align="right">Actions</Th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-800">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-800/50">
                                                    <Td>{user.email}</Td>
                                                    <Td>{user.name || "-"}</Td>
                                                    <Td>
                                                        {editingUser === user.id ? (
                                                            <select
                                                                value={newRole}
                                                                onChange={(e) => setNewRole(e.target.value)}
                                                                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        ) : (
                                                            <Badge type={user.role === "admin" ? "danger" : "info"}>
                                                                {user.role}
                                                            </Badge>
                                                        )}
                                                    </Td>
                                                    <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                                                    <Td align="right">
                                                        {editingUser === user.id ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    onClick={() => handleUpdateUserRole(user.id, newRole)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    onClick={() => setEditingUser(null)}
                                                                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    onClick={() => {
                                                                        setEditingUser(user.id);
                                                                        setNewRole(user.role);
                                                                    }}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                                                >
                                                                    <Edit2 className="w-3 h-3 mr-1" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                                                >
                                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </PageCard>
                            )}

                            {activePage === "sessions" && (
                                <PageCard
                                    title="Sessions actives"
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    placeholder="Rechercher une session..."
                                >
                                    <Table>
                                        <thead className="bg-slate-800">
                                            <tr>
                                                <Th>Utilisateur</Th>
                                                <Th>Adresse IP</Th>
                                                <Th>Créée</Th>
                                                <Th>Expiration</Th>
                                                <Th align="right">Action</Th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-800">
                                            {filteredSessions.map((session) => (
                                                <tr key={session.id} className="hover:bg-slate-800/50">
                                                    <Td>
                                                        <div>{session.email}</div>
                                                        <div className="text-xs text-slate-500">{session.name}</div>
                                                    </Td>
                                                    <Td>{session.ip_address || "-"}</Td>
                                                    <Td>{new Date(session.created_at).toLocaleString()}</Td>
                                                    <Td>{new Date(session.expires_at).toLocaleString()}</Td>
                                                    <Td align="right">
                                                        <Button
                                                            onClick={() => handleRevokeSession(session.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Revoke
                                                        </Button>
                                                    </Td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </PageCard>
                            )}

                            {activePage === "subscriptions" && (
                                <PageCard
                                    title="Abonnements"
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    placeholder="Rechercher un abonnement..."
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <InfoBox label="Total abonnements" value={subscriptions.length} />
                                        <InfoBox label="Actifs" value={subscriptions.filter((s) => s.status === "active").length} />
                                        <InfoBox label="Expirés" value={subscriptions.filter((s) => s.status === "expired").length} />
                                    </div>

                                    <Table>
                                        <thead className="bg-slate-800">
                                            <tr>
                                                <Th>Client</Th>
                                                <Th>Plan</Th>
                                                <Th>Montant</Th>
                                                <Th>Statut</Th>
                                                <Th>Début</Th>
                                                <Th>Expiration</Th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-800">
                                            {filteredSubscriptions.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-slate-800/50">
                                                    <Td>
                                                        <div>{sub.user_name}</div>
                                                        <div className="text-xs text-slate-500">{sub.email}</div>
                                                    </Td>
                                                    <Td>{sub.plan}</Td>
                                                    <Td>{sub.amount}</Td>
                                                    <Td>
                                                        <Badge
                                                            type={
                                                                sub.status === "active"
                                                                    ? "success"
                                                                    : sub.status === "expired"
                                                                        ? "danger"
                                                                        : "warning"
                                                            }
                                                        >
                                                            {sub.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{new Date(sub.started_at).toLocaleDateString()}</Td>
                                                    <Td>{new Date(sub.expires_at).toLocaleDateString()}</Td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </PageCard>
                            )}

                            {activePage === "apis" && (
                                <div className="space-y-6">
                                    {/* Generate button + search */}
                                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                                        <Button
                                            onClick={handleTriggerGeneration}
                                            disabled={generating}
                                            className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {generating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Génération en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Générer 5 APIs avec l'IA
                                                </>
                                            )}
                                        </Button>

                                        <div className="relative w-full md:w-80">
                                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher une API..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    fetchMockApis(e.target.value);
                                                }}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Trigger message */}
                                    {triggerMessage && (
                                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                                            triggerMessage.includes("Erreur") || triggerMessage.includes("Impossible")
                                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                                : "bg-green-500/10 border-green-500/20 text-green-400"
                                        }`}>
                                            {triggerMessage.includes("Erreur") || triggerMessage.includes("Impossible") ? (
                                                <AlertCircle className="h-5 w-5 shrink-0" />
                                            ) : (
                                                <Check className="h-5 w-5 shrink-0" />
                                            )}
                                            <span className="text-sm font-medium">{triggerMessage}</span>
                                        </div>
                                    )}

                                    {/* Stats row */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <InfoBox label="Total APIs" value={mockApis.length} />
                                        <InfoBox label="GET" value={mockApis.filter((a) => a.method === "GET").length} />
                                        <InfoBox label="POST" value={mockApis.filter((a) => a.method === "POST").length} />
                                        <InfoBox label="PUT / DELETE" value={mockApis.filter((a) => a.method === "PUT" || a.method === "DELETE").length} />
                                    </div>

                                    {/* APIs list */}
                                    {mockApis.length === 0 ? (
                                        <div className="py-16 text-center">
                                            <Server className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                                            <p className="text-slate-400 text-sm">Aucune API mockée. Cliquez sur le bouton ci-dessus pour en générer.</p>
                                        </div>
                                    ) : (
                                        <Card className="bg-slate-900 border-slate-800">
                                            <CardContent className="p-0">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full min-w-[700px]">
                                                        <thead className="bg-slate-800">
                                                            <tr>
                                                                <Th>Méthode</Th>
                                                                <Th>Nom</Th>
                                                                <Th>Path</Th>
                                                                <Th>Créée le</Th>
                                                                <Th align="right">Actions</Th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-800">
                                                            {mockApis.map((api) => {
                                                                const isCopied = copiedApiIds[api.id] || false;
                                                                return (
                                                                    <tr key={api.id} className="hover:bg-slate-800/50">
                                                                        <Td>
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${apiMethodStyle(api.method)}`}>
                                                                                {api.method}
                                                                            </span>
                                                                        </Td>
                                                                        <Td>
                                                                            <div className="font-medium text-white">{api.name}</div>
                                                                            <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{api.description}</div>
                                                                        </Td>
                                                                        <Td>
                                                                            <code className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                                                                                /api/mock/{api.path}
                                                                            </code>
                                                                        </Td>
                                                                        <Td>{new Date(api.created_at).toLocaleDateString()}</Td>
                                                                        <Td align="right">
                                                                            <div className="flex justify-end gap-2">
                                                                                <button
                                                                                    onClick={() => handleCopyApiUrl(api.id, api.path)}
                                                                                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                                                                    title="Copier l'URL"
                                                                                >
                                                                                    {isCopied ? (
                                                                                        <Check className="w-4 h-4 text-green-400" />
                                                                                    ) : (
                                                                                        <Copy className="w-4 h-4" />
                                                                                    )}
                                                                                </button>
                                                                                <Button
                                                                                    onClick={() => handleDeleteApi(api.id)}
                                                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                                                                >
                                                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                                                    Supprimer
                                                                                </Button>
                                                                            </div>
                                                                        </Td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: any) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
                <Icon className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-white">{value}</div>
            </CardContent>
        </Card>
    );
}

function InfoBox({ label, value }: { label: string; value: any }) {
    return (
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
    );
}

function PageCard({ title, children, searchTerm, setSearchTerm, placeholder }: any) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle className="text-white">{title}</CardTitle>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>{children}</CardContent>
        </Card>
    );
}

function Table({ children }: { children: React.ReactNode }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[800px]">{children}</table>
        </div>
    );
}

function Th({ children, align = "left" }: any) {
    return (
        <th
            className={`px-6 py-4 text-${align} text-xs uppercase tracking-wider font-semibold text-slate-400`}
        >
            {children}
        </th>
    );
}

function Td({ children, align = "left" }: any) {
    return <td className={`px-6 py-4 text-${align} text-sm text-slate-300`}>{children}</td>;
}

function Badge({ children, type }: any) {
    const styles: Record<string, string> = {
        success: "bg-green-500/15 text-green-400 border-green-500/20",
        danger: "bg-red-500/15 text-red-400 border-red-500/20",
        warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
        info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[type] || styles.info}`}>
            {children}
        </span>
    );
}