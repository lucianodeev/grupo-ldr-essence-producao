(function(){
  "use strict";

  const TID="ldrTrainingSalesCardFinal";
  const FID="ldrFilmSalesCardFinal";
  const KEY="luciano.public.locale.v2";

  const COPY={
    pt:{
      available:"JÁ DISPONÍVEL",
      type:"TREINAMENTO PARA EMPREENDEDORISMO",
      subtitle:"Treinamento para Empreendedorismo",
      items:[
        "3 meses · 300 horas",
        "4 encontros ao vivo",
        "Certificado de conclusão",
        "Projeto prático para aplicar no seu negócio",
        "Acesso pela Biblioteca do Cliente",
        "Pagamento único",
        "Acesso individual"
      ],
      button:"Acessar Biblioteca do Cliente",
      filmStatus:"EM PRODUÇÃO",
      filmType:"FILME",
      filmDesc:"Uma história que está ganhando vida nas telas. Produção em desenvolvimento.",
      filmNote:"Novidades serão divulgadas em breve."
    },
    en:{
      available:"AVAILABLE NOW",
      type:"ENTREPRENEURSHIP TRAINING",
      subtitle:"Entrepreneurship Training",
      items:[
        "3 months · 300 hours",
        "4 live sessions",
        "Certificate of completion",
        "Practical project to apply to your business",
        "Access through the Client Library",
        "One-time payment",
        "Individual access"
      ],
      button:"Access Client Library",
      filmStatus:"IN PRODUCTION",
      filmType:"FILM",
      filmDesc:"A story coming to life on screen. Production in development.",
      filmNote:"Updates will be announced soon."
    },
    fr:{
      available:"DÉJÀ DISPONIBLE",
      type:"FORMATION EN ENTREPRENEURIAT",
      subtitle:"Formation en entrepreneuriat",
      items:[
        "3 mois · 300 heures",
        "4 rencontres en direct",
        "Certificat de fin de formation",
        "Projet pratique à appliquer à votre entreprise",
        "Accès via la Bibliothèque Client",
        "Paiement unique",
        "Accès individuel"
      ],
      button:"Accéder à la Bibliothèque Client",
      filmStatus:"EN PRODUCTION",
      filmType:"FILM",
      filmDesc:"Une histoire qui prend vie à l’écran. Production en développement.",
      filmNote:"Les nouveautés seront annoncées prochainement."
    },
    es:{
      available:"YA DISPONIBLE",
      type:"ENTRENAMIENTO PARA EMPRENDIMIENTO",
      subtitle:"Entrenamiento para Emprendimiento",
      items:[
        "3 meses · 300 horas",
        "4 encuentros en vivo",
        "Certificado de finalización",
        "Proyecto práctico para aplicar en tu negocio",
        "Acceso mediante la Biblioteca del Cliente",
        "Pago único",
        "Acceso individual"
      ],
      button:"Acceder a la Biblioteca del Cliente",
      filmStatus:"EN PRODUCCIÓN",
      filmType:"PELÍCULA",
      filmDesc:"Una historia que está cobrando vida en la pantalla. Producción en desarrollo.",
      filmNote:"Las novedades se anunciarán próximamente."
    }
  };

  function locale(){
    let value="";
    try{value=localStorage.getItem(KEY)||"";}catch(e){}
    if(COPY[value]) return value;
    value=(document.documentElement.lang||"").slice(0,2).toLowerCase();
    return COPY[value]?value:"pt";
  }

  function applyItems(ul,items){
    if(!ul) return;
    const lis=ul.querySelectorAll("li");
    if(lis.length!==items.length){
      ul.replaceChildren(...items.map(function(text){
        const li=document.createElement("li");
        li.textContent=text;
        return li;
      }));
      return;
    }
    items.forEach(function(text,index){
      if(lis[index].textContent!==text) lis[index].textContent=text;
    });
  }

  function apply(){
    const copy=COPY[locale()];
    const training=document.getElementById(TID);
    if(training){
      const badge=training.querySelector(".ldr-product-available,.tag");
      if(badge&&badge.textContent!==copy.available) badge.textContent=copy.available;
      const type=training.querySelector(".ldr-product-type");
      if(type&&type.textContent!==copy.type) type.textContent=copy.type;
      const strong=training.querySelector("p strong");
      if(strong&&strong.textContent!==copy.subtitle) strong.textContent=copy.subtitle;
      applyItems(training.querySelector("ul"),copy.items);
      const button=training.querySelector("a.btn");
      if(button&&button.textContent!==copy.button) button.textContent=copy.button;
    }

    const film=document.getElementById(FID);
    if(film){
      const badge=film.querySelector(".ldr-film-production,.tag");
      if(badge&&badge.textContent!==copy.filmStatus) badge.textContent=copy.filmStatus;
      const type=film.querySelector(".ldr-product-type");
      if(type&&type.textContent!==copy.filmType) type.textContent=copy.filmType;
      const description=film.querySelector(".ldr-film-description");
      if(description&&description.textContent!==copy.filmDesc) description.textContent=copy.filmDesc;
      const note=film.querySelector(".ldr-film-note");
      if(note&&note.textContent!==copy.filmNote) note.textContent=copy.filmNote;
    }
  }

  let queued=false;
  const observer=new MutationObserver(function(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(function(){
      queued=false;
      apply();
    });
  });

  function start(){
    apply();
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("storage",apply);
    setInterval(apply,500);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();
