import { useMemo, useState } from "react";

type AcademicThreadedCommentsProps={
 postId:string;
 comments:any[];
 premium:boolean;
 comment:any;
 updateComment:any;
 delComment:any;
 t:any;
 locale:string;
};

const LABELS={
 pt:{reply:"Responder",replyTo:"Respondendo a",cancel:"Cancelar",placeholder:"Escreva uma resposta…"},
 en:{reply:"Reply",replyTo:"Replying to",cancel:"Cancel",placeholder:"Write a reply…"},
 fr:{reply:"Répondre",replyTo:"Réponse à",cancel:"Annuler",placeholder:"Écrivez une réponse…"},
 es:{reply:"Responder",replyTo:"Respondiendo a",cancel:"Cancelar",placeholder:"Escribe una respuesta…"},
} as const;

export function AcademicThreadedComments({postId,comments,premium,comment,updateComment,delComment,t,locale}:AcademicThreadedCommentsProps){
 const l=(locale==="en"||locale==="fr"||locale==="es"?locale:"pt") as keyof typeof LABELS;
 const labels=LABELS[l];
 const [replyTarget,setReplyTarget]=useState<any|null>(null);
 const [replyBody,setReplyBody]=useState("");
 const childrenByParent=useMemo(()=>{const map=new Map<string,any[]>();for(const item of comments??[]){if(!item.parent_comment_id)continue;const list=map.get(item.parent_comment_id)??[];list.push(item);map.set(item.parent_comment_id,list)}return map},[comments]);
 const roots=useMemo(()=>{const ids=new Set((comments??[]).map((x:any)=>x.id));return (comments??[]).filter((x:any)=>!x.parent_comment_id||!ids.has(x.parent_comment_id))},[comments]);
 const beginReply=(item:any)=>{setReplyTarget(item);const username=item.author?.anonymous?"":item.author?.username;setReplyBody(username?`@${username} `:"")};
 const submitReply=()=>{const body=replyBody.trim();if(!body||!replyTarget||comment.isPending)return;comment.mutate({postId,body,anonymous:false,parentCommentId:replyTarget.id},{onSuccess:()=>{setReplyTarget(null);setReplyBody("")}})};
 const renderComment=(item:any,depth=0):any=>{const children=childrenByParent.get(item.id)??[];const indent=depth>0&&depth<=2;return <div key={item.id} className={indent?"min-w-0 max-w-full ml-4 border-l pl-3 sm:ml-7":"min-w-0 max-w-full"}><div className="rounded-xl bg-muted/40 p-3"><div className="flex items-start gap-2">{item.author?.avatarUrl?<img src={item.author.avatarUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover"/>:<span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background text-[9px] font-black">{String(item.author?.name||"M").slice(0,1)}</span>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><b className="min-w-0 max-w-full [overflow-wrap:anywhere] text-[10px]">{item.author?.name||"Membro LDR"}</b>{item.own&&<span className="flex flex-wrap gap-1"><button type="button" onClick={()=>{const n=window.prompt(t.edit,item.body);if(n?.trim()&&n.trim()!==item.body)updateComment.mutate({id:item.id,body:n.trim()})}} className="px-1 text-[9px] font-bold">{t.edit}</button><button type="button" onClick={()=>confirm(t.remove+"?")&&delComment.mutate(item.id)} className="px-1 text-[9px] font-bold text-destructive">{t.remove}</button></span>}</div><p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-xs leading-5">{item.body}</p><div className="mt-1 flex items-center gap-2"><button type="button" disabled={!premium} onClick={()=>beginReply(item)} className="min-h-7 text-[9px] font-black text-[#315b80] disabled:opacity-40">{labels.reply}</button></div></div></div></div>{replyTarget?.id===item.id&&premium&&<div className="mt-2 rounded-xl border bg-card p-2"><div className="mb-1 flex flex-wrap items-center justify-between gap-2"><span className="min-w-0 max-w-full [overflow-wrap:anywhere] text-[9px] text-muted-foreground">{labels.replyTo} {item.author?.name||"Membro LDR"}</span><button type="button" onClick={()=>{setReplyTarget(null);setReplyBody("")}} className="text-[9px] font-black">{labels.cancel}</button></div><div className="flex gap-2"><input autoFocus aria-label={labels.placeholder} value={replyBody} onChange={e=>setReplyBody(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();submitReply()}}} placeholder={labels.placeholder} className="min-h-10 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm"/><button type="button" disabled={!replyBody.trim()||comment.isPending} onClick={submitReply} className="rounded-xl bg-[#07315a] px-3 text-[10px] font-black text-white disabled:opacity-40">OK</button></div>{comment.error&&<p className="mt-1 [overflow-wrap:anywhere] text-[10px] text-destructive">{String(comment.error?.message||comment.error)}</p>}</div>}{children.length>0&&<div className="mt-2 space-y-2">{children.map((child:any)=>renderComment(child,depth+1))}</div>}</div>};
 if(!comments?.length)return null;
 return <div className="min-w-0 max-w-full mt-3 space-y-2 border-t pt-3">{roots.slice(0,3).map((item:any)=>renderComment(item))}</div>;
}
