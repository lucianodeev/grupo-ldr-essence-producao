(function () {
  "use strict";

  const LIBRARY_URL = "https://painel.ldrrhestrategia.com/cliente/biblioteca";
  const TRAINING_ID = "ldrTrainingSalesCardFinal";
  const FILM_ID = "ldrFilmSalesCardFinal";

  function addStyles() {
    if (document.getElementById("ldr-film-card-ux-final")) return;
    const style = document.createElement("style");
    style.id = "ldr-film-card-ux-final";
    style.textContent = `
      #platformView #comprar #${FILM_ID}{
        position:relative!important;
        overflow:hidden!important;
        display:flex!important;
        flex-direction:column!important;
        min-height:100%!important;
        padding:30px 28px!important;
        background:
          radial-gradient(circle at 92% 8%,rgba(240,213,139,.11),transparent 32%),
          linear-gradient(145deg,#4b1320 0%,#351018 58%,#210b10 100%)!important;
        border:1px solid rgba(215,168,77,.52)!important;
        box-shadow:0 20px 48px rgba(10,3,7,.30)!important;
      }
      #platformView #comprar #${FILM_ID}:before{
        content:'🎬';
        display:flex;
        align-items:center;
        justify-content:center;
        width:52px;
        height:52px;
        margin:0 0 18px;
        border-radius:16px;
        background:rgba(215,168,77,.12);
        border:1px solid rgba(215,168,77,.30);
        font-size:26px;
      }
      #platformView #comprar #${FILM_ID} .ldr-film-production{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:max-content!important;
        max-width:100%!important;
        margin-bottom:12px!important;
        padding:7px 12px!important;
        border-radius:999px!important;
        background:rgba(215,168,77,.14)!important;
        color:#f0d58b!important;
        border:1px solid rgba(240,213,139,.42)!important;
        font-size:.72rem!important;
        font-weight:900!important;
        letter-spacing:.10em!important;
        text-transform:uppercase!important;
        box-shadow:none!important;
      }
      #platformView #comprar #${FILM_ID} .ldr-product-type{
        margin-top:2px!important;
        color:rgba(247,239,227,.68)!important;
      }
      #platformView #comprar #${FILM_ID} .ldr-product-name{
        margin-top:8px!important;
        margin-bottom:12px!important;
        line-height:1.08!important;
      }
      #platformView #comprar #${FILM_ID} .ldr-film-description{
        margin:0 0 24px!important;
        color:rgba(255,248,235,.88)!important;
        line-height:1.62!important;
      }
      #platformView #comprar #${FILM_ID} .ldr-film-note{
        margin-top:auto!important;
        padding-top:18px!important;
        border-top:1px solid rgba(215,168,77,.20)!important;
        color:rgba(240,213,139,.84)!important;
        font-size:.86rem!important;
        font-weight:700!important;
        line-height:1.45!important;
      }
      @media(max-width:760px){
        #platformView #comprar #${FILM_ID}{padding:24px 22px!important;min-height:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function buildTrainingCard() {
    const card = document.createElement("article");
    card.className = "card-premium";
    card.id = TRAINING_ID;
    card.setAttribute("data-ldr-extra-card-final", "training");
    card.innerHTML = `
      <span class="tag ldr-product-available">JÁ DISPONÍVEL</span>
      <div class="ldr-product-type">TREINAMENTO</div>
      <h3 class="ldr-product-name">Do Mamão ao Negócio</h3>
      <p><strong>Treinamento de Empreendedorismo</strong></p>
      <ul>
        <li>3 meses · 300 horas</li>
        <li>Acesso pela Biblioteca do Cliente</li>
      </ul>
      <a class="btn btn-block" href="${LIBRARY_URL}">Acessar Biblioteca do Cliente</a>
    `;
    return card;
  }

  function buildFilmCard() {
    const card = document.createElement("article");
    card.className = "card-premium";
    card.id = FILM_ID;
    card.setAttribute("data-ldr-extra-card-final", "film");
    card.innerHTML = `
      <span class="tag ldr-film-production">EM PRODUÇÃO</span>
      <div class="ldr-product-type">FILME</div>
      <h3 class="ldr-product-name">O Menino que Vendia Mamão</h3>
      <p class="ldr-film-description">Uma história que está ganhando vida nas telas. Produção em desenvolvimento.</p>
      <div class="ldr-film-note">Novidades serão divulgadas em breve.</div>
    `;
    return card;
  }

  function cleanupLecturePrices() {
    document.querySelectorAll("#palestraView .ldr-public-product-price, #palestra .ldr-public-product-price").forEach(function (el) {
      el.remove();
    });
  }

  function ensureFilmState() {
    const film = document.getElementById(FILM_ID);
    if (!film) return;

    const badge = film.querySelector(".tag");
    if (badge) {
      badge.textContent = "EM PRODUÇÃO";
      badge.classList.remove("ldr-product-available", "status-disponivel", "ldr-status-available");
      badge.classList.add("ldr-film-production");
      badge.removeAttribute("data-clean-copy");
      badge.style.removeProperty("background");
      badge.style.removeProperty("color");
      badge.style.removeProperty("border-color");
    }

    film.querySelectorAll(".ldr-public-product-price,[data-ldr-price],button,a.btn,.btn-block").forEach(function (el) {
      el.remove();
    });
  }

  function mount() {
    addStyles();
    cleanupLecturePrices();

    const grid = document.querySelector("#platformView #comprar .pricing-grid");
    const ebook = document.getElementById("priceCard");
    const book = document.getElementById("ldrBookSalesCard");

    if (!grid || !ebook || !book) return false;

    if (!document.getElementById(TRAINING_ID)) {
      grid.appendChild(buildTrainingCard());
    }
    if (!document.getElementById(FILM_ID)) {
      grid.appendChild(buildFilmCard());
    }

    ensureFilmState();
    cleanupLecturePrices();

    return Boolean(
      grid.querySelector("#priceCard") &&
      grid.querySelector("#ldrBookSalesCard") &&
      grid.querySelector(`#${TRAINING_ID}`) &&
      grid.querySelector(`#${FILM_ID}`)
    );
  }

  function start() {
    let attempts = 0;
    const timer = setInterval(function () {
      attempts += 1;
      mount();
      ensureFilmState();
      cleanupLecturePrices();
      if (attempts >= 100) clearInterval(timer);
    }, 200);

    mount();

    if (!window.__ldrFilmLectureCleanupObserver) {
      let scheduled = false;
      const observer = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
          scheduled = false;
          ensureFilmState();
          cleanupLecturePrices();
        });
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      window.__ldrFilmLectureCleanupObserver = observer;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();