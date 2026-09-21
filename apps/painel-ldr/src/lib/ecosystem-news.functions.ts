import { createServerFn } from "@tanstack/react-start";

type Locale = "pt"|"en"|"fr"|"es";
export type EcosystemNewsItem={title:string;url:string;source:string;publishedAt:string};

const feeds:Record<Locale,string>={
 pt:"https://news.google.com/rss/search?q=empreendedorismo%20OR%20economia%20OR%20tecnologia%20OR%20pol%C3%ADtica&hl=pt-BR&gl=BR&ceid=BR:pt-419",
 en:"https://news.google.com/rss/search?q=entrepreneurship%20OR%20economy%20OR%20technology%20OR%20politics&hl=en-US&gl=US&ceid=US:en",
 fr:"https://news.google.com/rss/search?q=entrepreneuriat%20OR%20%C3%A9conomie%20OR%20technologie%20OR%20politique&hl=fr&gl=FR&ceid=FR:fr",
 es:"https://news.google.com/rss/search?q=emprendimiento%20OR%20econom%C3%ADa%20OR%20tecnolog%C3%ADa%20OR%20pol%C3%ADtica&hl=es&gl=ES&ceid=ES:es"
};
const decode=(s:string)=>s.replace(/<!\[CDATA\[|\]\]>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
const tag=(xml:string,name:string)=>decode(xml.match(new RegExp("<"+name+"[^>]*>([\\s\\S]*?)<\\/"+name+">","i"))?.[1]??"");

export const ecosystemNews=createServerFn({method:"GET"})
 .inputValidator((d:{locale?:Locale})=>d)
 .handler(async({data})=>{
   const locale=(data.locale&&feeds[data.locale]?data.locale:"pt") as Locale;
   try{
     const res=await fetch(feeds[locale],{headers:{"User-Agent":"LDR-Ecosystem-News/1.0"}});
     if(!res.ok) return [] as EcosystemNewsItem[];
     const xml=await res.text();
     return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0,8).map(m=>{
       const block=m[1], raw=tag(block,"title"), link=tag(block,"link"), publishedAt=tag(block,"pubDate");
       const parts=raw.split(" - "); const source=parts.length>1?(parts.pop()||""):"";
       return {title:parts.join(" - ")||raw,url:link,source,publishedAt};
     }).filter(x=>x.title&&x.url);
   }catch{return [] as EcosystemNewsItem[]}
 });