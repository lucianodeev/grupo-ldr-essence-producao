(function(){
  "use strict";
  const SUPPORTED=["pt","en","fr","es"];
  const norm=v=>{v=String(v||"").trim().toLowerCase().slice(0,2);return SUPPORTED.includes(v)?v:"";};
  let navigating=false;

  function queryLang(){
    try{return norm(new URLSearchParams(location.search).get("lang"));}catch(e){return "";}
  }
  function go(lang){
    lang=norm(lang);if(!lang||navigating)return;
    const current=queryLang();
    try{localStorage.setItem("luciano.public.locale.v2",lang);localStorage.setItem("lucianoLang",lang);localStorage.setItem("ldr-language",lang);}catch(e){}
    if(current===lang)return;
    navigating=true;
    const u=new URL(location.href);
    u.searchParams.set("lang",lang);
    location.replace(u.pathname+u.search+u.hash);
  }

  function bindReloadLanguage(){
    document.addEventListener("click",function(e){
      const p=e.target.closest&&e.target.closest(".ldr-public-lang-button[data-lang]");
      if(p){e.preventDefault();e.stopImmediatePropagation();go(p.dataset.lang);return;}
      const b=e.target.closest&&e.target.closest("#langBtn");
      if(b){setTimeout(()=>{const v=norm(b.textContent);if(v)go(v);},40);}
    },true);
    document.addEventListener("change",function(e){
      const el=e.target;if(!el)return;
      if(el.id==="langSelectLibrary"||el.id==="ldrLectureLanguage"||el.matches?.("select.language-select,select[data-language-select]")){go(el.value);}
    },true);
  }

  function loadGlobalTranslator(){
    const site=document.getElementById("site");
    const lecture=document.getElementById("palestraView");
    if(!site)return;
    const siteOld=site.id;
    const lectureOld=lecture?lecture.id:"";
    if(lecture)lecture.id="palestraView-original-runtime";
    site.id="palestraView";
    document.querySelectorAll(".ldr-public-language-switcher").forEach(el=>el.remove());
    const s=document.createElement("script");
    s.src="./public-i18n-v2.js?v=20260905-global-full1";
    s.async=false;
    s.onload=s.onerror=function(){
      site.id=siteOld;
      if(lecture)lecture.id=lectureOld;
      document.dispatchEvent(new CustomEvent("ldr:global-i18n-ready",{detail:{lang:queryLang()||"pt"}}));
    };
    document.head.appendChild(s);
  }

  function start(){
    bindReloadLanguage();
    const q=queryLang();
    if(q){try{localStorage.setItem("luciano.public.locale.v2",q);localStorage.setItem("lucianoLang",q);localStorage.setItem("ldr-language",q);}catch(e){}}
    loadGlobalTranslator();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
