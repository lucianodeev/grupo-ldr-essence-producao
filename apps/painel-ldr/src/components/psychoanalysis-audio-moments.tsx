import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type LessonLike={title:string;summary?:string};
type ModuleLike={title:string;focus:string;lessons:LessonLike[]};
type AudioMoment={key:"opening"|"deepening"|"closing";title:string;eyebrow:string;description:string;transcript:string;position:number};

function buildMoments(moduleIndex:number,module:ModuleLike):AudioMoment[]{
 const total=module.lessons.length;
 const middle=Math.max(0,Math.floor((total-1)/2));
 const first=module.lessons[0]?.title??module.title;
 const mid=module.lessons[middle]?.title??module.title;
 const last=module.lessons[total-1]?.title??module.title;
 const n=moduleIndex+1;
 const common=`Você está no módulo ${n}, ${module.title}. O eixo central deste módulo é: ${module.focus}`;
 return [
  {key:"opening",position:0,eyebrow:"Áudio 1 · Abertura e contextualização",title:`Como entrar no tema: ${module.title}`,description:"Uma introdução falada para situar o eixo do módulo antes de aprofundar as aulas.",transcript:`${common}. Antes de começar, procure não transformar os conceitos em definições isoladas. A proposta é acompanhar como cada ideia se articula à história da Psicanálise, à teoria e à escuta clínica. A primeira aula, ${first}, oferece uma porta de entrada para esse percurso. Enquanto estuda, observe três perguntas: de que problema clínico ou teórico este conceito nasceu; o que ele ajuda a compreender; e quais são os seus limites. Em Psicanálise, um conceito ganha força quando é lido em relação com outros conceitos e com o contexto em que foi produzido. Use este módulo como um exercício de investigação. Faça anotações, registre dúvidas e compare formulações. Não procure respostas rápidas. Procure relações, diferenças e tensões. Ao longo das aulas, volte ao eixo do módulo e pergunte o que mudou na sua compreensão desde o início.`,},
  {key:"deepening",position:middle,eyebrow:"Áudio 2 · Aprofundamento psicanalítico",title:`Aprofundamento: ${mid}`,description:"Um comentário de aprofundamento para conectar conceito, método e leitura clínica.",transcript:`${common}. Neste ponto do percurso, vale aprofundar especialmente o tema ${mid}. Em vez de usar a teoria como rótulo, trate-a como instrumento de leitura. Uma hipótese psicanalítica precisa permanecer aberta à revisão, porque o material clínico é singular e pode contrariar expectativas teóricas. Quando um conceito parece explicar tudo, é um bom momento para perguntar o que ele deixa de fora. Na clínica, diferencie sempre fato, relato, interpretação e hipótese. Uma fala do paciente não possui um significado universal. O trabalho analítico acompanha associações, repetições, deslocamentos, silêncios e efeitos da transferência ao longo do tempo. Também é importante reconhecer limites éticos: Psicanálise não substitui avaliação médica, psiquiátrica, psicológica ou multiprofissional quando essas competências são necessárias. O aprofundamento teórico deve aumentar a precisão da escuta, e não a certeza do analista. Ao retomar as aulas deste módulo, identifique quais elementos sustentam uma interpretação e quais ainda precisam permanecer como pergunta.`,},
  {key:"closing",position:Math.max(0,total-1),eyebrow:"Áudio 3 · Síntese e reflexão",title:`Síntese do módulo: ${module.title}`,description:"Revisão falada dos pontos centrais e perguntas para consolidar a aprendizagem.",transcript:`${common}. Ao chegar à síntese, retome o percurso que começou em ${first}, passou por ${mid} e chega a ${last}. O objetivo não é apenas lembrar termos, mas perceber como sua forma de pensar a Psicanálise se tornou mais precisa. Faça uma síntese com suas próprias palavras e diferencie o que você compreendeu, o que ainda considera hipótese e o que precisa estudar novamente. Para concluir, reflita sobre três perguntas. Primeira: qual ideia deste módulo mais modificou sua maneira de compreender o sujeito ou a clínica? Segunda: que risco aparece quando este conceito é aplicado de modo rígido ou fora de contexto? Terceira: como você explicaria o eixo deste módulo a outro estudante sem transformar a teoria em diagnóstico ou verdade absoluta? Guarde suas respostas. Elas podem servir de base para a atividade do módulo, para o fórum e para a supervisão. A formação psicanalítica é construída pela repetição da leitura, pela análise pessoal, pela supervisão e pela disposição para revisar o próprio modo de escutar.`,},
 ];
}

