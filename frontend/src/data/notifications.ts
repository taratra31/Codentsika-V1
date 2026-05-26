import { BellRing, Check, AlertTriangle, Info } from "lucide-react";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon: React.ElementType;
}

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "success",
    title: "Projet généré avec succès",
    description: "Votre projet 'Codentsika Studio' a été généré.",
    timestamp: "Il y a 5 minutes",
    read: false,
    icon: Check,
  },
  {
    id: "notif-2",
    type: "info",
    title: "API mock créée",
    description: "Une nouvelle API mock pour 'Utilisateurs' a été créée.",
    timestamp: "Il y a 15 minutes",
    read: false,
    icon: Info,
  },
  {
    id: "notif-3",
    type: "warning",
    title: "Limite IA bientôt atteinte",
    description: "Vous avez utilisé 80% de vos requêtes IA mensuelles.",
    timestamp: "Il y a 30 minutes",
    read: true,
    icon: AlertTriangle,
  },
  {
    id: "notif-4",
    type: "info",
    title: "Nouveau message assistant IA",
    description: "L'assistant IA a répondu à votre dernière requête.",
    timestamp: "Il y a 1 heure",
    read: false,
    icon: BellRing, // Using BellRing as a placeholder for general info notification
  },
];
