export const subscriptionPlans = [
  {
    name: "Gratuit",
    price: "0",
    priceBillingCycle: "/mois",
    features: [
      "1 projet",
      "5 requêtes IA",
      "1 API mock",
      "100 Mo de stockage",
      "Support communautaire",
    ],
    buttonText: "Plan actuel",
    buttonVariant: "default",
  },
  {
    name: "Pro",
    price: "19",
    priceBillingCycle: "/mois",
    features: [
      "10 projets",
      "500 requêtes IA",
      "10 APIs mock",
      "5 Go de stockage",
      "Support prioritaire",
    ],
    buttonText: "Passer au Pro",
    buttonVariant: "gradient",
  },
  {
    name: "Business",
    price: "Sur devis",
    priceBillingCycle: "",
    features: [
      "Projets illimités",
      "Requêtes IA illimitées",
      "APIs mock illimitées",
      "Stockage illimité",
      "Support dédié 24/7",
    ],
    buttonText: "Contacter sales",
    buttonVariant: "outline",
  },
];

export const currentUsage = {
  projects: { current: 3, limit: 10 },
  iaQueries: { current: 150, limit: 500 },
  mockApis: { current: 5, limit: 10 },
  storage: { current: 2.3, limit: 5, unit: "GB" },
};

export const billingHistory = [
  {
    date: "2024-04-23",
    plan: "Pro",
    amount: "19.00 €",
    status: "Payé",
    invoice: "#INV-001",
  },
  {
    date: "2024-03-23",
    plan: "Pro",
    amount: "19.00 €",
    status: "Payé",
    invoice: "#INV-002",
  },
  {
    date: "2024-02-23",
    plan: "Gratuit",
    amount: "0.00 €",
    status: "Payé",
    invoice: "#INV-003",
  },
];
