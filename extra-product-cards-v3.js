(function(){
  "use strict";
  const LIB="https://painel.ldrrhestrategia.com/cliente/biblioteca";
  const COPY={
    pt:{avail:"JÁ DISPONÍVEL",trainingType:"TREINAMENTO",training:"Do Mamão ao Negócio",trainingDesc:"Treinamento de Empreendedorismo · 3 meses · 300 horas.",trainingMeta:"Sistema S8 · atividades práticas · encontros ao vivo · certificado.",access:"Acessar treinamento",filmType:"FILME",film:"O Menino que Vendia Mamão",filmStatus:"EM PRODUÇÃO",filmDesc:"Adaptação cinematográfica da história que inspira esta jornada.",filmMeta:"Projeto atualmente em desenvolvimento."},
    en:{avail:"AVAILABLE NOW",trainingType:"TRAINING",training:"From Papaya to Business",trainingDesc:"Entrepreneurship Training · 3 months · 300 hours.",trainingMeta:"S8 System · practical activities · live meetings · certificate.",access:"Access training",filmType:"FILM",film:"The Boy Who Sold Papaya",filmStatus:"IN PRODUCTION",filmDesc:"Film adaptation of the story that inspires this journey.",filmMeta:"Project currently in development."},
    fr:{avail:"DÉJÀ DISPONIBLE",trainingType:"FORMATION",training:"De la Papaye au Business",trainingDesc:"Formation en entrepreneuriat · 3 mois · 300 heures.",trainingMeta:"Système S8 · activités pratiques · rencontres en direct · certificat.",access:"Accéder à la formation",filmType:"FILM",film:"Le Garçon qui Vendait des Papayes",filmStatus:"EN PRODUCTION",filmDesc:"Adaptation cinématographique de l'histoire qui inspire ce parcours.",filmMeta:"Projet actuellement en développement."},
    es:{avail:"YA DISPONIBLE",trainingType:"ENTRENAMIENTO",training:"De la Papaya al Negocio",trainingDesc:"Entrenamiento de Emprendimiento · 3 meses · 300 horas.",trainingMeta:"Sistema S8 · actividades prácticas · encuentros en vivo · certificado.",access:"Acceder al entrenamiento",filmType:"PELÍCULA",film:"El Niño que Vendía Papayas",filmStatus:"EN PRODUCCIÓN",filmDesc:"Adaptación cinematográfica de la historia que inspira este recorrido.",filmMeta:"Proyecto actualmente en desarrollo."}
  };
  const TITLES={
    ebook:["A Coragem de Começar","The Courage to Start","Le Courage de Commencer","El Coraje de Empezar"],
    book:["O Menino que Vendia Mamão","The Boy Who Sold Papaya","Le Garçon qui Vendait des Papayes","El Niño que Vendía Papayas"]
  };
  function lang(){const k=(document.documentElement.lang||navigator.language||"pt").slice(0,2).toLowerCase();return COPY[k]?k:"pt"}
  function norm(v){return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim()}
  function matches(el,list){const t=norm(el.textContent);return list.some(x=>t.includes(norm(x)))}
  function visible(el){if(!el)return false;const s=getComputedStyle(el);if(s.display==="none"||s.visibility==="hidden")return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0}
  function candidates(list){return Array.from(document.querySelectorAll("h1,h2,h3,h4,h5")).filter(el=>matches(el,list))}
  function chain(el,limit=10){const out=[];let cur=el;for(let i=0;cur&&i<limit;i++,cur=cur.parentElement)out.push(cur);return out}
  function childUnder(ancestor,node){let cur=node;while(cur&&cur.parentElement!==ancestor)cur=cur.parentElement;return cur&&cur.parentElement===ancestor?cur:null}
  function findGrid(){
    const es=candidates(TITLES.ebook).sort((a,b)=>Number(visible(b))-Number(visible(a)));
    const bs=candidates(TITLES.book).sort((a,b)=>Number(visible(b))-Number(visible(a)));
    let best=null;
    for(const e of es){for(const b of bs){if(e===b)continue;const ea=chain(e,12),ba=chain(b,12);for(let i=0;i<ea.length;i++){const common=ea[i];const j=ba.indexOf(common);if(j<0)continue;const ec=childUnder(common,e),bc=childUnder(common,b);if(!ec||!bc||ec===bc)continue;const score=(visible(e)?1000:0)+(visible(b)?1000:0)-(i+j);if(!best||score>best.score)best={grid:common,ebookCard:ec,bookCard:bc,score};break;}}}
    return best;
  }
  function styles(){if(document.getElementById("ldr-extra-products-v4-css"))return;const s=document.createElement("style");s.id="ldr-extra-products-v4-css";s.textContent=`
    .ldr-extra-product-v4{display:flex!important;flex-direction:column!important;min-height:100%!important}
    .ldr-extra-product-v4 .ldr-x-status{display:inline-flex!important;align-items:center!important;justify-content:center!important;align-self:flex-start!important;border-radius:999px!important;padding:6px 11px!important;font-size:.72rem!important;font-weight:900!important;letter-spacing:.06em!important;margin-bottom:12px!important}
    .ldr-extra-product-v4 .ldr-x-status.available{background:#dcfce7!important;color:#166534!important;border:1px solid #86efac!important}
    .ldr-extra-product-v4 .ldr-x-status.production{background:#f3e4bd!important;color:#5b3a0c!important;border:1px solid #d6b056!important}
    .ldr-extra-product-v4 .ldr-x-type{font-size:.72rem!important;font-weight:900!important;letter-spacing:.14em!important;text-transform:uppercase!important;opacity:.8!important;margin-bottom:8px!important}
    .ldr-extra-product-v4 h3{margin:.2rem 0 .7rem!important;line-height:1.12!important}
    .ldr-extra-product-v4 p{margin:.35rem 0!important;line-height:1.55!important}
    .ldr-extra-product-v4 .ldr-x-meta{font-size:.9rem!important;opacity:.86!important}
    .ldr-extra-product-v4 .ldr-x-action{margin-top:auto!important;padding-top:18px!important}
    .ldr-extra-product-v4 .ldr-x-btn,.ldr-extra-product-v4 .ldr-x-disabled{display:flex!important;align-items:center!important;justify-content:center!important;min-height:44px!important;border-radius:10px!important;padding:10px 16px!important;font-weight:900!important;text-decoration:none!important}
    .ldr-extra-product-v4 .ldr-x-btn{background:#c99b4b!important;color:#26130b!important}
    .ldr-extra-product-v4 .ldr-x-disabled{border:1px solid rgba(201,155,75,.55)!important;opacity:.82!important}
  `;document.head.appendChild(s)}
  function fill(el,kind,t){
    el.dataset.ldrExtraCardV4=kind;
    el.classList.add("ldr-extra-product-v4");
    if(kind==="training")el.innerHTML=`<div class="ldr-x-status available">✅ ${t.avail}</div><div class="ldr-x-type">${t.trainingType}</div><h3>${t.training}</h3><p>${t.trainingDesc}</p><p class="ldr-x-meta">${t.trainingMeta}</p><div class="ldr-x-action"><a class="ldr-x-btn" href="${LIB}">${t.access}</a></div>`;
    else el.innerHTML=`<div class="ldr-x-status production">${t.filmStatus}</div><div class="ldr-x-type">${t.filmType}</div><h3>${t.film}</h3><p>${t.filmDesc}</p><p class="ldr-x-meta">${t.filmMeta}</p><div class="ldr-x-action"><span class="ldr-x-disabled" aria-disabled="true">${t.filmStatus}</span></div>`;
  }
  function make(template,kind,t){const el=template.cloneNode(false);el.removeAttribute("id");fill(el,kind,t);return el}
  function mount(){
    styles();
    const found=findGrid();if(!found)return false;
    const {grid,bookCard}=found,t=COPY[lang()];
    document.getElementById("ldr-extra-products-20260904")?.remove();
    document.querySelectorAll("[data-ldr-extra-card-v3]").forEach(el=>el.remove());
    let training=grid.querySelector('[data-ldr-extra-card-v4="training"]');
    let film=grid.querySelector('[data-ldr-extra-card-v4="film"]');
    if(!training){training=make(bookCard,"training",t);grid.insertBefore(training,bookCard.nextSibling)}else fill(training,"training",t);
    if(!film){film=make(bookCard,"film",t);grid.insertBefore(film,training.nextSibling)}else fill(film,"film",t);
    return true;
  }
  function start(){
    let tries=0,lastLang=lang();
    mount();
    const timer=setInterval(()=>{const now=lang();if(now!==lastLang){lastLang=now;mount()}else if(!document.querySelector('[data-ldr-extra-card-v4="training"]'))mount();if(++tries>120)clearInterval(timer)},250);
    window.addEventListener("hashchange",()=>setTimeout(mount,50));
    document.addEventListener("click",()=>setTimeout(()=>{if(!document.querySelector('[data-ldr-extra-card-v4="training"]'))mount()},50),true);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();