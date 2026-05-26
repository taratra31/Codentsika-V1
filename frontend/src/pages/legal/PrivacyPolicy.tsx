import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const PrivacyPolicy = () => {
  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-container">
          <section className="page-hero pt-16 pb-8">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Politique de Confidentialité
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Date d'entrée en vigueur : 23 Mai 2026
            </p>
          </section>
          <section className="page-container py-8">
            <div className="prose max-w-none dark:prose-invert prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tight prose-h1:text-slate-950 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-slate-900 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-slate-900 prose-p:text-sm prose-p:font-medium prose-p:text-slate-500 prose-ul:text-sm prose-ul:font-medium prose-ul:text-slate-500 prose-ul:space-y-2 prose-li:marker:text-blue-600">
              <h1>Introduction</h1>
              <p>
                Bienvenue sur Codentsika Studio. Cette politique de
                confidentialité explique comment nous collectons, utilisons et
                protégeons vos informations personnelles lorsque vous utilisez
                notre site web.
              </p>

              <h2>Informations que nous collectons</h2>
              <p>
                Nous pouvons collecter les informations personnelles suivantes :
              </p>
              <ul>
                <li>
                  Informations fournies volontairement (nom, email, etc.) lors
                  de l'inscription ou de l'utilisation de nos services.
                </li>
                <li>
                  Données d'utilisation collectées automatiquement (pages
                  visitées, durée des sessions, etc.) via des cookies et
                  technologies similaires (si vous les acceptez).
                </li>
              </ul>

              <h2>Comment nous utilisons vos informations</h2>
              <p>Vos informations sont utilisées pour :</p>
              <ul>
                <li>Fournir, maintenir et améliorer nos services.</li>
                <li>Personnaliser votre expérience sur le site.</li>
                <li>
                  Communiquer avec vous concernant nos services ou des mises à
                  jour.
                </li>
                <li>
                  Analyser l'utilisation du site pour l'améliorer (uniquement si
                  vous acceptez les cookies analytiques).
                </li>
              </ul>

              <h2>Partage d'informations</h2>
              <p>
                Nous ne partageons pas vos informations personnelles avec des
                tiers, sauf si requis par la loi ou avec votre consentement
                explicite.
              </p>

              <h2>Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour
                protéger vos informations, mais aucun système n'est totalement
                infaillible.
              </p>

              <h2>Vos droits</h2>
              <p>
                Vous avez le droit d'accéder, de corriger ou de supprimer vos
                informations personnelles. Vous pouvez également gérer vos
                préférences en matière de cookies.
              </p>

              <h2>Modifications de la politique</h2>
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité.
                Nous vous informerons de tout changement significatif.
              </p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPolicy;
