from pathlib import Path

p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.perfil.$username.tsx')
s=p.read_text()

def once(old,new,label):
 global s
 n=s.count(old)
 if n!=1: raise SystemExit(f'{label}: expected 1 match, found {n}')
 s=s.replace(old,new,1)

once('import { Bookmark, BookOpen, HeartHandshake, MapPin, Share2, UserPlus } from "lucide-react";','import { Bookmark, BookOpen, HeartHandshake, MapPin, MessageCircle, Share2, UserPlus } from "lucide-react";','dm icon')
once('import { academicSocialProfile, academicToggleFollow } from "@/lib/academic-social-v2.functions";','import { academicSocialProfile, academicToggleFollow } from "@/lib/academic-social-v2.functions";\nimport { academicDmOpen } from "@/lib/academic-dm.functions";','dm function import')
once('pt:{loading:"Carregando perfil acadêmico…",unavailable:"Perfil não disponível.",network:"REDE ACADÊMICA",following:"SEGUINDO",follow:"SEGUIR",share:"COMPARTILHAR PERFIL",','pt:{loading:"Carregando perfil acadêmico…",unavailable:"Perfil não disponível.",network:"REDE ACADÊMICA",following:"SEGUINDO",follow:"SEGUIR",message:"MENSAGEM",share:"COMPARTILHAR PERFIL",','pt message')
once('en:{loading:"Loading academic profile…",unavailable:"Profile unavailable.",network:"ACADEMIC NETWORK",following:"FOLLOWING",follow:"FOLLOW",share:"SHARE PROFILE",','en:{loading:"Loading academic profile…",unavailable:"Profile unavailable.",network:"ACADEMIC NETWORK",following:"FOLLOWING",follow:"FOLLOW",message:"MESSAGE",share:"SHARE PROFILE",','en message')
once('fr:{loading:"Chargement du profil académique…",unavailable:"Profil indisponible.",network:"RÉSEAU ACADÉMIQUE",following:"SUIVI",follow:"SUIVRE",share:"PARTAGER LE PROFIL",','fr:{loading:"Chargement du profil académique…",unavailable:"Profil indisponible.",network:"RÉSEAU ACADÉMIQUE",following:"SUIVI",follow:"SUIVRE",message:"MESSAGE",share:"PARTAGER LE PROFIL",','fr message')
once('es:{loading:"Cargando perfil académico…",unavailable:"Perfil no disponible.",network:"RED ACADÉMICA",following:"SIGUIENDO",follow:"SEGUIR",share:"COMPARTIR PERFIL",','es:{loading:"Cargando perfil académico…",unavailable:"Perfil no disponible.",network:"RED ACADÉMICA",following:"SIGUIENDO",follow:"SEGUIR",message:"MENSAJE",share:"COMPARTIR PERFIL",','es message')
once('const {username}=Route.useParams();const qc=useQueryClient();const getProfile=useServerFn(academicSocialProfile),toggleFollow=useServerFn(academicToggleFollow);const [tab,setTab]=useState<Tab>("posts");','const {username}=Route.useParams();const qc=useQueryClient();const getProfile=useServerFn(academicSocialProfile),toggleFollow=useServerFn(academicToggleFollow),openDm=useServerFn(academicDmOpen);const [tab,setTab]=useState<Tab>("posts");','dm hook')
once('const follow=useMutation({mutationFn:(id:string)=>toggleFollow({data:{targetProfileId:id}}),onSuccess:()=>qc.invalidateQueries({queryKey:["academic-social-profile",username]})});','const follow=useMutation({mutationFn:(id:string)=>toggleFollow({data:{targetProfileId:id}}),onSuccess:()=>qc.invalidateQueries({queryKey:["academic-social-profile",username]})});\n  const message=useMutation({mutationFn:(id:string)=>openDm({data:{targetProfileId:id}}),onSuccess:()=>window.location.assign("/cliente/rede-academica/chat")});','dm mutation')
old='''{!p.own&&<button disabled={follow.isPending} onClick={()=>follow.mutate(p.id)} className={`min-h-11 rounded-xl px-4 text-xs font-black ${p.followed?"border bg-background":"bg-[#07315a] text-white"}`}><UserPlus className="mr-2 inline h-4 w-4"/>{p.followed?t.following:t.follow}</button>}<button onClick={share} className="min-h-11 rounded-xl border px-4 text-xs font-black"><Share2 className="mr-2 inline h-4 w-4"/>{t.share}</button>'''
new='''{!p.own&&<button disabled={follow.isPending} onClick={()=>follow.mutate(p.id)} className={`min-h-11 rounded-xl px-4 text-xs font-black ${p.followed?"border bg-background":"bg-[#07315a] text-white"}`}><UserPlus className="mr-2 inline h-4 w-4"/>{p.followed?t.following:t.follow}</button>}{!p.own&&<button type="button" disabled={message.isPending} onClick={()=>message.mutate(p.id)} className="min-h-11 rounded-xl border px-4 text-xs font-black disabled:opacity-50"><MessageCircle className="mr-2 inline h-4 w-4"/>{t.message}</button>}<button onClick={share} className="min-h-11 rounded-xl border px-4 text-xs font-black"><Share2 className="mr-2 inline h-4 w-4"/>{t.share}</button>'''
once(old,new,'profile message button')
p.write_text(s)
print('profile DM button connected; existing avatar upload preserved')
