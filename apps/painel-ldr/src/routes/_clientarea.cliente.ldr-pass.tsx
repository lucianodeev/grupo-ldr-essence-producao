import { Link, createFileRoute } from "@tanstack/react-router";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/ldr-pass")({
  component: ClientLdrPass,
});

const PASS_COPY = {
  pt:{back:"{t.back}",eyebrow:"{t.eyebrow}",title:"{t.title}",intro:"{t.intro}",status:"{t.status}",ready:"{t.ready}",statusText:"{t.statusText}",links:"{t.links}",linksText:"{t.linksText}",benefits:[["Conteúdos digitais elegíveis","Cursos digitais, eBooks e materiais aprovados para o PASS aparecem como liberáveis pela camada de elegibilidade."],["Compras antigas preservadas","Aquilo que o cliente já comprou ou recebeu como vitalício continua funcionando fora do PASS."],["Separação segura","Biblioteca legacy, revista/editorial, clínica, serviços humanos, B2B e aulas ao vivo continuam separados."]],access:[["Página comercial do PASS","/ldr-pass"],["Mapa do ecossistema","/ecossistema"],["Minha Biblioteca","/cliente/biblioteca"],["Rede Acadêmica","/cliente/rede-academica"],["Cursos gratuitos","/cliente/biblioteca/cursos-gratuitos"],["Pedidos e pagamentos","/cliente/pedidos"]]},
  en:{back:"← My Library",eyebrow:"My LDR PASS",title:"Your LDR digital access dashboard.",intro:"Track the PASS offer, eligible benefits and shortcuts across the ecosystem without mixing separate products.",status:"Commercial status",ready:"Ready for Stripe activation",statusText:"The technical foundation is published; checkout should only be enabled once the final product and price are approved.",links:"Ecosystem links for clients",linksText:"Use these shortcuts as your navigation hub while the dedicated PASS checkout is prepared securely.",benefits:[["Eligible digital content","Digital courses, eBooks and approved PASS materials are released through the eligibility layer."],["Previous purchases preserved","Anything already purchased or granted as lifetime access continues to work outside PASS."],["Safe separation","Legacy Library, editorial products, clinic, human services, B2B and live classes remain separate."]],access:[["PASS commercial page","/ldr-pass"],["Ecosystem map","/ecossistema"],["My Library","/cliente/biblioteca"],["Academic Network","/cliente/rede-academica"],["Free courses","/cliente/biblioteca/cursos-gratuitos"],["Orders and payments","/cliente/pedidos"]]},
  fr:{back:"← Ma bibliothèque",eyebrow:"Mon LDR PASS",title:"Votre tableau de bord d’accès numérique LDR.",intro:"Suivez l’offre PASS, les avantages éligibles et les raccourcis de l’écosystème sans mélanger les produits distincts.",status:"Statut commercial",ready:"Prêt pour l’activation Stripe",statusText:"La base technique est publiée ; le paiement ne doit être activé qu’après validation du produit et du prix définitifs.",links:"Liens de l’écosystème pour le client",linksText:"Utilisez ces raccourcis comme centre de navigation pendant la préparation sécurisée du paiement PASS.",benefits:[["Contenus numériques éligibles","Les cours numériques, eBooks et ressources approuvées pour PASS sont libérés via la couche d’éligibilité."],["Achats antérieurs préservés","Tout achat ou accès à vie déjà accordé continue de fonctionner hors PASS."],["Séparation sécurisée","Bibliothèque historique, éditorial, clinique, services humains, B2B et cours en direct restent séparés."]],access:[["Page commerciale PASS","/ldr-pass"],["Carte de l’écosystème","/ecossistema"],["Ma bibliothèque","/cliente/biblioteca"],["Réseau académique","/cliente/rede-academica"],["Cours gratuits","/cliente/biblioteca/cursos-gratuitos"],["Commandes et paiements","/cliente/pedidos"]]},
  es:{back:"← Mi Biblioteca",eyebrow:"Mi LDR PASS",title:"Tu panel de acceso digital LDR.",intro:"Consulta la propuesta PASS, los beneficios elegibles y los accesos del ecosistema sin mezclar productos separados.",status:"Estado comercial",ready:"Listo para activación de Stripe",statusText:"La base técnica está publicada; el checkout solo debe activarse cuando se aprueben el producto y precio finales.",links:"Enlaces del ecosistema para el cliente",linksText:"Usa estos accesos como centro de navegación mientras se prepara de forma segura el checkout específico de PASS.",benefits:[["Contenidos digitales elegibles","Cursos digitales, eBooks y materiales aprobados para PASS se liberan mediante la capa de elegibilidad."],["Compras anteriores preservadas","Lo ya comprado o concedido como acceso vitalicio sigue funcionando fuera de PASS."],["Separación segura","Biblioteca anterior, editorial, clínica, servicios humanos, B2B y clases en vivo permanecen separados."]],access:[["Página comercial de PASS","/ldr-pass"],["Mapa del ecosistema","/ecossistema"],["Mi Biblioteca","/cliente/biblioteca"],["Red Académica","/cliente/rede-academica"],["Cursos gratuitos","/cliente/biblioteca/cursos-gratuitos"],["Pedidos y pagos","/cliente/pedidos"]]}
} as const;

function ClientLdrPass() {
  const { locale } = useI18n();
  const t = PASS_COPY[locale as keyof typeof PASS_COPY] ?? PASS_COPY.pt;
  return (
    <div className="space-y-6"><div className="ml-auto w-36"><LanguageSelect /></div>
      <Link to="/cliente/biblioteca" className="text-sm font-bold text-[#9a4828]">{t.back}</Link>
      <section className="rounded-[30px] border border-[#d6ad63]/40 bg-gradient-to-br from-[#081326] via-[#102c55] to-[#5f2b16] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#f4c76b]">{t.eyebrow}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="font-serif text-4xl font-bold">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/75">{t.intro}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[.16em] text-white/50">{t.status}</p>
            <p className="mt-1 text-xl font-black text-[#f4c76b]">{t.ready}</p>
            <p className="mt-2 text-xs text-white/65">{t.statusText}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {t.benefits.map((item) => (
          <article key={item[0]} className="rounded-[24px] border bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#5d2917]">{item[0]}</h2>
            <p className="mt-2 text-sm text-[#64748b]">{item[1]}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border bg-[#fffaf7] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-bold text-[#5d2917]">{t.links}</h2>
        <p className="mt-2 text-sm text-[#64748b]">{t.linksText}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {t.access.map((item) => (
            <Link key={item[1]} to={item[1]} className="rounded-2xl border border-[#ead6c7] bg-white p-4 text-sm font-black text-[#7b351f] transition hover:border-[#b85c2e] hover:shadow-md">{item[0]}<span className="mt-1 block text-xs font-medium text-[#94a3b8]">{item[1]}</span></Link>
          ))}
        </div>
      </section>
    </div>
  );
}
