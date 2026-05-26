import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
    Braces,
    Copy,
    Globe,
    Loader2,
    Play,
    Search,
    Sparkles,
    Terminal,
    Check,
    Server,
    ShieldCheck,
} from "lucide-react";

type Lang = "fr" | "en";

type MockApi = {
    id: number;
    name: string;
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    description: string;
    response_body: any;
    created_at: string;
};

const API_URL = "http://127.0.0.1:8000";

export default function APIGenerator() {
    const [lang, setLang] = useState<Lang>("fr");
    const [searchQuery, setSearchQuery] = useState("");
    const [apis, setApis] = useState<MockApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedIds, setCopiedIds] = useState<Record<number, boolean>>({});
    
    // Testing state per API Card
    const [testingId, setTestingId] = useState<number | null>(null);
    const [testResponses, setTestResponses] = useState<Record<number, { status: number; data: any; ok: boolean }>>({});
    const [expandedResponses, setExpandedResponses] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const savedLang = localStorage.getItem("codentsika_lang");
        if (savedLang === "fr" || savedLang === "en") setLang(savedLang);
    }, []);

    // Fetch APIs from backend
    const fetchApis = async (search = "") => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/generator/apis?search=${encodeURIComponent(search)}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setApis(data);
            }
        } catch (err) {
            console.error("Failed to fetch generated mock APIs:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load and search debounce
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchApis(searchQuery);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);



    // Live endpoint testing (Sends actual fetch request!)
    const handleTestEndpoint = async (api: MockApi) => {
        setTestingId(api.id);
        const url = `${API_URL}/api/mock/${api.path}`;
        
        try {
            const res = await fetch(url, {
                method: api.method,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json().catch(() => ({}));
            
            setTestResponses(prev => ({
                ...prev,
                [api.id]: {
                    status: res.status,
                    data,
                    ok: res.ok
                }
            }));
        } catch (err: any) {
            setTestResponses(prev => ({
                ...prev,
                [api.id]: {
                    status: 500,
                    data: { error: err.message || "Failed to contact live mock endpoint" },
                    ok: false
                }
            }));
        } finally {
            setTestingId(null);
        }
    };

    // Copy to clipboard helper
    const handleCopyUrl = async (id: number, path: string) => {
        const fullUrl = `${API_URL}/api/mock/${path}`;
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedIds(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedIds(prev => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            // Ignore copy failure
        }
    };

    const t = {
        fr: {
            badge: "Générateur Automatique d'API",
            title: "Simulateur & Générateur de Mock APIs",
            subtitle: "Des APIs mockées professionnelles générées par l'administrateur via l'IA. Utilisez les liens directement dans votre code !",
            searchPlaceholder: "Rechercher par nom, path ou rôle d'API...",
            emptyState: "Aucune API disponible pour le moment. L'administrateur n'a pas encore généré d'APIs.",
            copyUrl: "Copier l'URL",
            copied: "Copié !",
            test: "Tester en Live",
            testing: "Appel en cours...",
            schemaTitle: "Structure de la Réponse JSON",
            testResultTitle: "Console HTTP Live Response",
            adminNotice: "Les APIs sont gérées par l'administrateur",
            methodBadges: {
                GET: "GET",
                POST: "POST",
                PUT: "PUT",
                DELETE: "DELETE"
            }
        },
        en: {
            badge: "Automatic API Generator",
            title: "Mock API Simulator & Generator",
            subtitle: "Professional mock REST APIs generated by the administrator using AI. Call these live URLs directly inside your frontend application code!",
            searchPlaceholder: "Search by name, path or role...",
            emptyState: "No mock APIs available yet. The administrator has not generated any APIs.",
            copyUrl: "Copy URL",
            copied: "Copied!",
            test: "Test Live URL",
            testing: "Calling...",
            schemaTitle: "JSON Response Payload Structure",
            testResultTitle: "HTTP Live Response Console",
            adminNotice: "APIs are managed by the administrator",
            methodBadges: {
                GET: "GET",
                POST: "POST",
                PUT: "PUT",
                DELETE: "DELETE"
            }
        }
    };

    const methodStyle = (method: MockApi["method"]) => {
        if (method === "GET") return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50";
        if (method === "POST") return "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50";
        if (method === "PUT") return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50";
        return "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50";
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_35%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]">
                <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    
                    {/* Premium Header Dashboard */}
                    <section className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/60 md:p-8">
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-3">
                                <Badge className="rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-blue-700 hover:bg-blue-50 font-black tracking-wide text-xs">
                                    <Sparkles className="mr-2 h-3.5 w-3.5 text-blue-600 animate-pulse" />
                                    {t[lang].badge}
                                </Badge>

                                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                                    {t[lang].title}
                                </h1>

                                <p className="max-w-3xl text-sm leading-7 text-slate-500 md:text-base font-medium">
                                    {t[lang].subtitle}
                                </p>
                            </div>

                            <div className="flex shrink-0 rounded-2xl border border-blue-100 bg-blue-50 p-1 self-start lg:self-center">
                                <button
                                    onClick={() => {
                                        setLang("fr");
                                        localStorage.setItem("codentsika_lang", "fr");
                                    }}
                                    className={`rounded-xl px-4 py-2 text-xs font-black transition ${lang === "fr" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                                >
                                    FR
                                </button>
                                <button
                                    onClick={() => {
                                        setLang("en");
                                        localStorage.setItem("codentsika_lang", "en");
                                    }}
                                    className={`rounded-xl px-4 py-2 text-xs font-black transition ${lang === "en" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Controller Action Tools Area */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Interactive Search Console */}
                        <div className="relative w-full md:max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t[lang].searchPlaceholder}
                                className="h-14 w-full rounded-2xl border border-blue-100 bg-white pl-12 pr-4 text-sm font-bold text-slate-700 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                            {loading && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
                            )}
                        </div>

                        {/* Admin notice badge */}
                        <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 shrink-0">
                            <ShieldCheck className="h-4.5 w-4.5 text-slate-400" />
                            <span className="text-xs font-bold">{t[lang].adminNotice}</span>
                        </div>
                    </div>

                    {/* Dynamic APIs grid display */}
                    <div className="space-y-6">
                        {apis.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-blue-50/50 shadow-md">
                                <Server className="h-12 w-12 mx-auto text-blue-300 animate-pulse mb-4" />
                                <p className="text-slate-400 font-black text-sm max-w-sm mx-auto leading-relaxed">
                                    {t[lang].emptyState}
                                </p>
                                <p className="text-slate-300 text-xs mt-3 font-medium">
                                    {t[lang].adminNotice}
                                </p>
                            </div>
                        ) : (
                            apis.map((api) => {
                                const isCopied = copiedIds[api.id] || false;
                                const isTesting = testingId === api.id;
                                const testResponse = testResponses[api.id];
                                const isExpanded = expandedResponses[api.id] || false;

                                return (
                                    <Card key={api.id} className="border border-blue-50 bg-white shadow-lg shadow-blue-100/30 overflow-hidden rounded-[2rem] hover:shadow-xl transition duration-300">
                                        <CardContent className="p-6 md:p-8 space-y-6">
                                            
                                            {/* Top info header section */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={`rounded-xl border px-3 py-1 font-black ${methodStyle(api.method)}`}>
                                                            {t[lang].methodBadges[api.method]}
                                                        </Badge>
                                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                                            {api.name}
                                                        </h2>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-4xl">
                                                        {api.description}
                                                    </p>
                                                </div>

                                                {/* Test Trigger Call Button */}
                                                <Button
                                                    onClick={() => handleTestEndpoint(api)}
                                                    disabled={isTesting}
                                                    className="h-11 rounded-xl bg-emerald-500 font-black text-white hover:bg-emerald-600 transition flex items-center gap-2 px-4 shadow-md shadow-emerald-100 shrink-0 self-start md:self-center"
                                                >
                                                    {isTesting ? (
                                                        <>
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            <span className="text-xs">{t[lang].testing}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-3.5 w-3.5 fill-current" />
                                                            <span className="text-xs">{t[lang].test}</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* URL Endpoint path clipboard display */}
                                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 rounded-2xl border border-blue-50/50 bg-blue-50/20 p-2.5">
                                                <div className="flex items-center gap-2.5 px-3 min-w-0 flex-1">
                                                    <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                                                    <span className="font-mono text-xs font-black text-blue-800 truncate">
                                                        {API_URL}/api/mock/{api.path}
                                                    </span>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyUrl(api.id, api.path)}
                                                    className="h-11 px-4 rounded-xl border border-blue-100 bg-white hover:bg-slate-50 font-black text-xs text-blue-600 shadow-sm flex items-center justify-center gap-1.5 transition shrink-0"
                                                >
                                                    {isCopied ? (
                                                        <>
                                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                            <span className="text-emerald-500 font-black">{t[lang].copied}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3.5 w-3.5 text-blue-600" />
                                                            <span>{t[lang].copyUrl}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Two Column Layout: JSON Schema Schema and Live Test Output Console */}
                                            <div className="grid gap-6 md:grid-cols-2">
                                                
                                                {/* Left side: Response body schema block */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Braces className="h-3.5 w-3.5 text-slate-400" />
                                                            {t[lang].schemaTitle}
                                                        </span>
                                                        <button 
                                                            onClick={() => setExpandedResponses(prev => ({ ...prev, [api.id]: !isExpanded }))}
                                                            className="text-[10px] font-black text-blue-600 hover:underline hover:text-blue-700"
                                                        >
                                                            {isExpanded ? "Collapse" : "Expand"}
                                                        </button>
                                                    </div>

                                                    <pre className={`overflow-x-auto p-4 rounded-2xl font-mono text-[11px] leading-relaxed bg-[#0b0f19] text-slate-200 border border-slate-700 shadow-inner transition-all duration-300 ${
                                                        isExpanded ? "max-h-[500px]" : "max-h-[160px]"
                                                    }`}>
                                                        <code>{JSON.stringify(api.response_body, null, 2)}</code>
                                                    </pre>
                                                </div>

                                                {/* Right side: Live try out test console response */}
                                                <div className="space-y-3">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Terminal className="h-3.5 w-3.5 text-slate-400" />
                                                        {t[lang].testResultTitle}
                                                    </span>

                                                    {testResponse ? (
                                                        <div className="rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden shadow-inner flex flex-col h-[160px]">
                                                            {/* Terminal Console Header */}
                                                            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2 select-none">
                                                                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                                                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                                                                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                                                <span className="ml-auto text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
                                                                    Status: 
                                                                    <span className={testResponse.ok ? "text-emerald-400" : "text-rose-400"}>
                                                                        {testResponse.status}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Terminal content */}
                                                            <pre className="overflow-auto p-4 flex-1 font-mono text-[11px] leading-relaxed text-emerald-300 bg-[#070b13]">
                                                                <code>{JSON.stringify(testResponse.data, null, 2)}</code>
                                                            </pre>
                                                        </div>
                                                    ) : (
                                                        <div className="h-[160px] rounded-2xl border border-dashed border-blue-200 bg-blue-50/10 flex flex-col items-center justify-center text-center p-6">
                                                            <Play className="h-6 w-6 text-slate-300 mb-2 fill-current" />
                                                            <p className="text-[10px] font-black text-slate-400 leading-normal max-w-[200px]">
                                                                Click "Tester en Live" to execute a real dynamic network request!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}