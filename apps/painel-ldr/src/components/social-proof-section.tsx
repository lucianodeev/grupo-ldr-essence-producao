import type { Locale } from "@/lib/i18n";

const COPY: Record<Locale, {
  title:string; intro:string; psycho:string; massage:string; note:string;
  psychoReviews:{name:string; date?:string; text:string}[];
  massageReviews:{name:string; date?:string; text:string}[];
}> = {
  pt: {
    title:"O que dizem sobre meu trabalho",
    intro:"Experiências de clientes em diferentes áreas da minha atuação.",
    psycho:"Psicanálise",
    massage:"Massagem e Bem-estar",
    note:"Depoimentos referentes a serviços de Psicanálise e Massagem/Bem-estar.",
    psychoReviews:[
      {name:"Thaisa",date:"02/2023",text:"Está me ajudando a me autoconhecer e estou adorando seu trabalho."},
      {name:"Jessica",date:"07/2025",text:"Luciano foi e é um achado na minha vida. Situações e sentimentos antes obscuros se tornam mais compreensíveis e, juntos, conseguimos trilhar uma nova história."},
      {name:"Jose",date:"09/2023",text:"Luciano foi extremamente atencioso, fez questionamentos pertinentes do início ao fim e tem uma escuta ativa incrível."},
      {name:"Jenifer",date:"10/2023",text:"Ótimo profissional, soube me ouvir e me ajuda com minhas queixas. Super indico!"},
      {name:"Ana",date:"04/2023",text:"Excelente profissional, me acolheu e me ajudou muito nesse momento."},
      {name:"Murilo",date:"12/2023",text:"Uma ótima primeira sessão, me senti acolhido. Um excelente profissional."}
    ],
    massageReviews:[
      {name:"Anônimo",text:"Esses dois jovens massagistas são simplesmente imbatíveis. Eles entregam exatamente o que você busca e você pode se entregar completamente à experiência. Recomendo muito."},
      {name:"armanius",date:"18/05/2026",text:"Perfeição."}
    ]
  },
  en: {
    title:"What people say about my work",
    intro:"Client experiences across different areas of my work.",
    psycho:"Psychoanalysis",
    massage:"Massage and Well-being",
    note:"Testimonials refer to Psychoanalysis and Massage/Well-being services.",
    psychoReviews:[
      {name:"Thaisa",date:"02/2023",text:"It is helping me understand myself better, and I am really enjoying his work."},
      {name:"Jessica",date:"07/2025",text:"Luciano has been a real find in my life. Feelings and situations that used to feel obscure become more understandable, and together we have been able to build a new story."},
      {name:"Jose",date:"09/2023",text:"Luciano was extremely attentive, asked relevant questions from beginning to end, and has an incredible active listening style."},
      {name:"Jenifer",date:"10/2023",text:"Great professional. He knew how to listen to me and helps me with my concerns. Highly recommended!"},
      {name:"Ana",date:"04/2023",text:"Excellent professional. He welcomed me and helped me a lot during this moment."},
      {name:"Murilo",date:"12/2023",text:"A great first session. I felt welcomed. An excellent professional."}
    ],
    massageReviews:[
      {name:"Anonymous",text:"These two young massage therapists are simply unbeatable. They give you exactly what you want and you can completely surrender to the experience. I highly recommend them."},
      {name:"armanius",date:"18/05/2026",text:"Perfection."}
    ]
  },
  fr: {
    title:"Ce que l’on dit de mon travail",
    intro:"Expériences de clients dans différents domaines de mon activité.",
    psycho:"Psychanalyse",
    massage:"Massage et bien-être",
    note:"Témoignages concernant des services de Psychanalyse et de Massage/Bien-être.",
    psychoReviews:[
      {name:"Thaisa",date:"02/2023",text:"Cela m’aide à mieux me connaître et j’apprécie beaucoup son travail."},
      {name:"Jessica",date:"07/2025",text:"Luciano a été une véritable découverte dans ma vie. Des situations et des sentiments auparavant obscurs deviennent plus compréhensibles et, ensemble, nous parvenons à construire une nouvelle histoire."},
      {name:"Jose",date:"09/2023",text:"Luciano a été extrêmement attentif, a posé des questions pertinentes du début à la fin et possède une écoute active incroyable."},
      {name:"Jenifer",date:"10/2023",text:"Excellent professionnel, il a su m’écouter et m’aide avec mes difficultés. Je le recommande vivement !"},
      {name:"Ana",date:"04/2023",text:"Excellent professionnel, il m’a accueilli et beaucoup aidé dans cette période."},
      {name:"Murilo",date:"12/2023",text:"Une très bonne première séance, je me suis senti accueilli. Un excellent professionnel."}
    ],
    massageReviews:[
      {name:"Anonyme",text:"Ces deux jeunes masseurs sont tout simplement imbattables. Ils te donnent exactement ce que tu veux et tu peux t'abandonner entièrement à eux. Je les recommande vivement."},
      {name:"armanius",date:"18.05.26",text:"Perfection"}
    ]
  },
  es: {
    title:"Lo que dicen sobre mi trabajo",
    intro:"Experiencias de clientes en diferentes áreas de mi trabajo.",
    psycho:"Psicoanálisis",
    massage:"Masaje y Bienestar",
    note:"Testimonios correspondientes a servicios de Psicoanálisis y Masaje/Bienestar.",
    psychoReviews:[
      {name:"Thaisa",date:"02/2023",text:"Me está ayudando a conocerme mejor y estoy encantada con su trabajo."},
      {name:"Jessica",date:"07/2025",text:"Luciano ha sido un gran hallazgo en mi vida. Situaciones y sentimientos antes confusos se vuelven más comprensibles y, juntos, hemos podido construir una nueva historia."},
      {name:"Jose",date:"09/2023",text:"Luciano fue extremadamente atento, hizo preguntas pertinentes de principio a fin y tiene una escucha activa increíble."},
      {name:"Jenifer",date:"10/2023",text:"Excelente profesional, supo escucharme y me ayuda con mis dificultades. ¡Lo recomiendo mucho!"},
      {name:"Ana",date:"04/2023",text:"Excelente profesional, me acogió y me ayudó mucho en este momento."},
      {name:"Murilo",date:"12/2023",text:"Una excelente primera sesión, me sentí acogido. Un excelente profesional."}
    ],
    massageReviews:[
      {name:"Anónimo",text:"Estos dos jóvenes masajistas son sencillamente imbatibles. Te dan exactamente lo que buscas y puedes entregarte por completo a la experiencia. Los recomiendo muchísimo."},
      {name:"armanius",date:"18/05/2026",text:"Perfección."}
    ]
  }
};

