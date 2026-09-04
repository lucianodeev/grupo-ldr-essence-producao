(function () {
  "use strict";

  function loadOnce(id, src) {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  }

  function loadStyleOnce(id, href) {
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  loadStyleOnce("ldr-button-colors-fix", "./button-colors-fix.css?v=20260905-buttons1");
  loadOnce("ldr-training-card-original-loader", "./training-card-v1-original-20260904.js?v=37394935");
  loadOnce("ldr-platform-extra-cards-final-loader", "./platform-product-cards-final.js?v=20260905-langsync2");
  loadOnce("ldr-global-i18n-reload-loader", "./global-i18n-reload-v1.js?v=20260905-fullsite1");
})();