function pickPortugueseVoice(){
 const voices=window.speechSynthesis.getVoices();
 const pt=voices.filter(v=>/^pt(-|_)?/i.test(v.lang)||/portugu/i.test(v.name));
 const preferred=pt.find(v=>/carlos|pedro|yuri|male|mascul/i.test(v.name));
 return preferred??pt[0]??voices.find(v=>/^pt/i.test(v.lang))??null;
}

function AudioCard({moment}:{moment:AudioMoment}){
 const [playing,setPlaying]=useState(false);
 const [paused,setPaused]=useState(false);
 const [rate,setRate]=useState(0.9);
 const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null);
 useEffect(()=>()=>{if(typeof window!=="undefined")window.speechSynthesis.cancel();},[]);
 const play=()=>{
  if(typeof window==="undefined"||!("speechSynthesis" in window))return;
  if(paused){window.speechSynthesis.resume();setPaused(false);setPlaying(true);return;}
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(moment.transcript);
  u.lang="pt-BR";u.rate=rate;u.pitch=0.9;u.volume=1;
  const voice=pickPortugueseVoice();if(voice)u.voice=voice;
  u.onend=()=>{setPlaying(false);setPaused(false);};
  u.onerror=()=>{setPlaying(false);setPaused(false);};
  utteranceRef.current=u;window.speechSynthesis.speak(u);setPlaying(true);setPaused(false);
 };
 const pause=()=>{if(typeof window==="undefined")return;window.speechSynthesis.pause();setPlaying(false);setPaused(true);};
 const stop=()=>{if(typeof window==="undefined")return;window.speechSynthesis.cancel();setPlaying(false);setPaused(false);};
 const changeRate=(next:number)=>{setRate(next);if(playing||paused){stop();}};
 return <section id="audio-complementar" className="scroll-mt-24 rounded-[24px] border border-[#d9c77f] bg-gradient-to-br from-[#fffaf0] to-white p-5 shadow-sm sm:p-6">
  <div className="flex items-start gap-3"><div className="rounded-2xl bg-[#2f1457] p-3 text-[#e0c16f]"><Volume2 className="h-5 w-5"/></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8a6816]">🎧 {moment.eyebrow}</p><h3 className="mt-1 font-serif text-xl font-bold text-[#2f1457]">{moment.title}</h3><p className="mt-1 text-sm leading-6 text-[#6c5c72]">{moment.description}</p></div></div>
  <div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" onClick={playing?pause:play} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5b2b86] px-4 py-2 text-sm font-black text-white">{playing?<><Pause className="h-4 w-4"/>Pausar</>:<><Play className="h-4 w-4"/>{paused?"Continuar":"Ouvir áudio"}</>}</button><button type="button" onClick={stop} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8c9e3] px-4 py-2 text-sm font-bold text-[#5b2b86]"><RotateCcw className="h-4 w-4"/>Reiniciar</button><label className="ml-auto flex items-center gap-2 text-xs font-bold text-[#6c5c72]">Velocidade<select value={rate} onChange={e=>changeRate(Number(e.target.value))} className="rounded-lg border border-[#d8c9e3] bg-white px-2 py-2 text-xs"><option value={0.75}>0,75x</option><option value={0.9}>0,9x</option><option value={1}>1x</option><option value={1.25}>1,25x</option><option value={1.5}>1,5x</option><option value={2}>2x</option></select></label></div>
  <p className="mt-3 text-[11px] leading-5 text-[#85788c]">Narração complementar. Não altera o progresso nem a carga horária da formação.</p>
  <details className="mt-4 rounded-xl border border-[#eadba9] bg-white p-3"><summary className="cursor-pointer text-sm font-black text-[#5b2b86]">Ler transcrição</summary><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#64596b]">{moment.transcript}</p></details>
 </section>;
}

export function PsychoanalysisAudioMoments({moduleIndex,module,lessonIndex}:{moduleIndex:number;module:ModuleLike;lessonIndex:number}){
 const moments=useMemo(()=>buildMoments(moduleIndex,module),[moduleIndex,module]);
 const visible=moments.filter(m=>m.position===lessonIndex);
 const audioLessons=moments.map(m=>m.position+1);
 const label=[...new Set(audioLessons)].join(", ");
 return <>
  <div className="fixed bottom-4 right-4 z-[60] max-w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6">
   {visible.length?<a href="#audio-complementar" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e0c16f] bg-[#2f1457] px-4 py-2 text-xs font-black text-white shadow-xl">🎧 ÁUDIO DISPONÍVEL</a>:<div className="rounded-full border border-[#d9c77f] bg-[#fffaf0] px-4 py-2 text-[11px] font-black text-[#5b2b86] shadow-lg">🎧 ÁUDIO · aulas {label}</div>}
  </div>
  {visible.length?<div className="space-y-4">{visible.map(m=><AudioCard key={m.key} moment={m}/>)}</div>:null}
 </>;
}
