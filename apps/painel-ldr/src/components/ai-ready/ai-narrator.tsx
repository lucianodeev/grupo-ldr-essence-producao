import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, RotateCcw } from "lucide-react";

type Props={text:string; label?:string; compact?:boolean};

export function AiNarrator({text,label="Ouvir com a IA",compact=false}:Props){
 const [speaking,setSpeaking]=useState(false);
 const [paused,setPaused]=useState(false);
 const utterance=useRef<SpeechSynthesisUtterance|null>(null);
 useEffect(()=>()=>{if(typeof window!=="undefined")window.speechSynthesis?.cancel()},[]);
 const start=()=>{
  if(typeof window==="undefined"||!("speechSynthesis" in window))return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="pt-BR"; u.rate=.96; u.pitch=1;
  const voices=window.speechSynthesis.getVoices();
  const pt=voices.find(v=>v.lang.toLowerCase().startsWith("pt"));
  if(pt)u.voice=pt;
  u.onend=()=>{setSpeaking(false);setPaused(false)};
  u.onerror=()=>{setSpeaking(false);setPaused(false)};
  utterance.current=u; setSpeaking(true);setPaused(false);window.speechSynthesis.speak(u);
 };
 const toggle=()=>{
  if(!speaking)return start();
  if(paused){window.speechSynthesis.resume();setPaused(false)}
  else{window.speechSynthesis.pause();setPaused(true)}
 };
 const restart=()=>{window.speechSynthesis.cancel();setSpeaking(false);setPaused(false);setTimeout(start,50)};
 return <div className={compact?"flex flex-wrap items-center gap-2":"mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3"}>
  <button type="button" onClick={toggle} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0b2341] px-4 text-sm font-black text-white">{speaking&&!paused?<Pause className="h-4 w-4"/>:<Volume2 className="h-4 w-4"/>}{speaking?(paused?"Continuar":"Pausar"):label}</button>
  {speaking&&<button type="button" onClick={restart} aria-label="Reiniciar narração" className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold text-[#0b2341]"><RotateCcw className="h-4 w-4"/>Reiniciar</button>}
  {!compact&&<span className="text-xs text-slate-500">Narração disponível no dispositivo.</span>}
 </div>
}
