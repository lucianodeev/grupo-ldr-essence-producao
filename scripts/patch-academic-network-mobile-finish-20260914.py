from pathlib import Path

path = Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
text = path.read_text()

def rep(old: str, new: str):
    global text
    if old not in text:
        raise SystemExit(f'Expected pattern not found: {old[:120]!r}')
    text = text.replace(old, new, 1)

rep(
'  academicCreateComment, academicCreatePost, academicDeleteDiary, academicDeletePost, academicNetworkSnapshot,\n',
'  academicCreateComment, academicCreatePost, academicDeleteComment, academicDeleteDiary, academicDeletePost, academicNetworkSnapshot,\n'
)

rep(
'const roleLabel:Record<string,string>={member:"MEMBRO",student:"ALUNO",professor:"PROFESSOR",mentor:"MENTOR"};\n',
'const roleLabel:Record<string,string>={member:"MEMBRO",student:"ALUNO",professor:"PROFESSOR",mentor:"MENTOR"};\nconst reportReasonLabel:Record<string,string>={offensive:"conteúdo ofensivo",harassment:"assédio",hate:"discurso de ódio",privacy:"exposição indevida",spam:"spam",inappropriate:"conteúdo inadequado",other:"outro"};\nfunction askReportReason(){const raw=window.prompt("Motivo da denúncia: offensive, harassment, hate, privacy, spam, inappropriate ou other", "other");if(!raw)return null;const key=raw.trim().toLowerCase();return Object.prototype.hasOwnProperty.call(reportReasonLabel,key)?key:"other";}\n'
)

rep(
'  const snapshotFn=useServerFn(academicNetworkSnapshot), postFn=useServerFn(academicCreatePost), commentFn=useServerFn(academicCreateComment), updatePostFn=useServerFn(academicUpdatePost), updateCommentFn=useServerFn(academicUpdateComment), diaryFn=useServerFn(academicSaveDiary), deleteDiaryFn=useServerFn(academicDeleteDiary), saveFn=useServerFn(academicToggleSave), supportFn=useServerFn(academicToggleSupport), membershipFn=useServerFn(academicToggleMembership), profileFn=useServerFn(academicUpdateProfile), connectionFn=useServerFn(academicRequestConnection), respondFn=useServerFn(academicRespondConnection), reportFn=useServerFn(academicReport), deletePostFn=useServerFn(academicDeletePost);\n',
'  const snapshotFn=useServerFn(academicNetworkSnapshot), postFn=useServerFn(academicCreatePost), commentFn=useServerFn(academicCreateComment), updatePostFn=useServerFn(academicUpdatePost), updateCommentFn=useServerFn(academicUpdateComment), deleteCommentFn=useServerFn(academicDeleteComment), diaryFn=useServerFn(academicSaveDiary), deleteDiaryFn=useServerFn(academicDeleteDiary), saveFn=useServerFn(academicToggleSave), supportFn=useServerFn(academicToggleSupport), membershipFn=useServerFn(academicToggleMembership), profileFn=useServerFn(academicUpdateProfile), connectionFn=useServerFn(academicRequestConnection), respondFn=useServerFn(academicRespondConnection), reportFn=useServerFn(academicReport), deletePostFn=useServerFn(academicDeletePost);\n'
)

rep(
'  const post=simpleMutation((x)=>postFn({data:x})), updatePost=simpleMutation((x)=>updatePostFn({data:x})), comment=simpleMutation((x)=>commentFn({data:x})), updateComment=simpleMutation((x)=>updateCommentFn({data:x})), diary=simpleMutation((x)=>diaryFn({data:x})), delDiary=simpleMutation((id)=>deleteDiaryFn({data:{id}})), save=simpleMutation((postId)=>saveFn({data:{postId}})), support=simpleMutation((postId)=>supportFn({data:{postId}})), member=simpleMutation((communityId)=>membershipFn({data:{communityId}})), profile=simpleMutation((x)=>profileFn({data:x})), connect=simpleMutation((targetProfileId)=>connectionFn({data:{targetProfileId}})), respond=simpleMutation((x)=>respondFn({data:x})), report=simpleMutation((x)=>reportFn({data:x})), delPost=simpleMutation((id)=>deletePostFn({data:{id}}));\n',
'  const post=simpleMutation((x)=>postFn({data:x})), updatePost=simpleMutation((x)=>updatePostFn({data:x})), comment=simpleMutation((x)=>commentFn({data:x})), updateComment=simpleMutation((x)=>updateCommentFn({data:x})), delComment=simpleMutation((id)=>deleteCommentFn({data:{id}})), diary=simpleMutation((x)=>diaryFn({data:x})), delDiary=simpleMutation((id)=>deleteDiaryFn({data:{id}})), save=simpleMutation((postId)=>saveFn({data:{postId}})), support=simpleMutation((postId)=>supportFn({data:{postId}})), member=simpleMutation((communityId)=>membershipFn({data:{communityId}})), profile=simpleMutation((x)=>profileFn({data:x})), connect=simpleMutation((targetProfileId)=>connectionFn({data:{targetProfileId}})), respond=simpleMutation((x)=>respondFn({data:x})), report=simpleMutation((x)=>reportFn({data:x})), delPost=simpleMutation((id)=>deletePostFn({data:{id}}));\n'
)

rep(
'    {(tab==="feed"||tab==="saved")&&<Feed data={data} search={search} setSearch={setSearch} communityId={communityId} setCommunityId={setCommunityId} premium={access.premium} post={post} comment={comment} save={save} support={support} connect={connect} report={report} delPost={delPost} updatePost={updatePost} updateComment={updateComment} savedOnly={tab==="saved"}/>} \n',
'    {(tab==="feed"||tab==="saved")&&<Feed data={data} search={search} setSearch={setSearch} communityId={communityId} setCommunityId={setCommunityId} premium={access.premium} post={post} comment={comment} save={save} support={support} connect={connect} report={report} delPost={delPost} delComment={delComment} updatePost={updatePost} updateComment={updateComment} savedOnly={tab==="saved"}/>} \n'
)

