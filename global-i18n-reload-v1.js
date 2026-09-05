(function(){
  "use strict";
  const KEY="luciano.public.locale.v2";
  function norm(v){v=String(v||"").trim().toLowerCase().slice(0,2);return ["pt","en","fr","es"].includes(v)?v:"pt";}
  function start(){
    if(!document.getElementById("palestraView"))return;
    if(document.getElementById("ldr-public-i18n-v2-loader"))return;
    const s=document.createElement("script");
    s.id="ldr-public-i18n-v2-loader";
    s.src="./public-i18n-v2.js?v=20260905-lecture-only1";
    s.async=false;
    s.onload=function(){
      let lang="pt";
      try{lang=norm(localStorage.getItem(KEY)||document.documentElement.lang||navigator.language);}catch(e){lang=norm(document.documentElement.lang||navigator.language);}
      window.dispatchEvent(new CustomEvent("ldr:lecture-i18n-ready",{detail:{lang}}));
    };
    document.head.appendChild(s);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();