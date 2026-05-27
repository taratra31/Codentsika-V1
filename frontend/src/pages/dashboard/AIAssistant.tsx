import { FormEvent, useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Bot,
  Code2,
  Copy,
  Database,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  Wand2,
  Image as ImageIcon,
  Paperclip,
  Square,
  X,
  History,
  Play,
} from "lucide-react";

type Lang = "fr" | "en";

type Message = {
  role: "user" | "assistant";
  content: string;
  image_url?: string;
};

type Conversation = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

const API_URL = "https://codentsika-v1.onrender.com";

type ChatBlock =
  | { type: "text"; content: string }
  | { type: "code"; language: string; content: string };

const parseMessageBlocks = (text: string): ChatBlock[] => {
  const blocks: ChatBlock[] = [];
  const regex = /```(\w*)\n([\s\S]*?)(?:```|$)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (
      textBefore.trim() ||
      (!textBefore.trim() && lastIndex === 0 && textBefore.length > 0)
    ) {
      blocks.push({ type: "text", content: textBefore });
    }

    blocks.push({
      type: "code",
      language: match[1] || "code",
      content: match[2].trim(),
    });

    lastIndex = regex.lastIndex;
  }

  const textRemaining = text.substring(lastIndex);
  if (textRemaining.trim() || blocks.length === 0) {
    blocks.push({ type: "text", content: textRemaining });
  }

  return blocks;
};

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Ignore copy fails cleanly
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg shrink-0">
      {/* Code Block Header */}
      <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 text-xs font-black text-slate-400 select-none">
        <span className="uppercase tracking-wider text-slate-500 font-mono">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition font-sans text-xs"
        >
          {copied ? (
            <>
              <span className="text-emerald-400 font-black animate-pulse">
                Copié !
              </span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      {/* Preformatted Code Content */}
      <pre className="overflow-x-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#0b0f19]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RenderMessageContent({ content }: { content: string }) {
  const blocks = parseMessageBlocks(content);

  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return (
            <CodeBlock key={i} language={block.language} code={block.content} />
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap text-sm leading-7">
            {block.content}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAssistant() {
  const [lang, setLang] = useState<Lang>("fr");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isDisabled = loading || generating;

  // Conversation history and management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Abort controller for streaming cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Je suis ton assistant IA Codentsika. Je peux t’aider à générer du code FastAPI, créer des APIs, corriger des erreurs et améliorer ton architecture backend.",
    },
  ]);

  // Translations
  const t = {
    fr: {
      newChat: "Nouveau chat",
      title: "Assistant IA",
      subtitle: "Laravel • MySQL • API • Debug",
      placeholder: "Écris ton message ici...",
      send: "Envoyer",
      suggestions: "Suggestions",
      emptyTitle: "Comment puis-je t’aider ?",
      copy: "Copier",
      thinking: "Codentsika réfléchit...",
      history: "Historique",
      noHistory: "Aucun chat récent",
      stop: "Arrêter",
    },
    en: {
      newChat: "New chat",
      title: "AI Assistant",
      subtitle: "Laravel • MySQL • API • Debug",
      placeholder: "Write your message here...",
      send: "Send",
      suggestions: "Suggestions",
      emptyTitle: "How can I help you?",
      copy: "Copy",
      thinking: "Codentsika is thinking...",
      history: "History",
      noHistory: "No recent chats",
      stop: "Stop",
    },
  };

  const suggestions = [
    {
      icon: Code2,
      text:
        lang === "fr"
          ? "Génère un CRUD Laravel complet"
          : "Generate a complete Laravel CRUD",
      prompt:
        lang === "fr"
          ? "Génère-moi un CRUD Laravel complet avec migration, model, controller et routes API."
          : "Generate a complete Laravel CRUD with migration, model, controller and API routes.",
    },
    {
      icon: Database,
      text:
        lang === "fr"
          ? "Créer une migration MySQL"
          : "Create a MySQL migration",
      prompt:
        lang === "fr"
          ? "Crée une migration Laravel MySQL avec relations foreignId."
          : "Create a Laravel MySQL migration with foreignId relations.",
    },
    {
      icon: Wand2,
      text:
        lang === "fr" ? "Corriger une erreur Laravel" : "Fix a Laravel error",
      prompt:
        lang === "fr"
          ? "Aide-moi à corriger cette erreur Laravel étape par étape."
          : "Help me fix this Laravel error step by step.",
    },
  ];

  // Load language preference and conversations on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("codentsika_lang");
    if (savedLang === "fr" || savedLang === "en") setLang(savedLang);
    fetchConversations();
  }, []);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Fetch conversation list from backend
  const fetchConversations = async () => {
    const sessionToken = localStorage.getItem("session_token");
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          "X-Session-Token": sessionToken || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (err) {
      // Ignore fetch errors cleanly
    }
  };

  // Load specific conversation's messages
  const loadConversation = async (conversationId: number) => {
    const sessionToken = localStorage.getItem("session_token");
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}/messages`,
        {
          headers: {
            "X-Session-Token": sessionToken || "",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.length > 0
            ? data
            : [
                {
                  role: "assistant",
                  content:
                    lang === "fr"
                      ? "Discussion chargée 👋 Que puis-je faire pour toi maintenant ?"
                      : "Chat loaded 👋 What can I do for you now?",
                },
              ],
        );
        setActiveConversationId(conversationId);
      }
    } catch (err) {
      // Ignore load errors cleanly
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation from DB
  const handleDeleteConversation = async (
    e: React.MouseEvent,
    conversationId: number,
  ) => {
    e.stopPropagation(); // Prevents clicking the conversation item
    const sessionToken = localStorage.getItem("session_token");
    if (
      !confirm(
        lang === "fr"
          ? "Supprimer cette discussion ?"
          : "Delete this conversation?",
      )
    )
      return;

    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            "X-Session-Token": sessionToken || "",
          },
        },
      );
      if (response.ok) {
        fetchConversations();
        if (activeConversationId === conversationId) {
          newChat();
        }
      }
    } catch (err) {
      // Ignore delete errors cleanly
    }
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Stop current streaming generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setGenerating(false);
      setShowContinueButton(true);
    }
  };

  const handleContinueGeneration = async () => {
    setShowContinueButton(false);
    setLoading(true);
    setGenerating(true);

    const continuationInstruction: Message = {
      role: "user",
      content:
        lang === "fr"
          ? "Continue ton message précédent à partir de là où tu t'es arrêté (sans répéter ce que tu as déjà écrit)."
          : "Continue writing exactly where you left off (without repeating what you already wrote).",
    };

    const updatedMessages = [...messages, continuationInstruction];

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const sessionToken = localStorage.getItem("session_token");

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        signal: controller.signal,
        body: JSON.stringify({
          conversation_id: activeConversationId,
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            image_url: msg.image_url,
          })),
        }),
      });

      if (response.ok) {
        // Initialize an empty assistant message in state
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let currentText = "";
        let conversationIdParsed = false;

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              let textToProcess = chunk;

              if (
                !conversationIdParsed &&
                textToProcess.includes("[[CONVERSATION_ID:")
              ) {
                const match = textToProcess.match(
                  /\[\[CONVERSATION_ID:(\d+)\]\]/,
                );
                if (match) {
                  const convId = parseInt(match[1], 10);
                  setActiveConversationId(convId);
                  fetchConversations();
                  conversationIdParsed = true;
                  textToProcess = textToProcess.replace(
                    /\[\[CONVERSATION_ID:\d+\]\]/,
                    "",
                  );
                }
              }

              currentText += textToProcess;

              setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0) {
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: currentText,
                  };
                }
                return updated;
              });
            }
          } catch (readError: any) {
            // Aborts cleanly
          }
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              lang === "fr"
                ? `Désolé, une erreur s'est produite : ${errData.detail || "Impossible de contacter l'IA"}`
                : `Sorry, an error occurred: ${errData.detail || "Unable to contact AI"}`,
          },
        ]);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              lang === "fr"
                ? "Impossible de contacter le serveur backend. Assurez-vous qu'il est en cours d'exécution."
                : "Unable to contact the backend server. Make sure it is running.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      setGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if ((!prompt.trim() && !uploadedImage) || loading || generating) return;

    const userMessage: Message = {
      role: "user",
      content: prompt.trim(),
      image_url: uploadedImage || undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setPrompt("");
    setUploadedImage(null); // Clear image preview immediately
    setShowContinueButton(false);
    setLoading(true);
    setGenerating(true);

    const sessionToken = localStorage.getItem("session_token");

    // Instantiate AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        signal: controller.signal,
        body: JSON.stringify({
          conversation_id: activeConversationId,
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            image_url: msg.image_url,
          })),
        }),
      });

      if (response.ok) {
        // Initialize an empty assistant message in state
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let currentText = "";
        let conversationIdParsed = false;

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              let textToProcess = chunk;

              // Extract the [[CONVERSATION_ID:X]] metadata token if present
              if (
                !conversationIdParsed &&
                textToProcess.includes("[[CONVERSATION_ID:")
              ) {
                const match = textToProcess.match(
                  /\[\[CONVERSATION_ID:(\d+)\]\]/,
                );
                if (match) {
                  const convId = parseInt(match[1], 10);
                  setActiveConversationId(convId);
                  fetchConversations(); // Refresh list to show new conversation
                  conversationIdParsed = true;

                  // Remove the token from the visible text
                  textToProcess = textToProcess.replace(
                    /\[\[CONVERSATION_ID:\d+\]\]/,
                    "",
                  );
                }
              }

              currentText += textToProcess;

              // Update only the last assistant message in state with cumulative text
              setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0) {
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: currentText,
                  };
                }
                return updated;
              });
            }
          } catch (readError: any) {
            // Ignore stream reading issues/aborts cleanly
          }
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              lang === "fr"
                ? `Désolé, une erreur s'est produite : ${errData.detail || "Impossible de contacter l'IA"}`
                : `Sorry, an error occurred: ${errData.detail || "Unable to contact AI"}`,
          },
        ]);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              lang === "fr"
                ? "Impossible de contacter le serveur backend. Assurez-vous qu'il est en cours d'exécution."
                : "Unable to contact the backend server. Make sure it is running.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      setGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const newChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          lang === "fr"
            ? "Nouveau chat lancé 👋 Que veux-tu créer aujourd’hui ?"
            : "New chat started 👋 What would you like to build today?",
      },
    ]);
    setActiveConversationId(null);
  };

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  return (
    <DashboardLayout>
      {/* L'outer div est fixé en taille exacte et empêche tout overflow global */}
      <div className="h-[calc(100vh-7rem)] lg:h-[calc(100vh-8rem)] overflow-hidden bg-[#f7fbff] rounded-3xl border border-blue-50/50 shadow-sm">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[290px_1fr]">
          {/* Sidebar de gauche avec historique MySQL */}
          <aside className="hidden border-r border-blue-100 bg-white/90 p-4 shadow-sm lg:flex lg:flex-col h-full overflow-hidden">
            <Button
              onClick={newChat}
              disabled={isDisabled}
              className="h-12 w-full rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t[lang].newChat}
            </Button>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <p className="mb-3 px-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <History className="h-3.5 w-3.5" />
                {t[lang].history}
              </p>

              <div className="space-y-1.5">
                {conversations.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 px-2 py-4">
                    {t[lang].noHistory}
                  </p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      disabled={isDisabled}
                      className={`group flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeConversationId === conv.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 truncate">
                        <MessageSquare className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-500" />
                        <span className="truncate">{conv.title}</span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        disabled={isDisabled}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-600 text-slate-400 p-1 rounded-lg hover:bg-slate-100 transition shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-auto rounded-3xl border border-blue-100 bg-blue-50/50 p-4 shrink-0">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-black text-slate-950">Codentsika AI</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Assistant optimisé pour Laravel, MySQL, API REST, images et
                conversations.
              </p>
            </div>
          </aside>

          {/* Main section du Chat */}
          <main className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-blue-100 bg-white/90 px-4 py-4 backdrop-blur md:px-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-950">
                    {t[lang].title}
                  </h1>
                  <p className="text-xs font-bold text-slate-400">
                    {t[lang].subtitle}
                  </p>
                </div>
              </div>

              <div className="flex rounded-2xl border border-blue-100 bg-blue-50 p-1">
                <button
                  onClick={() => {
                    setLang("fr");
                    localStorage.setItem("codentsika_lang", "fr");
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black ${
                    lang === "fr"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => {
                    setLang("en");
                    localStorage.setItem("codentsika_lang", "en");
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black ${
                    lang === "en"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  EN
                </button>
              </div>
            </header>

            {/* Zone des Messages - Seule cette partie est scrollable */}
            <section className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-slate-50/50">
              <div className="mx-auto max-w-4xl space-y-6">
                {messages.length <= 1 && (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-xl shadow-blue-200 animate-bounce">
                      <Sparkles className="h-7 w-7" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-950">
                      {t[lang].emptyTitle}
                    </h2>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      {suggestions.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.text}
                            onClick={() => setPrompt(item.prompt)}
                            disabled={isDisabled}
                            className="rounded-3xl border border-blue-100 bg-white p-4 text-left shadow-lg shadow-blue-100/40 transition hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                          >
                            <Icon className="mb-3 h-5 w-5 text-blue-600" />
                            <p className="text-sm font-black text-slate-800">
                              {item.text}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`group max-w-[82%] rounded-[1.5rem] px-5 py-4 text-sm leading-7 shadow-sm ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "border border-blue-100 bg-white text-slate-700"
                      }`}
                    >
                      {/* Rendu des images d'attachements stockées en base64 */}
                      {message.image_url && (
                        <div className="mb-3 max-w-sm overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white p-1">
                          <img
                            src={message.image_url}
                            alt="Attachement"
                            className="rounded-xl w-full max-h-60 object-cover"
                          />
                        </div>
                      )}

                      <RenderMessageContent content={message.content} />

                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="mt-3 hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition group-hover:flex"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {t[lang].copy}
                        </button>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-100 ring-2 ring-blue-400 ring-offset-2 animate-pulse">
                      <Bot className="h-4 w-4" />
                    </div>

                    <div className="flex items-center gap-3.5 rounded-[1.5rem] border border-blue-100 bg-white px-5 py-4 text-sm font-bold shadow-md shadow-blue-100/50">
                      {/* Premium bouncing dots indicator */}
                      <div className="flex items-center gap-1.5 px-0.5 shrink-0">
                        <span
                          className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>

                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black tracking-wide">
                        {t[lang].thinking}
                      </span>
                    </div>
                  </div>
                )}

                {showContinueButton && !loading && !generating && (
                  <div className="flex justify-center my-4 animate-fade-in">
                    <button
                      type="button"
                      onClick={handleContinueGeneration}
                      className="flex items-center gap-2 px-5 py-3 rounded-full border border-blue-200 bg-white hover:bg-blue-50 font-black text-xs text-blue-600 shadow-md transition-all active:scale-[0.97]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current text-blue-600 animate-pulse" />
                      <span>
                        {lang === "fr"
                          ? "Continuer la génération"
                          : "Continue generation"}
                      </span>
                    </button>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </section>

            {/* Footer avec bouton STOP et Image Upload */}
            <footer className="border-t border-blue-100 bg-white/90 px-4 py-4 backdrop-blur md:px-8 shrink-0">
              <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
                {/* Image Preview bubble */}
                {uploadedImage && (
                  <div className="relative mb-2 ml-3 w-16 h-16 rounded-xl border border-blue-200 overflow-hidden shadow-md bg-slate-50 p-0.5 inline-block">
                    <img
                      src={uploadedImage}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5 hover:bg-red-600 transition shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-3 rounded-[1.7rem] border border-blue-100 bg-white p-2.5 shadow-xl shadow-blue-100/60">
                  {/* Image Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDisabled}
                    className="h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t[lang].placeholder}
                    rows={1}
                    disabled={isDisabled}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {/* Premium Stop button during streaming generation, otherwise Send */}
                  {loading || generating ? (
                    <Button
                      type="button"
                      onClick={handleStopGeneration}
                      className="h-11 px-4 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-700 flex items-center gap-1.5 transition shrink-0"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs">{t[lang].stop}</span>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!prompt.trim() && !uploadedImage}
                      className="h-11 w-11 rounded-2xl bg-blue-600 p-0 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
                  Codentsika AI can make mistakes. Verify generated code before
                  production.
                </p>
              </form>
            </footer>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
