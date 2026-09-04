(function () {
  "use strict";

  const LIBRARY_URL = "https://painel.ldrrhestrategia.com/cliente/biblioteca";
  const TRAINING_ID = "ldrTrainingSalesCardFinal";
  const FILM_ID = "ldrFilmSalesCardFinal";
  const LOCALE_KEY = "luciano.public.locale.v2";

  const COPY = {
    pt: {available:"JÁ DISPONÍVEL",trainingType:"TREINAMENTO PARA EMPREENDEDORISMO",trainingTitle:"Do Mamão ao Negócio",trainingSubtitle:"Treinamento para Empreendedorismo",items:["3 meses · 300 horas","4 encontros ao vivo","Certificado de conclusão","Projeto prático para aplicar no seu negócio","Acesso pela Biblioteca do Cliente","Pagamento único","Acesso individual"],button:"Acessar Biblioteca do Cliente",filmStatus:"EM PRODUÇÃO",filmType:"FILME",filmTitle:"O Menino que Vendia Mamão",filmDescription:"Uma história que está ganhando vida nas telas. Produção em desenvolvimento.",filmNote:"Novidades serão divulgadas em breve."},
    en: {available:"AVAILABLE NOW",trainingType:"ENTREPRENEURSHIP TRAINING",trainingTitle:"From Papaya to Business",trainingSubtitle:"Entrepreneurship Training",items:["3 months · 300 hours","4 live sessions","Certificate of completion","Practical project to apply to your business","Access through the Client Library","One-time payment","Individual access"],button:"Access Client Library",filmStatus:"IN PRODUCTION",filmType:"FILM",filmTitle:"The Boy Who Sold Papayas",filmDescription:"A story coming to life on screen. Production in development.",filmNote:"Updates will be announced soon."},
    fr: {available:"DÉJÀ DISPONIBLE",trainingType:"FORMATION EN ENTREPRENEURIAT",trainingTitle:"De la Papaye à l’Entreprise",trainingSubtitle:"Formation en entrepreneuriat",items:["3 mois · 300 heures","4 rencontres en direct","Certificat de fin de formation","Projet pratique à appliquer à votre entreprise","Accès via la Bibliothèque Client","Paiement unique","Accès individuel"],button:"Accéder à la Bibliothèque Client",filmStatus:"EN PRODUCTION",filmType:"FILM",filmTitle:"Le Garçon qui Vendait des Papayes",filmDescription:"Une histoire qui prend vie à l’écran. Production en développement.",filmNote:"Les nouveautés seront annoncées prochainement."},
    es: {available:"YA DISPONIBLE",trainingType:"ENTRENAMIENTO PARA EMPRENDIMIENTO",trainingTitle:"De la Papaya al Negocio",trainingSubtitle:"Entrenamiento para Emprendimiento",items:["3 meses · 300 horas","4 encuentros en vivo","Certificado de finalización","Proyecto práctico para aplicar en tu negocio","Acceso mediante la Biblioteca del Cliente","Pago único","Acceso individual"],button:"Acceder a la Biblioteca del Cliente",filmStatus:"EN PRODUCCIÓN",filmType:"PELÍCULA",filmTitle:"El Niño que Vendía Papayas",filmDescription:"Una historia que está cobrando vida en la pantalla. Producción en desarrollo.",filmNote:"Las novedades se anunciarán próximamente."}
  };

  function currentLocale() {
    try { const query = new URLSearchParams(window.location.search).get("lang"); if (query && COPY[query.toLowerCase()]) return query.toLowerCase(); } catch (e) {}
    try { const saved = localStorage.getItem(LOCALE_KEY); if (saved && COPY[saved]) return saved; } catch (e) {}
    const htmlLang = (document.documentElement.lang || "").slice(0,2).toLowerCase();
    return COPY[htmlLang] ? htmlLang : "pt";
  }

  function addStyles() {
    if (document.getElementById("ldr-film-card-ux-final")) return;
    const style=document.createElement("style"); style.id="ldr-film-card-ux-final";
    style.textContent=`#platformView #comprar .pricing-grid{align-items:stretch!important;grid-auto-rows:1fr!important}#platformView #comprar .pricing-grid>#priceCard,#platformView #comprar .pricing-grid>#ldrBookSalesCard,#platformView #comprar .pricing-grid>#${TRAINING_ID},#platformView #comprar .pricing-grid>#${FILM_ID}{height:100%!important;min-height:560px!important;box-sizing:border-box!important;display:flex!important;flex-direction:column!important}#platformView #comprar #${TRAINING_ID} ul{display:grid!important;gap:10px!important;margin:18px 0 22px!important;padding-left:20px!important}#platformView #comprar #${TRAINING_ID} .btn-block{margin-top:auto!important}#platformView #comprar #${FILM_ID}{position:relative!important;overflow:hidden!important;padding:30px 28px!important;background:radial-gradient(circle at 92% 8%,rgba(240,213,139,.11),transparent 32%),linear-gradient(145deg,#4b1320 0%,#351018 58%,#210b10 100%)!important;border:1px solid rgba(215,168,77,.52)!important;box-shadow:0 20px 48px rgba(10,3,7,.30)!important}#platformView #comprar #${FILM_ID}:before{content:'🎬';display:flex;align-items:center;justify-content:center;width:52px;height:52px;margin:0 0 18px;border-radius:16px;background:rgba(215,168,77,.12);border:1px solid rgba(215,168,77,.30);font-size:26px}#platformView #comprar #${FILM_ID} .ldr-film-production{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:max-content!important;max-width:100%!important;margin-bottom:12px!important;padding:7px 12px!important;border-radius:999px!important;background:rgba(215,168,77,.14)!important;color:#f0d58b!important;border:1px solid rgba(240,213,139,.42)!important;font-size:.72rem!important;font-weight:900!important;letter-spacing:.10em!important;text-transform:uppercase!important;box-shadow:none!important}#platformView #comprar #${FILM_ID} .ldr-product-type{margin-top:2px!important;color:rgba(247,239,227,.68)!important}#platformView #comprar #${FILM_ID} .ldr-product-name{margin-top:8px!important;margin-bottom:12px!important;line-height:1.08!important}#platformView #comprar #${FILM_ID} .ldr-film-description{margin:0 0 24px!important;color:rgba(255,248,235,.88)!important;line-height:1.62!important}#platformView #comprar #${FILM_ID} .ldr-film-note{margin-top:auto!important;padding-top:18px!important;border-top:1px solid rgba(215,168,77,.20)!important;color:rgba(240,213,139,.84)!important;font-size:.86rem!important;font-weight:700!important;line-height:1.45!important}@media(max-width:760px){#platformView #comprar .pricing-grid{grid-auto-rows:auto!important}#platformView #comprar .pricing-grid>#priceCard,#platformView #comprar .pricing-grid>#ldrBookSalesCard,#platformView #comprar .pricing-grid>#${TRAINING_ID},#platformView #comprar .pricing-grid>#${FILM_ID}{min-height:0!important}#platformView #comprar #${FILM_ID}{padding:24px 22px!important}}`;
    document.head.appendChild(style);
  }

  function buildTrainingCard(){const card=document.createElement("article");card.className="card-premium";card.id=TRAINING_ID;card.setAttribute("data-ldr-extra-card-final","training");card.innerHTML=`<span class="tag ldr-product-available"></span><div class="ldr-product-type"></div><h3 class="ldr-product-name"></h3><p><strong></strong></p><ul></ul><a class="btn btn-block" href="${LIBRARY_URL}"></a>`;return card;}
  function buildFilmCard(){const card=document.createElement("article");card.className="card-premium";card.id=FILM_ID;card.setAttribute("data-ldr-extra-card-final","film");card.innerHTML=`<span class="tag ldr-film-production"></span><div class="ldr-product-type"></div><h3 class="ldr-product-name"></h3><p class="ldr-film-description"></p><div class="ldr-film-note"></div>`;return card;}

  function applyCopy(){
    const copy=COPY[currentLocale()];
    const training=document.getElementById(TRAINING_ID);
    if(training){const badge=training.querySelector(".ldr-product-available,.tag"),type=training.querySelector(".ldr-product-type"),title=training.querySelector(".ldr-product-name"),subtitle=training.querySelector("p strong"),list=training.querySelector("ul"),button=training.querySelector("a.btn");if(badge)badge.textContent=copy.available;if(type)type.textContent=copy.trainingType;if(title)title.textContent=copy.trainingTitle;if(subtitle)subtitle.textContent=copy.trainingSubtitle;if(list)list.replaceChildren(...copy.items.map(text=>{const li=document.createElement("li");li.textContent=text;return li;}));if(button)button.textContent=copy.button;}
    const film=document.getElementById(FILM_ID);
    if(film){const badge=film.querySelector(".ldr-film-production,.tag"),type=film.querySelector(".ldr-product-type"),title=film.querySelector(".ldr-product-name"),description=film.querySelector(".ldr-film-description"),note=film.querySelector(".ldr-film-note");if(badge)badge.textContent=copy.filmStatus;if(type)type.textContent=copy.filmType;if(title)title.textContent=copy.filmTitle;if(description)description.textContent=copy.filmDescription;if(note)note.textContent=copy.filmNote;}
  }

  function cleanupLecturePrices(){document.querySelectorAll("#palestraView .ldr-public-product-price, #palestra .ldr-public-product-price").forEach(el=>el.remove());}
  function ensureFilmState(){const film=document.getElementById(FILM_ID);if(!film)return;const badge=film.querySelector(".tag");if(badge){badge.classList.remove("ldr-product-available","status-disponivel","ldr-status-available");badge.classList.add("ldr-film-production");badge.removeAttribute("data-clean-copy");}film.querySelectorAll(".ldr-public-product-price,[data-ldr-price],button,a.btn,.btn-block").forEach(el=>el.remove());}
  function mount(){addStyles();cleanupLecturePrices();const grid=document.querySelector("#platformView #comprar .pricing-grid"),ebook=document.getElementById("priceCard"),book=document.getElementById("ldrBookSalesCard");if(!grid||!ebook||!book)return false;if(!document.getElementById(TRAINING_ID))grid.appendChild(buildTrainingCard());if(!document.getElementById(FILM_ID))grid.appendChild(buildFilmCard());ensureFilmState();applyCopy();cleanupLecturePrices();return true;}

  function start(){
    let attempts=0;const timer=setInterval(()=>{attempts+=1;mount();if(attempts>=100)clearInterval(timer);},200);mount();
    let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;applyCopy();ensureFilmState();cleanupLecturePrices();});});
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("popstate",applyCopy);window.addEventListener("hashchange",applyCopy);window.addEventListener("storage",applyCopy);

    // A alteração de localStorage feita na MESMA aba não dispara o evento "storage".
    // Por isso, sincronizamos explicitamente os cards com o seletor de idioma da página.
    let lastLocale=currentLocale();
    setInterval(()=>{const now=currentLocale();if(now!==lastLocale){lastLocale=now;applyCopy();}},200);
    document.addEventListener("click",()=>{setTimeout(applyCopy,0);setTimeout(applyCopy,80);setTimeout(applyCopy,250);},true);
    document.addEventListener("change",()=>{setTimeout(applyCopy,0);setTimeout(applyCopy,120);},true);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
