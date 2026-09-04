(function(){
  "use strict";
  const KEYS=["luciano.public.locale.v2","lucianoLang","ldr-language"];
  const HTML={pt:"pt-BR",en:"en",fr:"fr",es:"es"};
  const COPY={
    pt:{buy:"Comprar agora",open:"Abrindo checkout…",available:"Disponível",journey:"Jornada",experience:"Experiência",buyNav:"Comprar",lecture:"← Palestra",enter:"Entrar",regionBR:"🇧🇷 Checkout Brasil selecionado automaticamente",regionINTL:"🌍 Checkout internacional selecionado automaticamente",noteBR:"Valores de referência: 🇧🇷 Brasil — R$ 9,90 • 🌍 Resto do mundo — € 4,90. O checkout correto continuará sendo selecionado automaticamente de acordo com sua região.",launchEyebrow:"Fique por dentro",launchTitle:"Próximos lançamentos",launchSubtitle:"O ecossistema LdR Essence está em expansão — sempre com o olhar no mundo e na saúde mental. Confira:",cards:[
      ["Ebook “A Coragem de Começar”","A história completa do menino que vendia mamão, com lições práticas de empreendedorismo sem fronteiras, resiliência e visão de futuro.","✅ Já disponível"],
      ["Livro Digital “O Menino que Vendia Mamão”","A história que inspirou o ebook, agora também em formato de livro digital. Uma narrativa emocionante sobre coragem, superação e empreendedorismo real.","📚 Já disponível"],
      ["Treinamento para Empreendedorismo","Treinamento prático com módulos sobre mentalidade global, gestão, marketing, finanças, internacionalização e saúde mental.","✅ JÁ DISPONÍVEL"],
      ["Filme “O Menino que Vendia Mamão”","Adaptação cinematográfica da trajetória real de Luciano, mostrando bastidores, desafios, conquistas e a importância da saúde mental na jornada sem fronteiras.","🎥 Em produção"]]},
    en:{buy:"Buy now",open:"Opening checkout…",available:"Available",journey:"Journey",experience:"Experience",buyNav:"Buy",lecture:"← Lecture",enter:"Sign in",regionBR:"🇧🇷 Brazil checkout selected automatically",regionINTL:"🌍 International checkout selected automatically",noteBR:"Reference prices: 🇧🇷 Brazil — R$ 9.90 • 🌍 Rest of the world — € 4.90. The correct checkout will continue to be selected automatically according to your region.",launchEyebrow:"Stay informed",launchTitle:"Upcoming releases",launchSubtitle:"The LdR Essence ecosystem is expanding — always with a global outlook and attention to mental health. See what is coming:",cards:[
      ["E-book “The Courage to Start”","The complete story of the boy who sold papayas, with practical lessons in borderless entrepreneurship, resilience and future vision.","✅ Available now"],
      ["Digital Book “The Boy Who Sold Papayas”","The story that inspired the e-book, now also available as a digital book. An inspiring narrative about courage, resilience and real entrepreneurship.","📚 Available now"],
      ["Entrepreneurship Training","Practical training with modules on global mindset, management, marketing, finance, internationalization and mental health.","✅ AVAILABLE NOW"],
      ["Film “The Boy Who Sold Papayas”","A screen adaptation of Luciano’s real journey, showing behind-the-scenes moments, challenges, achievements and the importance of mental health in a borderless journey.","🎥 In production"]]},
    fr:{buy:"Acheter maintenant",open:"Ouverture du paiement…",available:"Disponible",journey:"Parcours",experience:"Expérience",buyNav:"Acheter",lecture:"← Conférence",enter:"Se connecter",regionBR:"🇧🇷 Paiement Brésil sélectionné automatiquement",regionINTL:"🌍 Paiement international sélectionné automatiquement",noteBR:"Prix de référence : 🇧🇷 Brésil — R$ 9,90 • 🌍 Reste du monde — 4,90 €. Le paiement correct continuera d’être sélectionné automatiquement selon votre région.",launchEyebrow:"Restez informé",launchTitle:"Prochains lancements",launchSubtitle:"L’écosystème LdR Essence est en expansion — toujours avec une vision internationale et une attention portée à la santé mentale. Découvrez la suite :",cards:[
      ["eBook « Le Courage de Commencer »","L’histoire complète du garçon qui vendait des papayes, avec des leçons pratiques d’entrepreneuriat sans frontières, de résilience et de vision d’avenir.","✅ Déjà disponible"],
      ["Livre numérique « Le Garçon qui Vendait des Papayes »","L’histoire qui a inspiré l’eBook, désormais également disponible en livre numérique. Un récit sur le courage, la résilience et l’entrepreneuriat réel.","📚 Déjà disponible"],
      ["Formation en entrepreneuriat","Formation pratique avec des modules sur la mentalité globale, la gestion, le marketing, la finance, l’internationalisation et la santé mentale.","✅ DÉJÀ DISPONIBLE"],
      ["Film « Le Garçon qui Vendait des Papayes »","Adaptation cinématographique du parcours réel de Luciano, avec les coulisses, les défis, les réussites et l’importance de la santé mentale dans un parcours sans frontières.","🎥 En production"]]},
    es:{buy:"Comprar ahora",open:"Abriendo pago…",available:"Disponible",journey:"Trayectoria",experience:"Experiencia",buyNav:"Comprar",lecture:"← Conferencia",enter:"Entrar",regionBR:"🇧🇷 Pago de Brasil seleccionado automáticamente",regionINTL:"🌍 Pago internacional seleccionado automáticamente",noteBR:"Precios de referencia: 🇧🇷 Brasil — R$ 9,90 • 🌍 Resto del mundo — € 4,90. El pago correcto seguirá seleccionándose automáticamente según tu región.",launchEyebrow:"Mantente informado",launchTitle:"Próximos lanzamientos",launchSubtitle:"El ecosistema LdR Essence está en expansión — siempre con una visión global y atención a la salud mental. Mira lo que viene:",cards:[
      ["eBook “El Coraje de Comenzar”","La historia completa del niño que vendía papayas, con lecciones prácticas de emprendimiento sin fronteras, resiliencia y visión de futuro.","✅ Ya disponible"],
      ["Libro digital “El Niño que Vendía Papayas”","La historia que inspiró el eBook, ahora también disponible como libro digital. Una narrativa sobre coraje, superación y emprendimiento real.","📚 Ya disponible"],
      ["Entrenamiento para Emprendimiento","Entrenamiento práctico con módulos sobre mentalidad global, gestión, marketing, finanzas, internacionalización y salud mental.","✅ YA DISPONIBLE"],
      ["Película “El Niño que Vendía Papayas”","Adaptación cinematográfica de la trayectoria real de Luciano, mostrando bastidores, desafíos, logros y la importancia de la salud mental en un camino sin fronteras.","🎥 En producción"]]}
  };
  let syncing=false,last="";
  function activeLocale(){
    const active=document.querySelector(".ldr-public-lang-button.active[data-lang]");
    if(active&&COPY[active.dataset.lang])return active.dataset.lang;
    const btn=document.getElementById("langBtn");
    if(btn){const v=(btn.textContent||"").trim().toLowerCase();if(COPY[v])return v;}
    const sel=document.getElementById("langSelectLibrary");
    if(sel&&COPY[sel.value])return sel.value;
    const html=(document.documentElement.lang||"").slice(0,2).toLowerCase();
    if(COPY[html])return html;
    for(const k of KEYS){try{const v=localStorage.getItem(k);if(COPY[v])return v;}catch(e){}}
    return "pt";
  }
  function setText(el,text){if(el&&text!=null&&el.textContent!==text)el.textContent=text;}
  function syncStorage(lang){
    KEYS.forEach(k=>{try{if(localStorage.getItem(k)!==lang)localStorage.setItem(k,lang);}catch(e){}});
    if(document.documentElement.lang!==HTML[lang])document.documentElement.lang=HTML[lang];
  }
  function applyFixed(lang){
    const c=COPY[lang]||COPY.pt;
    const buy=document.getElementById("dynamicBuyBtn");
    if(buy&&!buy.hasAttribute("aria-busy"))setText(buy,c.buy);
    const bookTag=document.querySelector("#ldrBookSalesCard .tag");setText(bookTag,c.available);
    const nav=document.querySelector("#site header nav");
    if(nav){const links=nav.querySelectorAll("a");links.forEach(a=>{const h=a.getAttribute("href");if(h==="#jornada")setText(a,c.journey);else if(h==="#experiencia")setText(a,c.experience);else if(h==="#comprar")setText(a,c.buyNav);else if(h==="#palestra")setText(a,c.lecture);});const enter=Array.from(nav.querySelectorAll("button")).find(b=>/painel\.ldrrhestrategia\.com\/cliente\/biblioteca/.test(b.getAttribute("onclick")||""));setText(enter,c.enter);}
    const region=document.getElementById("userRegion");if(region)setText(region,(window.userRegion==="BR")?c.regionBR:c.regionINTL);
    const note=document.getElementById("checkoutRegionNote");setText(note,c.noteBR);
    [document.getElementById("platformLancamentos"),document.querySelector("#palestraView #lancamentos")].filter(Boolean).forEach(section=>{
      setText(section.querySelector(":scope > .eyebrow, .container > .eyebrow"),c.launchEyebrow);
      const title=section.querySelector(":scope > .section-title, .container > .section-title");if(title)title.textContent=c.launchTitle;
      setText(section.querySelector(":scope > .section-subtitle, .container > .section-subtitle"),c.launchSubtitle);
      section.querySelectorAll(".lancamento-card").forEach((card,i)=>{const d=c.cards[i];if(!d)return;setText(card.querySelector("h3"),d[0]);setText(card.querySelector("p"),d[1]);setText(card.querySelector(".status"),d[2]);});
    });
  }
  function apply(){
    if(syncing)return;syncing=true;
    const lang=activeLocale();syncStorage(lang);applyFixed(lang);
    if(lang!==last){last=lang;window.dispatchEvent(new CustomEvent("ldr:languagechange",{detail:{lang}}));window.dispatchEvent(new CustomEvent("luciano:languagechange",{detail:{lang}}));}
    syncing=false;
  }
  function schedule(){setTimeout(apply,0);setTimeout(apply,80);setTimeout(apply,250);}
  document.addEventListener("click",schedule,true);document.addEventListener("change",schedule,true);window.addEventListener("hashchange",schedule);window.addEventListener("popstate",schedule);window.addEventListener("storage",schedule);
  const observer=new MutationObserver(schedule);
  function start(){apply();observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});observer.observe(document.body,{childList:true,subtree:true});setInterval(apply,400);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