rep(
'function Feed({data,search,setSearch,communityId,setCommunityId,premium,post,comment,save,support,connect,report,delPost,updatePost,updateComment,savedOnly}:any){\n',
'function Feed({data,search,setSearch,communityId,setCommunityId,premium,post,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,savedOnly}:any){\n'
)

rep(
'className="mt-3 flex flex-wrap gap-2"',
'className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap"'
)
rep(
'className="rounded-xl border bg-background px-3 py-2 text-xs"',
'className="min-w-0 w-full rounded-xl border bg-background px-3 py-2 text-xs sm:w-auto"'
)
rep(
'className="rounded-xl border bg-background px-3 py-2 text-xs"><option value="">Comunidade Geral</option>',
'className="min-w-0 w-full rounded-xl border bg-background px-3 py-2 text-xs sm:max-w-[240px] sm:w-auto"><option value="">Comunidade Geral</option>'
)
rep(
'className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"',
'className="flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:w-auto"'
)
rep(
'className="ml-auto rounded-xl bg-[#071426] px-4 py-2 text-xs font-black text-white disabled:opacity-40"',
'className="w-full rounded-xl bg-[#071426] px-4 py-2 text-xs font-black text-white disabled:opacity-40 sm:ml-auto sm:w-auto"'
)

rep(
'className="flex items-start justify-between gap-3"',
'className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"'
)
rep(
'className="flex gap-2"><button onClick={()=>{const next=window.prompt("Editar publicação",p.body);',
'className="flex flex-wrap gap-2"><button onClick={()=>{const next=window.prompt("Editar publicação",p.body);'
)
rep(
'className="mt-4 flex flex-wrap gap-3 border-t pt-3 text-xs"',
'className="mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-xs sm:flex sm:flex-wrap sm:gap-3"'
)
rep(
'className="flex items-center gap-1 font-bold"><HeartHandshake',
'className="min-w-0 rounded-lg px-2 py-2 text-left font-bold hover:bg-muted/60 disabled:opacity-40"><span className="flex items-center gap-1"><HeartHandshake'
)
rep(
'{p.supported?"Acolhido":"Acolher"} · {p.supportCount}</button>',
'{p.supported?"Acolhido":"Acolher"} · {p.supportCount}</span></button>'
)
rep(
'className="flex items-center gap-1 font-bold"><Bookmark',
'className="min-w-0 rounded-lg px-2 py-2 text-left font-bold hover:bg-muted/60 disabled:opacity-40"><span className="flex items-center gap-1"><Bookmark'
)
rep(
'{p.saved?"Salvo":"Salvar"}</button>',
'{p.saved?"Salvo":"Salvar"}</span></button>'
)
rep(
'className="flex items-center gap-1 font-bold"><Network',
'className="min-w-0 rounded-lg px-2 py-2 text-left font-bold hover:bg-muted/60"><span className="flex items-center gap-1"><Network'
)
rep(
'<Network className="h-4 w-4"/>Conectar</button>',
'<Network className="h-4 w-4"/>Conectar</span></button>'
)
rep(
'<button disabled={!premium} onClick={()=>report.mutate({postId:p.id,reason:"other",details:"Denúncia enviada pela interface da Rede Acadêmica."})} className="ml-auto flex items-center gap-1 text-muted-foreground"><Shield className="h-4 w-4"/>Denunciar</button>',
'<button disabled={!premium} onClick={()=>{const reason=askReportReason();if(reason)report.mutate({postId:p.id,reason,details:`Denúncia enviada pela interface: ${reportReasonLabel[reason]}.`})}} className="min-w-0 rounded-lg px-2 py-2 text-left text-muted-foreground hover:bg-muted/60 disabled:opacity-40 sm:ml-auto"><span className="flex items-center gap-1"><Shield className="h-4 w-4"/>Denunciar</span></button>'
)

rep(
'{c.own&&<div className="mt-2 flex gap-2"><button onClick={()=>{const next=window.prompt("Editar comentário",c.body);if(next&&next.trim()&&next.trim()!==c.body)updateComment.mutate({id:c.id,body:next})}} className="text-[10px] font-bold text-muted-foreground">Editar</button></div>}',
'{c.own&&<div className="mt-2 flex flex-wrap gap-3"><button onClick={()=>{const next=window.prompt("Editar comentário",c.body);if(next&&next.trim()&&next.trim()!==c.body)updateComment.mutate({id:c.id,body:next})}} className="text-[10px] font-bold text-muted-foreground">Editar</button><button onClick={()=>confirm("Excluir este comentário?")&&delComment.mutate(c.id)} className="text-[10px] font-bold text-destructive">Excluir</button></div>}'
)
rep(
'{premium&&<div className="flex gap-2"><input',
'{premium&&<div className="grid grid-cols-1 gap-2 sm:flex sm:items-center"><input'
)
rep(
'className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm"',
'className="min-w-0 w-full flex-1 rounded-xl border bg-background px-3 py-2 text-sm"'
)
rep(
'className="flex items-center gap-1 text-[10px]"',
'className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] sm:border-0 sm:px-0 sm:py-0"'
)
rep(
'className="rounded-xl bg-[#071426] px-3 py-2 text-white"><MessageCircle',
'className="flex w-full items-center justify-center rounded-xl bg-[#071426] px-3 py-2 text-white sm:w-auto"><MessageCircle'
)

path.write_text(text)
print('Academic network mobile/final UX patch applied safely.')
