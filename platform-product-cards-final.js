(function () {
  "use strict";

  const LIBRARY_URL = "https://painel.ldrrhestrategia.com/cliente/biblioteca";
  const TRAINING_ID = "ldrTrainingSalesCardFinal";
  const FILM_ID = "ldrFilmSalesCardFinal";

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
      <span class="tag">EM PRODUÇÃO</span>
      <div class="ldr-product-type">FILME</div>
      <h3 class="ldr-product-name">O Menino que Vendia Mamão</h3>
      <p>Filme em produção.</p>
    `;
    return card;
  }

  function mount() {
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
      if (mount() || attempts >= 100) clearInterval(timer);
    }, 200);

    mount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();