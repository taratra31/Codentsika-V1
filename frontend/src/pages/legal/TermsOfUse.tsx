import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const TermsOfUse = () => {
  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-container">
          <section className="page-hero pt-16 pb-8">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Conditions d'Utilisation
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Date d'entrée en vigueur : 23 Mai 2026
            </p>
          </section>
          <section className="page-container py-8">
            <div className="prose max-w-none dark:prose-invert prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tight prose-h1:text-slate-950 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-slate-900 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-slate-900 prose-p:text-sm prose-p:font-medium prose-p:text-slate-500 prose-ul:text-sm prose-ul:font-medium prose-ul:text-slate-500 prose-ul:space-y-2 prose-li:marker:text-blue-600">
              <h1>Acceptation des conditions</h1>
              <p>
                En accédant et en utilisant Codentsika Studio, vous acceptez
                d'être lié par ces Conditions d'Utilisation, toutes les lois et
                réglementations applicables, et acceptez que vous êtes
                responsable du respect de toute loi locale applicable.
              </p>

              <h2>Utilisation de la licence</h2>
              <p>
                Permission est accordée de télécharger temporairement une copie
                des informations sur le site web de Codentsika Studio pour une
                visualisation transitoire personnelle et non commerciale
                uniquement. Ceci est l'octroi d'une licence, et non un transfert
                de titre.
              </p>
              <ul>
                <li>
                  Cette licence est résiliée automatiquement si vous violez
                  l'une de ces restrictions.
                </li>
              </ul>

              <h2>Clause de non-responsabilité</h2>
              <p>
                Les matériaux sur le site web de Codentsika Studio sont fournis
                "tels quels". Codentsika Studio ne donne aucune garantie,
                expresse ou implicite, et rejette par la présente toute autre
                garantie, y compris, sans s'y limiter, les garanties implicites
                ou conditions de qualité marchande, d'adéquation à un usage
                particulier, ou de non-violation de propriété intellectuelle ou
                d'autres violations de droits.
              </p>

              <h2>Limitations</h2>
              <p>
                En aucun cas Codentsika Studio ou ses fournisseurs ne seront
                responsables des dommages indirects, spéciaux, consécutifs ou
                punitifs découlant de l'utilisation ou de l'impossibilité
                d'utiliser le site web de Codentsika Studio.
              </p>

              <h2>Révisions et errata</h2>
              <p>
                Les matériaux apparaissant sur le site web de Codentsika Studio
                pourraient inclure des erreurs techniques, typographiques ou
                photographiques. Codentsika Studio ne garantit pas que les
                matériaux sur son site web sont exacts, complets ou actuels.
              </p>

              <h2>Modifications des conditions</h2>
              <p>
                Nous pouvons réviser ces Conditions d'Utilisation à tout moment
                sans préavis. En utilisant ce site web, vous acceptez d'être lié
                par la version alors actuelle de ces Conditions d'Utilisation.
              </p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TermsOfUse;