function ReviewCard({name,date,text}:{name:string;date?:string;text:string}){
  return <article className="rounded-2xl border bg-background p-5 shadow-sm">
    <div className="text-lg tracking-[.15em] text-[#d9aa3f]" aria-label="5 estrelas">★★★★★</div>
    <p className="mt-3 text-sm leading-7 text-foreground">“{text}”</p>
    <div className="mt-4 border-t pt-3 text-xs text-muted-foreground"><strong className="text-foreground">{name}</strong>{date?` · ${date}`:""}</div>
  </article>
}

export function SocialProofSection({locale}:{locale:Locale}){
  const c=COPY[locale];
  return <section className="overflow-hidden rounded-[2rem] border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
    <div className="mx-auto max-w-4xl text-center">
      <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{c.title}</h2>
      <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{c.intro}</p>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-serif text-2xl">{c.psycho}</h3><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">5★</span></div>
        <div className="grid gap-4 sm:grid-cols-2">{c.psychoReviews.map((r)=><ReviewCard key={`${r.name}-${r.date??""}`} {...r}/>)}</div>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-serif text-2xl">{c.massage}</h3><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">5★</span></div>
        <div className="grid gap-4">{c.massageReviews.map((r)=><ReviewCard key={`${r.name}-${r.date??""}`} {...r}/>)}</div>
      </div>
    </div>
    <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">{c.note}</p>
  </section>
}
