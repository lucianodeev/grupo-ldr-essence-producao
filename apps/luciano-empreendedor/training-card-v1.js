(function () {
  "use strict";

  const PANEL_LIBRARY = "https://painel.ldrrhestrategia.com/cliente/biblioteca";
  const COPY = {
    pt: { available:"✅ JÁ DISPONÍVEL", trainingTitle:"Treinamento de Empreendedorismo", trainingPrice:"R$ 599,99 · € 100,56", ebookPrice:"R$ 9,90 · € 4,90", bookPrice:"R$ 49,90 · € 20,00", fallbackTitle:"Do Mamão ao Negócio", fallbackSubtitle:"Treinamento de Empreendedorismo · 3 meses · 300 horas", fallbackBody:"Da ideia ao Projeto de Negócio, com Sistema S8, quizzes, atividades, Laboratório de Campo, fórum, encontros ao vivo e certificado.", buy:"COMPRAR TREINAMENTO" },
    en: { available:"✅ AVAILABLE NOW", trainingTitle:"Entrepreneurship Training", trainingPrice:"R$ 599.99 · € 100.56", ebookPrice:"R$ 9.90 · € 4.90", bookPrice:"R$ 49.90 · € 20.00", fallbackTitle:"From Papaya to Business", fallbackSubtitle:"Entrepreneurship Training · 3 months · 300 hours", fallbackBody:"From idea to a Business Project with the S8 System, quizzes, activities, Field Lab, forum, live meetings and certificate.", buy:"BUY TRAINING" },
    fr: { available:"✅ DÉJÀ DISPONIBLE", trainingTitle:"Formation en entrepreneuriat", trainingPrice:"R$ 599,99 · 100,56 €", ebookPrice:"R$ 9,90 · 4,90 €", bookPrice:"R$ 49,90 · 20,00 €", fallbackTitle:"De la Papaye au Business", fallbackSubtitle:"Formation en entrepreneuriat · 3 mois · 300 heures", fallbackBody:"De l’idée au Projet d’Entreprise avec le Système S8, quiz, activités, Laboratoire de Terrain, forum, rencontres en direct et certificat.", buy:"ACHETER LA FORMATION" },
    es: { available:"✅ YA DISPONIBLE", trainingTitle:"Entrenamiento de Emprendimiento", trainingPrice:"R$ 599,99 · € 100,56", ebookPrice:"R$ 9,90 · € 4,90", bookPrice:"R$ 49,90 · € 20,00", fallbackTitle:"De la Papaya al Negocio", fallbackSubtitle:"Entrenamiento de Emprendimiento · 3 meses · 300 horas", fallbackBody:"De la idea al Proyecto de Negocio con Sistema S8, cuestionarios, actividades, Laboratorio de Campo, foro, encuentros en vivo y certificado.", buy:"COMPRAR ENTRENAMIENTO" }
  };

  const AVAILABLE = ["já disponível","ja disponível","available now","available","déjà disponible","deja disponible","ya disponible"];
  const PRODUCTION = ["em produção","in production","en production","en producción"];
  const TRAINING_TITLES = ["treinamento de empreendedorismo","do mamão ao negócio","entrepreneurship training","from papaya to business","formation en entrepreneuriat","de la papaye au business","entrenamiento de emprendimiento","de la papaya al negocio"];

  function language(){ const raw=(document.documentElement.lang||navigator.language||"pt").toLowerCase(); const key=raw.slice(0,2); return COPY[key]?key:"pt"; }
  function normalize(v){ return String(v||"").replace(/[✅🚀]/g,"").replace(/\s+/g," ").trim().toLowerCase(); }
  function addStyles(){
    if(document.getElementById("ldr-training-card-styles-final")) return;
    const s=document.createElement("style"); s.id="ldr-training-card-styles-final";
    s.textContent=`
      .ldr-product-available{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:max-content!important;max-width:100%!important;color:#166534!important;background:#dcfce7!important;border:1px solid #86efac!important;border-radius:999px!important;padding:6px 12px!important;font-weight:900!important;line-height:1.2!important;box-shadow:none!important;text-decoration:none!important}
      .ldr-public-product-price{margin:9px auto 0!important;width:max-content!important;max-width:100%!important;color:#fff8e8!important;background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,248,232,.24)!important;border-radius:999px!important;padding:6px 10px!important;font-size:12px!important;font-weight:900!important}
      .ldr-training-fallback{max-width:1040px;margin:28px auto 0;padding:24px;border:1px solid #c99b4b;border-radius:20px;background:linear-gradient(145deg,#68152f,#3d0b1b);color:#fff8e8;text-align:center}
      .ldr-training-fallback h3{margin:10px 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:30px}.ldr-training-fallback p{max-width:760px;margin:8px auto;line-height:1.55}.ldr-training-fallback a{display:inline-flex;margin-top:12px;padding:11px 17px;border-radius:10px;background:#c99b4b;color:#301018!important;text-decoration:none!important;font-weight:900}
    `;
    document.head.appendChild(s);
  }
  function findTextElement(section, fragments){ if(!section)return null; return Array.from(section.querySelectorAll("h1,h2,h3,h4,h5,p,strong,b,span,div")).find(el=>{const t=normalize(el.textContent);return fragments.some(f=>t.includes(normalize(f)))&&el.children.length<=3;})||null; }
  function cardAround(el,section){ if(!el)return null; let cur=el,best=null; for(let i=0;cur&&cur!==section&&i<10;i++,cur=cur.parentElement){const t=normalize(cur.textContent); if(t.length>=35&&t.length<=1800)best=cur; if(t.length>=80&&/(produção|production|producción|dispon|available)/.test(t))return cur;} return best; }
  function makeGreen(el, copy){ if(!el)return; el.textContent=copy.available; el.classList.add("ldr-product-available"); el.style.setProperty("color","#166534","important"); el.style.setProperty("background","#dcfce7","important"); el.style.setProperty("border-color","#86efac","important"); }
  function normalizeAvailableBadges(section,copy){
    if(!section)return;
    const nodes=Array.from(section.querySelectorAll("a,span,p,strong,b,button,div"));
    nodes.forEach(el=>{ const t=normalize(el.textContent); if(t.length<=36 && AVAILABLE.some(v=>t===v || t.endsWith(v))) makeGreen(el,copy); });
  }
  function forceTrainingAvailable(section,copy){
    const title=findTextElement(section,["Treinamento de Empreendedorismo",copy.trainingTitle,"Do Mamão ao Negócio",copy.fallbackTitle]);
    const card=cardAround(title,section); if(!card)return false;
    const candidates=Array.from(card.querySelectorAll("a,span,p,strong,b,button,div"));
    let badge=candidates.find(el=>{const t=normalize(el.textContent);return t.length<44&&(PRODUCTION.includes(t)||AVAILABLE.includes(t));});
    if(!badge) badge=candidates.find(el=>{const t=normalize(el.textContent);return t.length<44&&/(produção|production|producción|dispon|available)/.test(t);});
    if(badge) makeGreen(badge,copy);
    return true;
  }
  function forceAllTrainingCards(copy){
    const titleNodes=Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span"));
    titleNodes.forEach(title=>{
      const titleText=normalize(title.textContent);
      if(!TRAINING_TITLES.some(v=>titleText.includes(v))) return;
      let card=title;
      for(let i=0;i<10&&card.parentElement;i++){
        const parent=card.parentElement;
        const text=normalize(parent.textContent);
        card=parent;
        if(text.length>70&&text.length<2000&&/(produção|production|producción|dispon|available)/.test(text)) break;
      }
      const badges=Array.from(card.querySelectorAll("a,span,p,strong,b,button,div"));
      badges.forEach(el=>{
        const t=normalize(el.textContent);
        if(t.length<44&&(PRODUCTION.includes(t)||AVAILABLE.includes(t)||/(^|\s)(em produção|in production|en production|en producción)$/.test(t))) makeGreen(el,copy);
      });
    });
  }
  function addPrice(section,titleFragments,price,key){ const title=findTextElement(section,titleFragments); const card=cardAround(title,section); if(!card||card.querySelector(`[data-ldr-price="${key}"]`))return; const el=document.createElement("div");el.className="ldr-public-product-price";el.dataset.ldrPrice=key;el.textContent=price;card.appendChild(el); }
  function makeFallback(copy,kind){ const box=document.createElement("div");box.className="ldr-training-fallback";box.dataset.ldrTrainingFallback=kind;box.innerHTML=`<span class="ldr-product-available">${copy.available}</span><h3>${copy.fallbackTitle}</h3><p><strong>${copy.fallbackSubtitle}</strong></p><p>${copy.fallbackBody}</p><div class="ldr-public-product-price">${copy.trainingPrice}</div><a href="${PANEL_LIBRARY}">${copy.buy}</a>`;return box; }
  function ensureSection(section,copy,kind){ if(!section)return; normalizeAvailableBadges(section,copy); const has=forceTrainingAvailable(section,copy); addPrice(section,["A Coragem de Começar","Coragem de Começar"],copy.ebookPrice,`${kind}-ebook`); addPrice(section,["O Menino que Vendia Mamão","Menino que Vendia Mamão"],copy.bookPrice,`${kind}-book`); addPrice(section,["Treinamento de Empreendedorismo",copy.trainingTitle,"Do Mamão ao Negócio"],copy.trainingPrice,`${kind}-training`); const old=section.querySelector(`[data-ldr-training-fallback="${kind}"]`); if(has&&old)old.remove(); else if(!has&&!old)section.appendChild(makeFallback(copy,kind)); normalizeAvailableBadges(section,copy); }
  function mount(){ addStyles(); const copy=COPY[language()]||COPY.pt; ensureSection(document.getElementById("plataforma"),copy,"plataforma"); ensureSection(document.getElementById("palestra"),copy,"palestra"); ensureSection(document.getElementById("palestraView"),copy,"palestra-view"); forceAllTrainingCards(copy); }
  function start(){ mount(); if(!window.__ldrProductStatusObserverFinal){ let scheduled=false; const ob=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});}); ob.observe(document.body,{childList:true,subtree:true,characterData:true}); window.__ldrProductStatusObserverFinal=ob;} let tries=0;const retry=setInterval(()=>{mount();if(++tries>90)clearInterval(retry);},400); }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();