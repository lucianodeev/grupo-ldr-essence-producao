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

  loadOnce("ldr-training-card-original-loader", "./training-card-v1-original-20260904.js?v=37394935");
  loadOnce("ldr-platform-extra-cards-final-loader", "./platform-product-cards-final.js?v=20260904-filmux2");
  loadOnce("ldr-training-details-i18n-loader", "./training-details-i18n-v1.js?v=20260905-i18n2");
})();