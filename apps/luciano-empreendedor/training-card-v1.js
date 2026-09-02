(function () {
  "use strict";

  const PANEL_LIBRARY = "https://painel.ldrrhestrategia.com/cliente/biblioteca?produto=do-mamao-ao-negocio";
  const COPY = {
    pt: {
      badge: "TREINAMENTO · JÁ DISPONÍVEL",
      title: "Do Mamão ao Negócio",
      subtitle: "Treinamento de Empreendedorismo · 3 meses · 300 horas",
      body: "Da ideia ao projeto pronto para aplicar em qualquer negócio, com Sistema S8, teoria, quizzes, atividades, Laboratório de Campo, Projeto de Negócio, fórum e 4 encontros ao vivo.",
      features: ["Sistema S8", "300 horas", "Projeto aplicável ao seu negócio", "Certificado"],
      price: "Brasil R$ 599,99 · Europa € 100,56",
      buy: "COMPRAR TREINAMENTO",
      lectureBadge: "CONTINUE SUA JORNADA",
      lectureBody: "A palestra abre a conversa. O treinamento Do Mamão ao Negócio transforma o aprendizado em um projeto estruturado durante 3 meses.",
      know: "CONHECER TREINAMENTO"
    },
    en: {
      badge: "TRAINING · AVAILABLE NOW",
      title: "From Papaya to Business",
      subtitle: "Entrepreneurship Training · 3 months · 300 hours",
      body: "From idea to a business-ready project, with the S8 System, theory, quizzes, activities, Field Lab, Business Project, forum and 4 live meetings.",
      features: ["S8 System", "300 hours", "Project for your business", "Certificate"],
      price: "Brazil R$ 599.99 · Europe € 100.56",
      buy: "BUY TRAINING",
      lectureBadge: "CONTINUE YOUR JOURNEY",
      lectureBody: "The lecture starts the conversation. From Papaya to Business turns learning into a structured project over 3 months.",
      know: "DISCOVER THE TRAINING"
    },
    fr: {
      badge: "FORMATION · DÉJÀ DISPONIBLE",
      title: "Du Papaye au Business",
      subtitle: "Formation en entrepreneuriat · 3 mois · 300 heures",
      body: "De l’idée à un projet prêt à appliquer à votre activité, avec le Système S8, théorie, quiz, activités, Laboratoire de Terrain, Projet d’Entreprise, forum et 4 rencontres en direct.",
      features: ["Système S8", "300 heures", "Projet pour votre activité", "Certificat"],
      price: "Brésil R$ 599,99 · Europe 100,56 €",
      buy: "ACHETER LA FORMATION",
      lectureBadge: "POURSUIVEZ VOTRE PARCOURS",
      lectureBody: "La conférence ouvre la réflexion. Du Papaye au Business transforme l’apprentissage en projet structuré pendant 3 mois.",
      know: "DÉCOUVRIR LA FORMATION"
    },
    es: {
      badge: "ENTRENAMIENTO · YA DISPONIBLE",
      title: "De la Papaya al Negocio",
      subtitle: "Entrenamiento de Emprendimiento · 3 meses · 300 horas",
      body: "De la idea a un proyecto listo para aplicar en cualquier negocio, con Sistema S8, teoría, cuestionarios, actividades, Laboratorio de Campo, Proyecto de Negocio, foro y 4 encuentros en vivo.",
      features: ["Sistema S8", "300 horas", "Proyecto para tu negocio", "Certificado"],
      price: "Brasil R$ 599,99 · Europa € 100,56",
      buy: "COMPRAR ENTRENAMIENTO",
      lectureBadge: "CONTINÚA TU CAMINO",
      lectureBody: "La conferencia abre la conversación. De la Papaya al Negocio transforma el aprendizaje en un proyecto estructurado durante 3 meses.",
      know: "CONOCER EL ENTRENAMIENTO"
    }
  };

  function language() {
    const raw = (document.documentElement.lang || navigator.language || "pt").toLowerCase();
    const key = raw.slice(0, 2);
    return COPY[key] ? key : "pt";
  }

  function addStyles() {
    if (document.getElementById("ldr-training-card-styles")) return;
    const style = document.createElement("style");
    style.id = "ldr-training-card-styles";
    style.textContent = `
      .ldr-training-public{max-width:1120px;margin:42px auto 8px;padding:0 20px;box-sizing:border-box;font-family:inherit}
      .ldr-training-card{position:relative;overflow:hidden;border:1px solid #c99b4b;border-radius:24px;background:linear-gradient(145deg,#68152f 0%,#3d0b1b 100%);color:#fff8e8;box-shadow:0 22px 60px rgba(61,11,27,.22);padding:clamp(24px,5vw,52px)}
      .ldr-training-card:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-90px;top:-120px;background:rgba(201,155,75,.12);pointer-events:none}
      .ldr-training-badge{display:inline-flex;border:1px solid rgba(201,155,75,.6);border-radius:999px;padding:7px 11px;color:#e8c782;font-size:12px;font-weight:800;letter-spacing:.13em}
      .ldr-training-title{margin:17px 0 4px;font-size:clamp(30px,5vw,52px);line-height:1.02;font-family:Georgia,'Times New Roman',serif;color:#fff8e8}
      .ldr-training-subtitle{margin:0;color:#e8c782;font-weight:800;font-size:clamp(14px,2vw,18px)}
      .ldr-training-body{max-width:820px;margin:18px 0 0;line-height:1.65;color:rgba(255,248,232,.9);font-size:16px}
      .ldr-training-features{display:flex;flex-wrap:wrap;gap:9px;margin:22px 0 0;padding:0;list-style:none}
      .ldr-training-features li{border:1px solid rgba(255,248,232,.2);background:rgba(255,255,255,.07);border-radius:999px;padding:8px 12px;font-size:13px;font-weight:700}
      .ldr-training-actions{display:flex;flex-wrap:wrap;gap:15px;align-items:center;margin-top:28px}
      .ldr-training-cta{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 21px;border-radius:12px;background:#c99b4b;color:#301018!important;text-decoration:none!important;font-weight:900;letter-spacing:.03em;box-shadow:0 10px 28px rgba(0,0,0,.18);transition:transform .18s ease,filter .18s ease}
      .ldr-training-cta:hover{transform:translateY(-1px);filter:brightness(1.06)}
      .ldr-training-price{font-size:14px;font-weight:800;color:#fff8e8}
      .ldr-training-lecture{max-width:1040px;margin:34px auto 0;padding:22px 25px;border:1px solid rgba(201,155,75,.55);border-radius:18px;background:#fff8e8;color:#3d0b1b;box-shadow:0 14px 38px rgba(61,11,27,.10);box-sizing:border-box}
      .ldr-training-lecture strong{display:block;color:#68152f;font-size:12px;letter-spacing:.13em;margin-bottom:7px}
      .ldr-training-lecture p{margin:0 0 14px;line-height:1.55}
      .ldr-training-lecture a{color:#68152f!important;font-weight:900;text-decoration:underline;text-underline-offset:3px}
      @media(max-width:640px){.ldr-training-public{padding:0 14px;margin-top:28px}.ldr-training-card{border-radius:18px;padding:24px 20px}.ldr-training-actions{align-items:stretch;flex-direction:column}.ldr-training-cta{width:100%;box-sizing:border-box}.ldr-training-price{text-align:center}.ldr-training-lecture{margin-left:14px;margin-right:14px}}
    `;
    document.head.appendChild(style);
  }

  function platformCard(copy) {
    const wrap = document.createElement("div");
    wrap.className = "ldr-training-public";
    wrap.dataset.ldrTrainingCard = "plataforma";
    wrap.innerHTML = `<article class="ldr-training-card" aria-labelledby="ldr-training-title"><span class="ldr-training-badge">${copy.badge}</span><h2 class="ldr-training-title" id="ldr-training-title">${copy.title}</h2><p class="ldr-training-subtitle">${copy.subtitle}</p><p class="ldr-training-body">${copy.body}</p><ul class="ldr-training-features">${copy.features.map(x=>`<li>✓ ${x}</li>`).join("")}</ul><div class="ldr-training-actions"><a class="ldr-training-cta" href="${PANEL_LIBRARY}">${copy.buy}</a><span class="ldr-training-price">${copy.price}</span></div></article>`;
    return wrap;
  }

  function lectureCard(copy) {
    const box = document.createElement("div");
    box.className = "ldr-training-lecture";
    box.dataset.ldrTrainingCard = "palestra";
    box.innerHTML = `<strong>${copy.lectureBadge}</strong><p>${copy.lectureBody}</p><a href="#plataforma">${copy.know} →</a>`;
    return box;
  }

  function mount() {
    addStyles();
    const copy = COPY[language()] || COPY.pt;
    const platform = document.getElementById("plataforma");
    const lecture = document.getElementById("palestra");
    if (platform && !document.querySelector('[data-ldr-training-card="plataforma"]')) platform.appendChild(platformCard(copy));
    if (lecture && !document.querySelector('[data-ldr-training-card="palestra"]')) lecture.appendChild(lectureCard(copy));
    return Boolean(platform && lecture);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
  let tries = 0;
  const retry = setInterval(() => { tries++; if (mount() || tries > 20) clearInterval(retry); }, 500);
})();
