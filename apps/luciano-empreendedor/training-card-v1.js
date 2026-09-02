(function () {
  "use strict";

  const PANEL_LIBRARY = "https://painel.ldrrhestrategia.com/cliente/biblioteca?produto=do-mamao-ao-negocio";
  const COPY = {
    pt: {
      available: "✅ JÁ DISPONÍVEL",
      trainingTitle: "Treinamento de Empreendedorismo",
      trainingPrice: "R$ 599,99 · € 100,56",
      ebookPrice: "R$ 9,90 · € 4,90",
      bookPrice: "R$ 49,90 · € 20,00",
      fallbackTitle: "Do Mamão ao Negócio",
      fallbackSubtitle: "Treinamento de Empreendedorismo · 3 meses · 300 horas",
      fallbackBody: "Da ideia ao Projeto de Negócio, com Sistema S8, quizzes, atividades, Laboratório de Campo, fórum, encontros ao vivo e certificado.",
      buy: "COMPRAR TREINAMENTO"
    },
    en: {
      available: "✅ AVAILABLE NOW",
      trainingTitle: "Entrepreneurship Training",
      trainingPrice: "R$ 599.99 · € 100.56",
      ebookPrice: "R$ 9.90 · € 4.90",
      bookPrice: "R$ 49.90 · € 20.00",
      fallbackTitle: "From Papaya to Business",
      fallbackSubtitle: "Entrepreneurship Training · 3 months · 300 hours",
      fallbackBody: "From idea to a Business Project with the S8 System, quizzes, activities, Field Lab, forum, live meetings and certificate.",
      buy: "BUY TRAINING"
    },
    fr: {
      available: "✅ DÉJÀ DISPONIBLE",
      trainingTitle: "Formation en entrepreneuriat",
      trainingPrice: "R$ 599,99 · 100,56 €",
      ebookPrice: "R$ 9,90 · 4,90 €",
      bookPrice: "R$ 49,90 · 20,00 €",
      fallbackTitle: "Du Papaye au Business",
      fallbackSubtitle: "Formation en entrepreneuriat · 3 mois · 300 heures",
      fallbackBody: "De l’idée au Projet d’Entreprise avec le Système S8, quiz, activités, Laboratoire de Terrain, forum, rencontres en direct et certificat.",
      buy: "ACHETER LA FORMATION"
    },
    es: {
      available: "✅ YA DISPONIBLE",
      trainingTitle: "Entrenamiento de Emprendimiento",
      trainingPrice: "R$ 599,99 · € 100,56",
      ebookPrice: "R$ 9,90 · € 4,90",
      bookPrice: "R$ 49,90 · € 20,00",
      fallbackTitle: "De la Papaya al Negocio",
      fallbackSubtitle: "Entrenamiento de Emprendimiento · 3 meses · 300 horas",
      fallbackBody: "De la idea al Proyecto de Negocio con Sistema S8, cuestionarios, actividades, Laboratorio de Campo, foro, encuentros en vivo y certificado.",
      buy: "COMPRAR ENTRENAMIENTO"
    }
  };

  function language() {
    const raw = (document.documentElement.lang || navigator.language || "pt").toLowerCase();
    const key = raw.slice(0, 2);
    return COPY[key] ? key : "pt";
  }

  function addStyles() {
    if (document.getElementById("ldr-training-card-styles-v2")) return;
    const style = document.createElement("style");
    style.id = "ldr-training-card-styles-v2";
    style.textContent = `
      .ldr-product-available{display:inline-flex!important;align-items:center!important;width:max-content!important;color:#166534!important;background:#dcfce7!important;border:1px solid #86efac!important;border-radius:999px!important;padding:6px 10px!important;font-weight:900!important;line-height:1.2!important}
      .ldr-public-product-price{margin:9px auto 0!important;width:max-content!important;max-width:100%!important;color:#fff8e8!important;background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,248,232,.24)!important;border-radius:999px!important;padding:6px 10px!important;font-size:12px!important;font-weight:900!important;letter-spacing:.02em!important}
      .ldr-training-fallback{max-width:1040px;margin:28px auto 0;padding:24px;border:1px solid #c99b4b;border-radius:20px;background:linear-gradient(145deg,#68152f,#3d0b1b);color:#fff8e8;text-align:center}
      .ldr-training-fallback h3{margin:10px 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:30px;color:#fff8e8}
      .ldr-training-fallback p{max-width:760px;margin:8px auto;line-height:1.55;color:#fff8e8}
      .ldr-training-fallback a{display:inline-flex;margin-top:12px;padding:11px 17px;border-radius:10px;background:#c99b4b;color:#301018!important;text-decoration:none!important;font-weight:900}
      .ldr-training-fallback .ldr-public-product-price{display:block!important;margin:12px auto 0!important}
    `;
    document.head.appendChild(style);
  }

  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function productionLabel(value) {
    const v = normalize(value).replace(/^🚀\s*/, "");
    return v === "em produção" || v === "in production" || v === "en production" || v === "en producción";
  }

  function replaceLegacyProduction(section, copy) {
    if (!section) return 0;
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    let node;
    let count = 0;
    while ((node = walker.nextNode())) {
      if (!productionLabel(node.nodeValue)) continue;
      node.nodeValue = copy.available;
      const parent = node.parentElement;
      if (parent) {
        parent.classList.add("ldr-product-available");
        parent.style.setProperty("color", "#166534", "important");
        parent.style.setProperty("background", "#dcfce7", "important");
        parent.style.setProperty("border-color", "#86efac", "important");
      }
      count += 1;
    }
    return count;
  }

  function findTextElement(section, fragments) {
    if (!section) return null;
    const candidates = Array.from(section.querySelectorAll("h1,h2,h3,h4,h5,p,strong,b,span,div"));
    return candidates.find(el => {
      const t = normalize(el.textContent);
      return fragments.some(fragment => t.includes(normalize(fragment))) && el.children.length <= 3;
    }) || null;
  }

  function cardAround(element, section) {
    if (!element) return null;
    let current = element;
    let best = null;
    for (let depth = 0; current && current !== section && depth < 8; depth += 1, current = current.parentElement) {
      const text = normalize(current.textContent);
      if (text.length >= 60 && text.length <= 1200) best = current;
      if (text.length >= 180 && /dispon|produção|production|producción/.test(text)) return current;
    }
    return best;
  }

  function addPrice(section, titleFragments, price, key) {
    const title = findTextElement(section, titleFragments);
    const card = cardAround(title, section);
    if (!card || card.querySelector(`[data-ldr-price="${key}"]`)) return false;
    const priceEl = document.createElement("div");
    priceEl.className = "ldr-public-product-price";
    priceEl.dataset.ldrPrice = key;
    priceEl.textContent = price;
    card.appendChild(priceEl);
    return true;
  }

  function makeFallback(copy, kind) {
    const box = document.createElement("div");
    box.className = "ldr-training-fallback";
    box.dataset.ldrTrainingFallback = kind;
    box.innerHTML = `<span class="ldr-product-available">${copy.available}</span><h3>${copy.fallbackTitle}</h3><p><strong>${copy.fallbackSubtitle}</strong></p><p>${copy.fallbackBody}</p><div class="ldr-public-product-price">${copy.trainingPrice}</div><a href="${PANEL_LIBRARY}">${copy.buy}</a>`;
    return box;
  }

  function ensureSection(section, copy, kind) {
    if (!section) return;
    replaceLegacyProduction(section, copy);

    addPrice(section, ["A Coragem de Começar", "Coragem de Começar"], copy.ebookPrice, `${kind}-ebook`);
    addPrice(section, ["O Menino que Vendia Mamão", "Menino que Vendia Mamão"], copy.bookPrice, `${kind}-book`);
    const trainingPriceAdded = addPrice(section, ["Treinamento de Empreendedorismo", copy.trainingTitle], copy.trainingPrice, `${kind}-training`);

    const hasTraining = Boolean(findTextElement(section, ["Treinamento de Empreendedorismo", copy.trainingTitle]));
    const oldFallback = section.querySelector(`[data-ldr-training-fallback="${kind}"]`);
    if (hasTraining) {
      if (oldFallback) oldFallback.remove();
    } else if (!oldFallback) {
      section.appendChild(makeFallback(copy, kind));
    }

    // O filme permanece exatamente como está. O texto "Em pré-produção" não é alterado.
    return trainingPriceAdded;
  }

  function mount() {
    addStyles();
    const copy = COPY[language()] || COPY.pt;
    ensureSection(document.getElementById("plataforma"), copy, "plataforma");
    ensureSection(document.getElementById("palestra"), copy, "palestra");
  }

  function start() {
    mount();
    if (!window.__ldrProductStatusObserver) {
      let scheduled = false;
      const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => { scheduled = false; mount(); });
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      window.__ldrProductStatusObserver = observer;
    }
    let tries = 0;
    const retry = setInterval(() => { mount(); tries += 1; if (tries > 30) clearInterval(retry); }, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
